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
    <>
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 w-full bg-[#0d0f12]/90 backdrop-blur-xl border-b border-zinc-800/80 px-4 md:px-8 py-3 flex items-center justify-between transition-all">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 cursor-pointer group shrink-0">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-300 flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:scale-105 transition-transform">
            <Film className="w-4 h-4 md:w-5 md:h-5 text-black stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xs md:text-base tracking-[0.2em] text-white uppercase leading-none">
              MOVIE<span className="text-yellow-400">BOX</span>
            </span>
            <span className="text-[8px] md:text-[9px] tracking-widest text-zinc-500 font-semibold uppercase">
              DEV PLATFORM
            </span>
          </div>
        </Link>

        {/* Center Desktop Nav Links */}
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
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search Bar */}
          {onSearchChange && (
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search..."
                className="bg-zinc-900/90 text-xs text-white placeholder-zinc-500 pl-8 pr-3 py-1.5 rounded-full border border-zinc-800 focus:outline-none focus:border-yellow-500/60 focus:ring-1 focus:ring-yellow-500/50 w-28 sm:w-56 transition-all"
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
            <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800/90 pl-1 pr-2.5 py-1 rounded-full shadow-md">
              <Link href="/profile" className="flex items-center gap-2 group cursor-pointer">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center font-bold text-xs text-black shadow-sm overflow-hidden shrink-0 border border-yellow-400/50">
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
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-white leading-tight truncate max-w-[90px] group-hover:text-yellow-400 transition-colors">
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
                className="p-1 rounded-full text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Android & Mobile Optimized) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0d0f12]/95 backdrop-blur-2xl border-t border-zinc-800/90 px-3 py-2 flex items-center justify-around shadow-2xl">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold tracking-wider transition-all py-1 px-3 rounded-xl ${
                isActive ? "text-yellow-400 bg-yellow-400/10" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-yellow-400" : "text-zinc-400"}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
