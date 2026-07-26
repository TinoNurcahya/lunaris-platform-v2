'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, PlusCircle, Search, Bell, Settings, Sun, Moon } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { UserProfile } from '@/types';
import CommandPalette from './CommandPalette';
import { getUnreadNotificationsCount, formatBadgeCount } from '@/services/notifications';
import { useTheme } from '@/components/theme/ThemeProvider';

export default function Navbar({ profile: propProfile }: { profile?: UserProfile | null }) {
  const [profile, setProfile] = useState<UserProfile | null>(propProfile || null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) setProfile(data as UserProfile);

        const count = await getUnreadNotificationsCount();
        setUnreadCount(count);
      } else {
        setProfile(null);
        setUnreadCount(0);
      }
    }

    if (!propProfile) {
      loadUser();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setProfile(null);
        setUnreadCount(0);
      } else {
        loadUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [propProfile]);

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-all">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                Lunarys
              </span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 -mt-1 font-mono">
                v2.0 Platform
              </span>
            </div>
          </Link>

          {/* Search Trigger Button */}
          <div className="flex-1 max-w-sm mx-4 hidden sm:block">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 transition-colors" />
                <span>Cari kutipan, pengguna, atau tag...</span>
              </div>
              <kbd className="px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-2xs">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* Right Action Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {profile ? (
              <>
                <Link
                  href="/quotes/create"
                  className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-md shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Buat Kutipan</span>
                </Link>

                {/* Notifications Link with Numeric Badge */}
                <Link
                  href="/notifications"
                  className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  title="Notifikasi"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold font-mono text-white bg-rose-500 rounded-full ring-2 ring-white shadow-xs">
                      {formatBadgeCount(unreadCount)}
                    </span>
                  )}
                </Link>

                {/* Settings Direct Link */}
                <Link
                  href="/settings"
                  className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  title="Pengaturan Akun"
                >
                  <Settings className="w-5 h-5" />
                </Link>

                {/* Profile Avatar Direct Link */}
                <Link
                  href={`/profile/${profile.username}`}
                  className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  title="Lihat Profil Saya"
                >
                  <img
                    src={profile.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`}
                    alt={profile.name}
                    className="w-9 h-9 rounded-full bg-slate-200 object-cover ring-2 ring-indigo-500/30"
                  />
                  <div className="hidden lg:block text-left pr-1">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 max-w-[110px] truncate">{profile.name}</p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-medium">Lvl {profile.level} • {profile.xp} XP</p>
                  </div>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-md shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Command Palette Search Modal */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </>
  );
}
