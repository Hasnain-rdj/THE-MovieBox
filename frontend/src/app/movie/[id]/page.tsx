"use client";

import { useEffect, useState, use, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { MOVIE_API_URL, FAVORITE_API_URL } from "@/config";
import {
  ArrowLeft,
  Star,
  Calendar,
  Heart,
  Film,
  Users,
  Play,
  Check,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  rating: number;
  voteCount: number;
  releaseDate: string;
  genres: string[];
  poster: string | null;
  backdrop: string | null;
  actors: { id: number; name: string; character: string; profilePath: string | null }[];
  images: string[];
  trailerKey: string | null;
  trailerUrl: string | null;
}

function MovieDetailsContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const movieId = resolvedParams.id;
  const mediaType = searchParams.get("type") || undefined;

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [favLoading, setFavLoading] = useState<boolean>(false);
  const [showTrailer, setShowTrailer] = useState<boolean>(false);

  // Check user session
  useEffect(() => {
    const savedUser = localStorage.getItem("moviebox_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {}
    }
  }, []);

  // Fetch Movie Details
  useEffect(() => {
    if (!movieId) return;
    setLoading(true);
    const typeParam = mediaType ? `?type=${mediaType}` : "";
    fetch(`${MOVIE_API_URL}/${movieId}${typeParam}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch movie details");
        return res.json();
      })
      .then((data: MovieDetails) => {
        setMovie(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load movie details.");
        setLoading(false);
      });
  }, [movieId]);

  // Check if movie is in user's favorites
  useEffect(() => {
    const token = localStorage.getItem("moviebox_token");
    if (!token || !movieId) return;

    fetch(`${FAVORITE_API_URL}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((favs: any[]) => {
        const found = favs.some((f) => String(f.id) === String(movieId));
        setIsFavorite(found);
      })
      .catch(() => {});
  }, [movieId]);

  const toggleFavorite = async () => {
    const token = localStorage.getItem("moviebox_token");
    if (!token) {
      alert("Please log in to add movies to your favorites.");
      return;
    }

    setFavLoading(true);
    try {
      if (isFavorite) {
        await fetch(`${FAVORITE_API_URL}/${movieId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsFavorite(false);
      } else {
        await fetch(`${FAVORITE_API_URL}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tmdbMovieId: Number(movieId) }),
        });
        setIsFavorite(true);
      }
    } catch (err) {
      console.error("Favorite toggle failed:", err);
    } finally {
      setFavLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("moviebox_token");
    localStorage.removeItem("moviebox_user");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0f12] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-zinc-400">Loading movie details...</span>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-[#0d0f12] text-white flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 font-bold">{error || "Movie not found"}</p>
        <Link href="/" className="px-5 py-2 rounded-full bg-zinc-800 text-xs font-bold hover:bg-zinc-700">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white font-sans">
      <Navbar user={user} onLogout={handleLogout} />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Smart Back Button using browser history */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors bg-zinc-900/80 border border-zinc-800 px-4 py-2 rounded-full cursor-pointer hover:border-zinc-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Hero Backdrop Banner & Trailer Section */}
        <div className="relative rounded-3xl overflow-hidden border border-zinc-800/80 shadow-2xl bg-zinc-900">
          {showTrailer && movie.trailerKey ? (
            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1&rel=0`}
                title={`${movie.title} Official Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          ) : (
            <div className="relative min-h-[450px] md:min-h-[500px] flex items-end p-6 md:p-10">
              {/* Backdrop image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${movie.backdrop || movie.poster})`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f12] via-[#0d0f12]/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0d0f12] via-[#0d0f12]/40 to-transparent" />

              {/* Hero details info */}
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-end w-full">
                {/* Left Poster Thumbnail */}
                <div className="hidden md:block md:col-span-3 shrink-0">
                  <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
                    <img
                      src={movie.poster || movie.backdrop || ""}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Right Text Info */}
                <div className="md:col-span-9 flex flex-col gap-3">
                  {/* Genres */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {movie.genres.map((genre, idx) => (
                      <span
                        key={idx}
                        className="bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 text-[11px] font-bold px-3 py-1 rounded-full"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
                    {movie.title}
                  </h1>

                  {/* Metadata Stats */}
                  <div className="flex items-center gap-4 text-xs font-semibold text-zinc-300">
                    <span className="flex items-center gap-1.5 text-yellow-400 font-bold">
                      <Star className="w-4 h-4 fill-yellow-400" />
                      {movie.rating ? movie.rating.toFixed(1) : "N/A"} iMDB
                    </span>
                    <span className="flex items-center gap-1.5 text-zinc-300">
                      <Calendar className="w-4 h-4 text-zinc-400" />
                      {movie.releaseDate || "N/A"}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-300 max-w-3xl leading-relaxed mt-1">
                    {movie.overview}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-4 mt-3">
                    {movie.trailerKey && (
                      <button
                        onClick={() => setShowTrailer(true)}
                        className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-extrabold px-6 py-3 rounded-full transition-all shadow-lg shadow-yellow-500/20 active:scale-95"
                      >
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                        Watch Trailer
                      </button>
                    )}

                    <button
                      onClick={toggleFavorite}
                      disabled={favLoading}
                      className={`flex items-center gap-2 text-xs font-bold px-5 py-3 rounded-full border transition-all ${
                        isFavorite
                          ? "bg-red-500/20 border-red-500 text-red-400"
                          : "bg-zinc-900/80 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                      <span>{isFavorite ? "In Favorites" : "Add to Favorites"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Cast / Actor Grid */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-bold text-white tracking-wide">
              Top Cast & Crew
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {movie.actors.map((actor) => (
              <Link key={actor.id} href={`/person/${actor.id}`}>
                <motion.div
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-zinc-900/80 border border-zinc-800 hover:border-yellow-500/50 rounded-2xl p-3 flex flex-col items-center text-center cursor-pointer transition-all group"
                >
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-3 bg-zinc-800 border-2 border-zinc-700 group-hover:border-yellow-400 transition-colors shadow-md">
                    {actor.profilePath ? (
                      <img
                        src={actor.profilePath}
                        alt={actor.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-lg text-zinc-500">
                        {actor.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-bold text-white group-hover:text-yellow-400 transition-colors truncate w-full">
                    {actor.name}
                  </span>
                  <span className="text-[11px] text-zinc-400 truncate w-full mt-0.5">
                    {actor.character}
                  </span>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        {/* Backdrop Gallery */}
        {movie.images && movie.images.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl font-bold text-white tracking-wide">
                Photo Gallery
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {movie.images.slice(0, 4).map((img, idx) => (
                <div key={idx} className="aspect-video rounded-2xl overflow-hidden border border-zinc-800">
                  <img src={img} alt="Backdrop" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default function MovieDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0d0f12] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MovieDetailsContent params={params} />
    </Suspense>
  );
}
