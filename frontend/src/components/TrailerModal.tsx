"use client";

import { useEffect, useState } from "react";
import { MOVIE_API_URL } from "@/config";
import { X, Star, Calendar, Users, Film, AlertCircle } from "lucide-react";
import { Movie } from "./HeroBanner";

interface MovieDetails extends Movie {
  trailerKey?: string | null;
  trailerUrl?: string | null;
  genres?: string[];
  actors?: { id: number; name: string; character: string; profilePath: string | null }[];
}

interface TrailerModalProps {
  movie: Movie | null;
  onClose: () => void;
}

export default function TrailerModal({ movie, onClose }: TrailerModalProps) {
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!movie) return;

    setLoading(true);
    setError(null);
    setDetails(null);

    fetch(`${MOVIE_API_URL}/${movie.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load movie details");
        return res.json();
      })
      .then((data: MovieDetails) => {
        setDetails(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching movie details:", err);
        setError("Unable to load movie details or trailer.");
        setLoading(false);
      });
  }, [movie]);

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md transition-all animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#111317] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-zinc-800 text-white flex items-center justify-center border border-white/10 transition-all"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Video Player Container */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden shrink-0">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-zinc-400">
              <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Fetching official trailer...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-2 text-red-400 px-4 text-center">
              <AlertCircle className="w-8 h-8" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          ) : details?.trailerKey ? (
            <iframe
              src={`https://www.youtube.com/embed/${details.trailerKey}?autoplay=1&rel=0`}
              title={`${details.title} Official Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div className="relative w-full h-full flex items-center justify-center bg-zinc-900">
              {details?.backdrop && (
                <img
                  src={details.backdrop}
                  alt={details.title}
                  className="w-full h-full object-cover opacity-40"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#111317] via-transparent to-black/60" />
              <div className="absolute flex flex-col items-center gap-2 text-zinc-300 z-10 px-4 text-center">
                <Film className="w-10 h-10 text-yellow-400" />
                <span className="text-sm font-bold text-white">
                  No official trailer available for this movie
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Movie Info Content (Scrollable) */}
        {details && (
          <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar text-left">
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {details.title}
                </h2>
                <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-zinc-400 flex-wrap">
                  <span className="flex items-center gap-1 text-yellow-400 font-bold bg-yellow-400/10 px-2.5 py-0.5 rounded-full border border-yellow-400/20">
                    <Star className="w-3.5 h-3.5 fill-yellow-400" />
                    {details.rating ? details.rating.toFixed(1) : "N/A"} iMDB
                  </span>
                  <span className="flex items-center gap-1 text-zinc-300">
                    <Calendar className="w-3.5 h-3.5" />
                    {details.releaseDate || "N/A"}
                  </span>
                  {details.genres?.map((genre: string, idx: number) => (
                    <span
                      key={idx}
                      className="bg-zinc-800/80 text-zinc-300 px-2.5 py-0.5 rounded-full border border-zinc-700/50"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Overview */}
            {details.overview && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Overview
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {details.overview}
                </p>
              </div>
            )}

            {/* Cast List */}
            {details.actors && details.actors.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-yellow-400" />
                  Cast
                </h3>
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {details.actors.map((actor) => (
                    <div
                      key={actor.id}
                      className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800/80 rounded-full pl-1 pr-3 py-1 shrink-0"
                    >
                      <div className="w-7 h-7 rounded-full bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700">
                        {actor.profilePath ? (
                          <img
                            src={actor.profilePath}
                            alt={actor.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400 font-bold">
                            {actor.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-white leading-none">
                          {actor.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 leading-tight truncate max-w-[90px]">
                          {actor.character}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
