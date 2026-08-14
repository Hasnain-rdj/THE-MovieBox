"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { API_BASE_URL } from "@/config";
import { Layers, Calendar, Star, Play, Sparkles, Film, Tv } from "lucide-react";
import { motion } from "framer-motion";

interface CollectionItem {
  id: number;
  title: string;
  type: "movie" | "series";
  overview: string;
  rating: number;
  releaseDate: string;
  poster: string | null;
  backdrop: string | null;
}

interface CollectionData {
  id: string;
  name: string;
  overview: string;
  poster: string | null;
  backdrop: string | null;
  movies: CollectionItem[];
}

const COLLECTIONS_LIST = [
  { id: "86311", name: "Marvel Cinematic Universe (MCU)", key: "mcu" },
  { id: "209131", name: "DC Extended Universe (DCEU)", key: "dceu" },
  { id: "10", name: "Star Wars Saga", key: "star-wars" },
  { id: "1241", name: "Wizarding World (Harry Potter)", key: "harry-potter" },
  { id: "9799", name: "Fast & Furious Saga", key: "fast" },
  { id: "119", name: "Lord of the Rings Saga", key: "lotr" },
];

export default function CollectionsPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string>("86311");
  const [filterType, setFilterType] = useState<"all" | "movie" | "series">("all");
  const [collection, setCollection] = useState<CollectionData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("moviebox_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/collections/${selectedId}?type=${filterType}`)
      .then((res) => res.json())
      .then((data: CollectionData) => {
        setCollection(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load collection:", err);
        setLoading(false);
      });
  }, [selectedId, filterType]);

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
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-yellow-400" />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              World Franchise Collections & Sagas
            </h1>
          </div>
          <p className="text-xs text-zinc-400">
            Explore world sagas containing all Movies & TV Series in strict chronological release order.
          </p>
        </div>

        {/* Collection Selector Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {COLLECTIONS_LIST.map((col) => {
            const isActive = selectedId === col.id;
            return (
              <button
                key={col.id}
                onClick={() => setSelectedId(col.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  isActive
                    ? "bg-yellow-400 text-black border-yellow-400 shadow-lg shadow-yellow-400/20 scale-105"
                    : "bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white"
                }`}
              >
                {col.name}
              </button>
            );
          })}
        </div>

        {/* Collection Banner */}
        {loading ? (
          <div className="w-full h-72 rounded-3xl bg-zinc-900/60 animate-pulse border border-zinc-800 flex items-center justify-center">
            <span className="text-zinc-500 text-sm">Loading collection saga...</span>
          </div>
        ) : collection ? (
          <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900 p-6 md:p-10 flex items-end min-h-[300px]">
            {collection.backdrop && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-40"
                style={{ backgroundImage: `url(${collection.backdrop})` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f12] via-[#0d0f12]/60 to-transparent" />
            <div className="relative z-10 space-y-3 max-w-3xl">
              <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Chronological Franchise Saga ({collection.movies.length} Title{collection.movies.length !== 1 ? "s" : ""})
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                {collection.name}
              </h2>
              {collection.overview && (
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {collection.overview}
                </p>
              )}
            </div>
          </div>
        ) : null}

        {/* Media Type Filter Controls (All / Movies / Series) */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <h3 className="text-lg font-bold text-white tracking-wide">
            Chronological Timeline
          </h3>

          <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 p-1 rounded-full">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                filterType === "all"
                  ? "bg-yellow-400 text-black shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              All (Movies + Series)
            </button>
            <button
              onClick={() => setFilterType("movie")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                filterType === "movie"
                  ? "bg-yellow-400 text-black shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              Movies
            </button>
            <button
              onClick={() => setFilterType("series")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                filterType === "series"
                  ? "bg-yellow-400 text-black shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              TV Series
            </button>
          </div>
        </div>

        {/* Chronological Grid */}
        {collection && (
          <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {collection.movies.map((item, idx) => (
              <Link key={item.id} href={`/movie/${item.id}`}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="group cursor-pointer flex flex-col gap-2 relative"
                >
                  <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 group-hover:border-yellow-500/50 transition-all shadow-md">
                    <img
                      src={
                        item.poster ||
                        "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=400"
                      }
                      alt={item.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=400";
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Order Index Badge */}
                    <div className="absolute top-2.5 left-2.5 bg-yellow-400 text-black font-black text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                      {idx + 1}
                    </div>

                    {/* Type Badge (Movie vs Series) */}
                    <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {item.type === "series" ? "TV Series" : "Movie"}
                    </div>

                    {/* Play Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-yellow-400 text-black flex items-center justify-center shadow-xl">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-white group-hover:text-yellow-400 transition-colors truncate">
                    {item.title}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                      <Star className="w-3 h-3 fill-yellow-400" />
                      {item.rating ? item.rating.toFixed(1) : "N/A"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {item.releaseDate ? item.releaseDate.split("-")[0] : "N/A"}
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
