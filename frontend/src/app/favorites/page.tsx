"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { FAVORITE_API_URL } from "@/config";
import { Heart, Trash2, Star, Calendar, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface FavoriteMovie {
  id: number;
  title: string;
  rating: number;
  releaseDate: string;
  poster: string | null;
  overview: string;
}

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteMovie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("moviebox_user");
    const token = localStorage.getItem("moviebox_token");

    if (!savedUser || !token) {
      router.push("/");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem("moviebox_user");
        localStorage.removeItem("moviebox_token");
        router.push("/");
        return;
      }
      setUser(JSON.parse(savedUser));
    } catch (e) {
      localStorage.removeItem("moviebox_user");
      localStorage.removeItem("moviebox_token");
      router.push("/");
      return;
    }

    fetch(`${FAVORITE_API_URL}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: FavoriteMovie[]) => {
        setFavorites(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading favorites:", err);
        setLoading(false);
      });
  }, [router]);

  const removeFav = async (movieId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("moviebox_token");
    if (!token) return;

    try {
      await fetch(`${FAVORITE_API_URL}/${movieId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites((prev) => prev.filter((m) => m.id !== movieId));
    } catch (err) {
      console.error("Failed to remove favorite:", err);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("moviebox_token");
    localStorage.removeItem("moviebox_user");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white font-sans">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Title Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                My Favorite Movies
              </h1>
              <p className="text-xs text-zinc-400">
                {favorites.length} movies saved in your collection
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
        ) : favorites.length === 0 ? (
          <div className="w-full py-16 rounded-3xl bg-zinc-900/40 border border-zinc-800 flex flex-col items-center gap-3 text-center">
            <Heart className="w-12 h-12 text-zinc-600 stroke-[1.5]" />
            <h3 className="text-base font-bold text-white">No favorite movies saved yet</h3>
            <p className="text-xs text-zinc-400 max-w-sm">
              Explore movies on the dashboard and click "Add to Favorites" to build your collection!
            </p>
            <Link
              href="/"
              className="mt-2 px-6 py-2.5 rounded-full bg-yellow-400 text-black text-xs font-extrabold hover:bg-yellow-300 transition-all shadow-lg shadow-yellow-500/20"
            >
              Explore Movies
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {favorites.map((movie) => (
              <Link key={movie.id} href={`/movie/${movie.id}`}>
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

                    {/* Delete Favorite Button */}
                    <button
                      onClick={(e) => removeFav(movie.id, e)}
                      title="Remove from Favorites"
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center border border-white/20 transition-all z-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
