"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { PERSON_API_URL } from "@/config";
import { ArrowLeft, Calendar, MapPin, Film, Star, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";

interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  placeOfBirth: string | null;
  knownForDepartment: string;
  profilePath: string | null;
  filmography: {
    id: number;
    title: string;
    character: string;
    rating: number;
    releaseDate: string;
    poster: string | null;
    backdrop: string | null;
  }[];
}

export default function PersonDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const personId = resolvedParams.id;

  const [person, setPerson] = useState<PersonDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
    if (!personId) return;
    setLoading(true);
    fetch(`${PERSON_API_URL}/${personId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch actor details");
        return res.json();
      })
      .then((data: PersonDetails) => {
        setPerson(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load actor details.");
        setLoading(false);
      });
  }, [personId]);

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
          <span className="text-sm font-semibold text-zinc-400">Loading actor profile...</span>
        </div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="min-h-screen bg-[#0d0f12] text-white flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 font-bold">{error || "Actor not found"}</p>
        <button
          onClick={() => router.back()}
          className="px-5 py-2 rounded-full bg-zinc-800 text-xs font-bold hover:bg-zinc-700 cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white font-sans">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Smart Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors bg-zinc-900/80 border border-zinc-800 px-4 py-2 rounded-full cursor-pointer hover:border-zinc-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Actor Header Info Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl items-start">
          {/* Left Profile Image */}
          <div className="md:col-span-4 lg:col-span-3">
            <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden border-2 border-zinc-700 bg-zinc-800 shadow-xl">
              {person.profilePath ? (
                <img
                  src={person.profilePath}
                  alt={person.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-black text-4xl text-zinc-600">
                  {person.name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Right Info Details */}
          <div className="md:col-span-8 lg:col-span-9 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-yellow-400">
              {person.knownForDepartment || "Acting"}
            </span>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {person.name}
            </h1>

            {/* Quick Metadata */}
            <div className="flex items-center gap-4 text-xs font-semibold text-zinc-400 flex-wrap">
              {person.birthday && (
                <span className="flex items-center gap-1.5 bg-zinc-800/80 px-3 py-1 rounded-full border border-zinc-700">
                  <Calendar className="w-3.5 h-3.5 text-yellow-400" />
                  Born: {person.birthday}
                </span>
              )}
              {person.placeOfBirth && (
                <span className="flex items-center gap-1.5 bg-zinc-800/80 px-3 py-1 rounded-full border border-zinc-700">
                  <MapPin className="w-3.5 h-3.5 text-yellow-400" />
                  {person.placeOfBirth}
                </span>
              )}
            </div>

            {/* Biography */}
            <div className="space-y-1.5 pt-2">
              <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
                Biography
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {person.biography}
              </p>
            </div>
          </div>
        </div>

        {/* Complete Filmography Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-bold text-white tracking-wide">
              Known For / Filmography ({person.filmography.length})
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {person.filmography.map((movie) => (
              <Link key={movie.id} href={`/movie/${movie.id}`}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="group cursor-pointer flex flex-col gap-2"
                >
                  <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 group-hover:border-yellow-500/50 transition-all shadow-md">
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
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-yellow-400 transition-colors truncate">
                    {movie.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 truncate">
                    as {movie.character || "Actor"}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
