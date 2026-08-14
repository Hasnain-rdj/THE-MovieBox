"use client";

import Link from "next/link";
import { Star, MessageSquare, Play } from "lucide-react";
import { motion } from "framer-motion";
import { Movie } from "./HeroBanner";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const formattedRating = movie.rating ? movie.rating.toFixed(1) : "4.8";

  return (
    <Link href={`/movie/${movie.id}`}>
      <motion.div
        whileHover={{ y: -6, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group cursor-pointer flex flex-col gap-2.5 transition-all"
      >
        {/* Poster Image Container */}
        <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800/80 shadow-lg group-hover:shadow-yellow-500/10 group-hover:border-zinc-700 transition-all">
          <img
            src={
              movie.poster ||
              movie.backdrop ||
              "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=400"
            }
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Dark Hover Gradient & Play Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-yellow-400 text-black flex items-center justify-center shadow-xl shadow-yellow-400/30 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <Play className="w-6 h-6 fill-current ml-0.5" />
            </div>
          </div>

          {/* Rating Overlay */}
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 text-[11px] font-semibold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
            <span className="flex items-center gap-1 text-yellow-400">
              <Star className="w-3 h-3 fill-yellow-400" />
              {formattedRating} iMDB
            </span>
            <span className="flex items-center gap-1 text-zinc-300">
              <MessageSquare className="w-3 h-3" />
              18
            </span>
          </div>
        </div>

        {/* Movie Title */}
        <h3 className="text-sm font-bold text-white group-hover:text-yellow-400 transition-colors truncate px-1">
          {movie.title}
        </h3>
      </motion.div>
    </Link>
  );
}
