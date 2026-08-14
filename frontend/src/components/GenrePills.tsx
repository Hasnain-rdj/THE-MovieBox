"use client";

import {
  Swords,
  Laugh,
  Landmark,
  Theater,
  Rocket,
  Wand2,
  Music,
  Video,
  Sparkles,
} from "lucide-react";

export interface GenreOption {
  id: string;
  tmdbId: string;
  name: string;
  icon: any;
}

const genres: GenreOption[] = [
  { id: "all", tmdbId: "all", name: "All Genres", icon: Sparkles },
  { id: "action", tmdbId: "28", name: "Action", icon: Swords },
  { id: "comedy", tmdbId: "35", name: "Comedy", icon: Laugh },
  { id: "historical", tmdbId: "36", name: "Historical", icon: Landmark },
  { id: "drama", tmdbId: "18", name: "Drama", icon: Theater },
  { id: "scifi", tmdbId: "878", name: "Sci-fi", icon: Rocket },
  { id: "fantasy", tmdbId: "14", name: "Fantasy", icon: Wand2 },
  { id: "music", tmdbId: "10402", name: "Music", icon: Music },
  { id: "documentary", tmdbId: "99", name: "Documentary", icon: Video },
];

interface GenrePillsProps {
  selectedGenre: string;
  onSelectGenre: (tmdbGenreId: string) => void;
}

export default function GenrePills({
  selectedGenre,
  onSelectGenre,
}: GenrePillsProps) {
  return (
    <div className="w-full my-6 flex flex-col md:flex-row md:items-center gap-4">
      <span className="text-sm font-bold text-white shrink-0 tracking-wide">
        Find by genre
      </span>

      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {genres.map((g) => {
          const Icon = g.icon;
          const isActive = selectedGenre === g.tmdbId;

          return (
            <button
              key={g.id}
              onClick={() => onSelectGenre(g.tmdbId)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${isActive
                ? "bg-yellow-400 text-black border-yellow-400 shadow-lg shadow-yellow-400/20 font-bold scale-105"
                : "bg-zinc-900/60 text-zinc-300 border-zinc-800 hover:border-zinc-600 hover:text-white hover:bg-zinc-800/80"
                }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-black" : "text-zinc-400"}`} />
              <span>{g.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
