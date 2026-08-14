"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MovieCard from "./MovieCard";
import { Movie } from "./HeroBanner";

interface MovieGridProps {
  title: string;
  movies: Movie[];
  isLoading?: boolean;
}

export default function MovieGrid({
  title,
  movies,
  isLoading = false,
}: MovieGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="w-full my-8 flex flex-col gap-4">
      {/* Header with Title & Navigation Arrows */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-bold text-white tracking-wide">{title}</h2>

        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Movie Cards Slider / Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="aspect-[2/3] rounded-2xl bg-zinc-900/60 border border-zinc-800/60 animate-pulse"
            />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="w-full py-12 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 text-center">
          <p className="text-zinc-500 text-sm">No movies found.</p>
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="grid grid-flow-col auto-cols-[calc(50%-10px)] sm:auto-cols-[calc(33.33%-14px)] md:auto-cols-[calc(25%-15px)] lg:auto-cols-[calc(16.66%-16px)] gap-5 overflow-x-auto scrollbar-none py-1 scroll-smooth"
        >
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </section>
  );
}
