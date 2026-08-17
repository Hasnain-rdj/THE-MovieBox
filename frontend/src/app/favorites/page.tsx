"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { FAVORITE_API_URL } from "@/config";
import { Heart, Trash2, Star, Calendar, ArrowLeft, Film, Tv, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface FavoriteMovie {
  id: number;
  title: string;
  rating: number;
  releaseDate: string;
  poster: string | null;
  overview: string;
  mediaType?: "movie" | "series" | "tv";
}

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteMovie[]>([]);
  const [filterType, setFilterType] = useState<"all" | "movie" | "series">("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  const fetchFavorites = useCallback(async (isManualRefresh = false) => {
    const savedUser = localStorage.getItem("moviebox_user");
    const token = localStorage.getItem("moviebox_token");

    if (!savedUser || !token) {
      router.push("/");
      return;
    }

    try {
      const base64Url = token.split(".")[1];
      if (base64Url) {
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(window.atob(base64));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          localStorage.removeItem("moviebox_user");
          localStorage.removeItem("moviebox_token");
          router.push("/");
          return;
        }
      }
      setUser(JSON.parse(savedUser));
    } catch (e) {
      console.warn("Token validation parse note:", e);
    }

    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch(`${FAVORITE_API_URL}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setFavorites(data);
          sessionStorage.setItem("moviebox_cached_favorites", JSON.stringify(data));
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch favorites:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const removeFav = async (movieId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("moviebox_token");
    if (!token) return;

    // Optimistically update UI immediately
    const updated = favorites.filter((m) => m.id !== movieId);
    setFavorites(updated);
    sessionStorage.setItem("moviebox_cached_favorites", JSON.stringify(updated));

    try {
      await fetch(`${FAVORITE_API_URL}/${movieId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Failed to remove favorite:", err);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("moviebox_token");
    localStorage.removeItem("moviebox_user");
    sessionStorage.removeItem("moviebox_cached_favorites");
    router.push("/");
  };

  const filteredFavorites = favorites.filter((item) => {
    if (filterType === "all") return true;
    if (filterType === "series") return item.mediaType === "series" || item.mediaType === "tv";
    return item.mediaType === "movie" || !item.mediaType;
  });

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white font-sans">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 lg:pb-8 space-y-8">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  My Favorite Collection
                </h1>
                <button
                  onClick={() => fetchFavorites(true)}
                  title="Sync with database"
                  className={`p-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-yellow-400 hover:border-yellow-500/40 transition-all cursor-pointer ${
                    refreshing ? "animate-spin text-yellow-400" : ""
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-zinc-400">
                {favorites.length} titles saved in your personal collection
              </p>
            </div>
          </div>

          <button
            onClick={() => router.back()}
            className="hidden sm:inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full cursor-pointer hover:border-zinc-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Filter Controls (All / Movies / TV Series) */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
            Filter Favorites
          </h3>

          <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 p-1 rounded-full">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterType === "all"
                  ? "bg-yellow-400 text-black shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              All ({favorites.length})
            </button>
            <button
              onClick={() => setFilterType("movie")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterType === "movie"
                  ? "bg-yellow-400 text-black shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              Movies ({favorites.filter((f) => f.mediaType === "movie" || !f.mediaType).length})
            </button>
            <button
              onClick={() => setFilterType("series")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterType === "series"
                  ? "bg-yellow-400 text-black shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              TV Series ({favorites.filter((f) => f.mediaType === "series" || f.mediaType === "tv").length})
            </button>
          </div>
        </div>

        {/* Favorites Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="aspect-[2/3] rounded-2xl bg-zinc-900/60 animate-pulse border border-zinc-800"
              />
            ))}
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="w-full py-16 rounded-3xl bg-zinc-900/40 border border-zinc-800 flex flex-col items-center gap-3 text-center">
            <Heart className="w-12 h-12 text-zinc-600 stroke-[1.5]" />
            <h3 className="text-base font-bold text-white">
              {filterType === "all" ? "No favorite titles saved yet" : `No favorite ${filterType === "series" ? "TV Series" : "Movies"} found`}
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm">
              Explore movies & TV series and click the Heart icon on any poster to build your collection!
            </p>
            <Link
              href="/"
              className="mt-2 px-6 py-2.5 rounded-full bg-yellow-400 text-black text-xs font-extrabold hover:bg-yellow-300 transition-all shadow-lg shadow-yellow-500/20"
            >
              Explore Titles
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {filteredFavorites.map((movie) => {
              const isSeries = movie.mediaType === "series" || movie.mediaType === "tv";
              return (
                <Link key={movie.id} href={`/movie/${movie.id}${isSeries ? "?type=tv" : ""}`}>
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="group cursor-pointer flex flex-col gap-2 relative"
                  >
                    <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 group-hover:border-yellow-500/50 transition-all shadow-md">
                      {movie.poster ? (
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500 font-bold p-2 text-center">
                          {movie.title}
                        </div>
                      )}

                      {/* Remove Favorite Button Top Right */}
                      <button
                        onClick={(e) => removeFav(movie.id, e)}
                        title="Remove from favorites"
                        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all cursor-pointer z-10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Media Type Badge Top Left */}
                      <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {isSeries ? "TV Series" : "Movie"}
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-white group-hover:text-yellow-400 transition-colors truncate">
                      {movie.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                        <Star className="w-3 h-3 fill-yellow-400" />
                        {movie.rating ? movie.rating.toFixed(1) : "N/A"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {movie.releaseDate ? movie.releaseDate.split("-")[0] : "N/A"}
                      </span>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
