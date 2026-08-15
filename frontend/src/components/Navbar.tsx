"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, MessageSquare, Film, LogOut, Heart, Layers, LayoutDashboard, User as UserIcon } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function Navbar({
  user,
  onLogout,
  searchQuery = "",
  onSearchChange,
}: NavbarProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "DASHBOARD", icon: LayoutDashboard },
    { href: "/collections", label: "COLLECTIONS", icon: Layers },
    { href: "/favorites", label: "FAVORITES", icon: Heart },
    ...(user ? [{ href: "/profile", label: "PROFILE", icon: UserIcon }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0d0f12]/90 backdrop-blur-xl border-b border-zinc-800/80 px-4 md:px-8 py-3.5 flex items-center justify-between transition-all">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-3 cursor-pointer group">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-300 flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:scale-105 transition-transform">
          <Film className="w-5 h-5 text-black stroke-[2.5]" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-sm md:text-base tracking-[0.25em] text-white uppercase leading-none">
            MOVIE<span className="text-yellow-400">BOX</span>
          </span>
          <span className="text-[9px] tracking-widest text-zinc-500 font-semibold uppercase">
            DEV PLATFORM
          </span>
        </div>
      </Link>

      {/* Center Nav Links */}
      <nav className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 text-xs font-bold tracking-widest transition-all relative py-1 ${
                isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-yellow-400" : "text-zinc-500"}`} />
              <span>{link.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-yellow-400 rounded-full shadow-[0_0_8px_#facc15]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Right Action Icons & Search */}
      <div className="flex items-center gap-4">
        {/* Search Bar (if search handler provided) */}
        {onSearchChange && (
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search movies..."
              className="bg-zinc-900/90 text-xs text-white placeholder-zinc-500 pl-9 pr-4 py-2 rounded-full border border-zinc-800 focus:outline-none focus:border-yellow-500/60 focus:ring-1 focus:ring-yellow-500/50 w-36 sm:w-56 transition-all"
            />
          </div>
        )}

        {/* Action Icons */}
        <div className="hidden sm:flex items-center gap-3 border-l border-zinc-800 pl-4">
          <button className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all relative">
            <MessageSquare className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          </button>
        </div>

        {/* User Auth Profile Badge */}
        {user && (
          <div className="flex items-center gap-3 bg-zinc-900/90 border border-zinc-800/90 pl-1.5 pr-3 py-1 rounded-full shadow-md">
            <Link href="/profile" className="flex items-center gap-2.5 group cursor-pointer">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center font-bold text-xs text-black shadow-sm overflow-hidden shrink-0 border border-yellow-400/50">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-white leading-tight truncate max-w-[100px] group-hover:text-yellow-400 transition-colors">
                  {user.name}
                </span>
                <span className="text-[10px] text-yellow-400 font-medium">
                  {user.role}
                </span>
              </div>
            </Link>
            <button
              onClick={onLogout}
              title="Logout"
              className="p-1.5 rounded-full text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-all ml-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
