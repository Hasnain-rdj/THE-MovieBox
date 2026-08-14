"use client";

import Link from "next/link";
import { Play, Star, MessageSquare, Eye } from "lucide-react";
import { motion } from "framer-motion";

export interface Movie {
  id: number;
  title: string;
  rating: number;
  voteCount?: number;
  releaseDate?: string;
  poster: string | null;
  backdrop: string | null;
  overview?: string;
}

interface HeroBannerProps {
  featuredMovie: Movie | null;
  sideMovies: Movie[];
}

export default function HeroBanner({
  featuredMovie,
  sideMovies,
}: HeroBannerProps) {
  if (!featuredMovie) {
    return (
      <div className="w-full h-80 rounded-3xl bg-zinc-900/60 animate-pulse border border-zinc-800/60 flex items-center justify-center">
        <span className="text-zinc-500 text-sm">Loading featured movie...</span>
      </div>
    );
  }

  const releaseYear = featuredMovie.releaseDate
    ? new Date(featuredMovie.releaseDate).getFullYear()
    : "2025";

  const formattedRating = featuredMovie.rating
    ? featuredMovie.rating.toFixed(1)
    : "4.8";

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 my-6">
      {/* Main Big Featured Banner (8 Cols) */}
      <Link href={`/movie/${featuredMovie.id}`} className="lg:col-span-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative h-[380px] sm:h-[440px] rounded-3xl overflow-hidden group cursor-pointer border border-zinc-800/80 shadow-2xl transition-all"
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage: `url(${
                featuredMovie.backdrop ||
                featuredMovie.poster ||
                "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200"
              })`,
            }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f12] via-[#0d0f12]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0f12]/90 via-[#0d0f12]/30 to-transparent" />

          {/* Carousel Indicators Top Left */}
          <div className="absolute top-6 left-8 flex items-center gap-2 z-10">
            <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15]" />
            <span className="w-2 h-2 rounded-full bg-zinc-600/80" />
            <span className="w-2 h-2 rounded-full bg-zinc-600/80" />
            <span className="w-2 h-2 rounded-full bg-zinc-600/80" />
          </div>

          {/* Big Circular Play Button Center/Right */}
          <div className="absolute right-8 sm:right-16 bottom-16 sm:bottom-24 z-20">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-yellow-400 group-hover:text-black group-hover:border-yellow-300">
              <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-current ml-1" />
            </div>
          </div>

          {/* Content Info Bottom Left */}
          <div className="absolute bottom-8 left-8 right-32 z-10 flex flex-col gap-2.5">
            <span className="text-xs font-semibold text-yellow-400 tracking-wider">
              {releaseYear}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-none drop-shadow-md truncate">
              {featuredMovie.title}
            </h1>
            <div className="flex items-center gap-4 text-xs text-zinc-300 mt-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Eye className="w-3.5 h-3.5 text-zinc-400" />
                {featuredMovie.voteCount || 243}
              </span>
              <span className="flex items-center gap-1.5 font-bold text-yellow-400">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                {formattedRating} iMDB
              </span>
              <span className="flex items-center gap-1.5 font-medium text-zinc-400">
                <MessageSquare className="w-3.5 h-3.5" />
                18
              </span>
            </div>
          </div>
        </motion.div>
      </Link>

      {/* Side "Now watching" Stack (4 Cols) */}
      <div className="lg:col-span-4 flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-white tracking-wide">
            Now watching
          </h2>
          <span className="text-xs font-medium text-zinc-400">Featured</span>
        </div>

        <div className="flex flex-col gap-3">
          {sideMovies.slice(0, 3).map((movie, idx) => (
            <Link key={movie.id || idx} href={`/movie/${movie.id}`}>
              <motion.div
                whileHover={{ x: 4 }}
                className="flex items-center gap-4 p-2.5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/60 transition-all cursor-pointer group"
              >
                {/* Thumbnail */}
                <div className="relative w-24 h-16 rounded-xl overflow-hidden shrink-0 bg-zinc-800 border border-zinc-700/50">
                  <img
                    src={
                      movie.backdrop ||
                      movie.poster ||
                      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=300"
                    }
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all">
                    <div className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white group-hover:bg-yellow-400 group-hover:text-black group-hover:border-yellow-400 transition-all">
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Title & Metadata */}
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-white truncate group-hover:text-yellow-400 transition-colors">
                    {movie.title}
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                      <Star className="w-3 h-3 fill-yellow-400" />
                      {movie.rating ? movie.rating.toFixed(1) : "4.8"} iMDB
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      18
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
