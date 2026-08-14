"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { API_BASE_URL } from "@/config";
import HeroBanner, { Movie } from "@/components/HeroBanner";
import GenrePills from "@/components/GenrePills";
import MovieGrid from "@/components/MovieGrid";
import AuthModal from "@/components/AuthModal";
import { Film, ShieldCheck, Sparkles, User as UserIcon, Lock, Mail, CheckCircle2, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  // Dashboard states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Auth Landing Page States
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"User" | "Admin">("User");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Check Auth on Mount
  useEffect(() => {
    const savedUser = localStorage.getItem("moviebox_user");
    const token = localStorage.getItem("moviebox_token");

    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {}
    }
    setCheckingAuth(false);
  }, []);

  // Fetch Trending Movies when logged in
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    fetch(`${API_BASE_URL}/movies/trending`)
      .then((res) => res.json())
      .then((data) => {
        if (data.results) {
          setTrendingMovies(data.results);
          setFilteredMovies(data.results);
        }
      })
      .catch((err) => console.error("Error fetching trending movies:", err))
      .finally(() => setLoading(false));
  }, [user]);

  // Search & Genre Filtering
  useEffect(() => {
    if (!user) return;
    if (!searchQuery && selectedGenre === "all") {
      setFilteredMovies(trendingMovies);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.append("query", searchQuery);
    if (selectedGenre !== "all") params.append("genre", selectedGenre);

    fetch(`${API_BASE_URL}/movies/search?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.results) {
          setFilteredMovies(data.results);
        }
      })
      .catch((err) => console.error("Error searching movies:", err))
      .finally(() => setLoading(false));
  }, [searchQuery, selectedGenre, trendingMovies, user]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    const endpoint =
      authMode === "login"
        ? `${API_BASE_URL}/auth/login`
        : `${API_BASE_URL}/auth/register`;

    const body =
      authMode === "login"
        ? { email, password }
        : { name, email, password, role };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      setAuthSuccess(
        authMode === "login" ? "Successfully logged in!" : "Account created!"
      );

      setTimeout(() => {
        setUser(data.user);
        localStorage.setItem("moviebox_token", data.token);
        localStorage.setItem("moviebox_user", JSON.stringify(data.user));
      }, 500);
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("moviebox_token");
    localStorage.removeItem("moviebox_user");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0d0f12] text-white flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 1. UNAUTHENTICATED: Display Sleek High-Impact Login / Register Landing Page
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0d0f12] text-white flex flex-col justify-between relative overflow-hidden font-sans">
        {/* Background Ambient Glow & Visuals */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[160px] pointer-events-none" />

        {/* Top Header */}
        <header className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-300 flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <Film className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-base md:text-lg tracking-[0.25em] text-white uppercase">
              MOVIE<span className="text-yellow-400">BOX</span>
            </span>
          </div>
        </header>

        {/* Center Auth Card Section */}
        <main className="max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
          {/* Left Text Hero */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Next-Gen DevOps Streaming Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-none">
              Unlimited Movies, Sagas & Cast Profiles.
            </h1>

            <p className="text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed">
              Experience ultra-smooth dynamic previews, official YouTube trailers, complete MCU & DCEU chronological sagas, and detailed actor filmographies.
            </p>

            <div className="flex items-center gap-6 pt-2 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-yellow-400" />
                <span>JWT Secure Auth</span>
              </div>
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-yellow-400" />
                <span>TMDB Proxy Powered</span>
              </div>
            </div>
          </motion.div>

          {/* Right Login / Register Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 bg-[#14171c]/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl"
          >
            {/* Tabs */}
            <div className="flex items-center gap-4 border-b border-zinc-800 pb-4 mb-6">
              <button
                onClick={() => {
                  setAuthMode("login");
                  setAuthError(null);
                }}
                className={`text-lg font-bold transition-all relative pb-1 ${
                  authMode === "login" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Sign In
                {authMode === "login" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-400 rounded-full" />
                )}
              </button>

              <button
                onClick={() => {
                  setAuthMode("register");
                  setAuthError(null);
                }}
                className={`text-lg font-bold transition-all relative pb-1 ${
                  authMode === "register" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Create Account
                {authMode === "register" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-400 rounded-full" />
                )}
              </button>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-400">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* Success Message */}
            {authSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-2.5 text-xs text-green-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{authSuccess}</span>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === "register" && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              {authMode === "register" && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    Account Role
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("User")}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        role === "User"
                          ? "bg-yellow-400 text-black border-yellow-400"
                          : "bg-zinc-900 text-zinc-400 border-zinc-800"
                      }`}
                    >
                      User
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("Admin")}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        role === "Admin"
                          ? "bg-yellow-400 text-black border-yellow-400"
                          : "bg-zinc-900 text-zinc-400 border-zinc-800"
                      }`}
                    >
                      Admin
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    * Policy: Only ONE Admin account is permitted in the system.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-extrabold py-3 rounded-xl transition-all shadow-lg shadow-yellow-500/20 mt-2 flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : authMode === "login" ? (
                  "Sign In to Dashboard"
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          </motion.div>
        </main>

        <footer className="max-w-7xl w-full mx-auto px-6 py-6 text-center text-xs text-zinc-600 border-t border-zinc-900 z-10">
          DevOps Movie Platform • TMDB API Integrated • All Rights Reserved
        </footer>
      </div>
    );
  }

  // 2. AUTHENTICATED: Display Main Movie Platform Dashboard
  const featuredMovie = trendingMovies[0] || null;
  const sideMovies = trendingMovies.slice(1, 4);

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white font-sans">
      <Navbar
        user={user}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4">
        {/* Featured Hero Section */}
        {searchQuery === "" && selectedGenre === "all" && (
          <HeroBanner
            featuredMovie={featuredMovie}
            sideMovies={sideMovies}
          />
        )}

        {/* Find by Genre Pills */}
        <GenrePills
          selectedGenre={selectedGenre}
          onSelectGenre={(genreId) => setSelectedGenre(genreId)}
        />

        {/* Dynamic Movies Grid (Trending / Search Results) */}
        <MovieGrid
          title={
            searchQuery
              ? `Search Results for "${searchQuery}"`
              : selectedGenre !== "all"
              ? "Filtered Movies"
              : "Trending"
          }
          movies={filteredMovies}
          isLoading={loading}
        />

        {/* New Releases Section */}
        {searchQuery === "" && selectedGenre === "all" && (
          <MovieGrid
            title="New Releases"
            movies={trendingMovies.slice(4)}
            isLoading={loading}
          />
        )}
      </main>
    </div>
  );
}
