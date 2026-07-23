'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Sparkles,
  Search,
  PlusCircle,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { Profile } from '@/types';

interface NavbarProps {
  profile?: Profile | null;
}

export default function Navbar({ profile }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/85 border-b border-slate-200/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              Lunarys
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kutipan, lagu, atau penulis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100/90 border border-slate-200 rounded-full pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
          </form>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {profile ? (
              <>
                <Link
                  href="/quotes/create"
                  className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-md shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Tulis Kutipan</span>
                </Link>

                <Link
                  href="/notifications"
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors relative"
                  title="Notifikasi"
                >
                  <Bell className="w-5 h-5" />
                </Link>

                {/* Profile Avatar Direct Link */}
                <Link
                  href={`/profile/${profile.username}`}
                  className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 transition-all"
                  title="Lihat Profil Saya"
                >
                  <img
                    src={profile.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`}
                    alt={profile.name}
                    className="w-9 h-9 rounded-full bg-slate-200 object-cover ring-2 ring-indigo-500/30"
                  />
                  <div className="hidden lg:block text-left pr-1">
                    <p className="text-sm font-semibold text-slate-800 max-w-[110px] truncate">{profile.name}</p>
                    <p className="text-xs text-indigo-600 font-mono font-medium">Lvl {profile.level} • {profile.xp} XP</p>
                  </div>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-md shadow-indigo-600/20 transition-all"
                >
                  Daftar
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
