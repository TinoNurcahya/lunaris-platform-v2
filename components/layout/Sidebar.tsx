'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Grid,
  Trophy,
  Bookmark,
  PlusCircle,
  ShieldCheck,
  Compass,
  User as UserIcon,
  LogOut,
  Zap,
  Bell,
  BarChart3,
  Quote,
  AlertTriangle,
  Users,
  Send
} from 'lucide-react';
import { Profile } from '@/types';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

interface SidebarProps {
  profile?: Profile | null;
  isAdmin?: boolean;
}

export default function Sidebar({ profile, isAdmin }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const mainNavItems = [
    { label: 'Beranda', href: '/', icon: Home },
    { label: 'Kategori', href: '/categories', icon: Grid },
    { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { label: 'Bookmark', href: '/bookmarks', icon: Bookmark },
    { label: 'Notifikasi', href: '/notifications', icon: Bell },
  ];

  const adminNavItems = [
    { label: 'Ringkasan Admin', href: '/admin', icon: BarChart3 },
    { label: 'Moderasi Kutipan', href: '/admin/quotes', icon: Quote },
    { label: 'Laporan Pengaduan', href: '/admin/reports', icon: AlertTriangle },
    { label: 'Kelola Kategori', href: '/admin/categories', icon: Grid },
    { label: 'Kelola Pengguna', href: '/admin/users', icon: Users },
    { label: 'Broadcast Pengumuman', href: '/admin/broadcast', icon: Send },
  ];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success('Berhasil keluar');
    router.refresh();
  };

  return (
    <aside className="w-64 hidden md:block shrink-0">
      <div className="sticky top-20 space-y-4">

        {/* User Profile Card in Sidebar (If Logged In) */}
        {profile && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={profile.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`}
                alt={profile.name}
                className="w-12 h-12 rounded-full bg-slate-100 object-cover ring-2 ring-indigo-500/30 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-base font-bold text-slate-900 truncate">{profile.name}</h4>
                <p className="text-xs text-indigo-600 font-mono font-medium">@{profile.username}</p>
                <div className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 text-xs font-bold text-indigo-700 bg-indigo-50 rounded-full border border-indigo-100">
                  <Zap className="w-3.5 h-3.5 fill-indigo-600" />
                  <span>Lvl {profile.level} • {profile.xp} XP</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1">
              <Link
                href={`/profile/${profile.username}`}
                className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-colors"
              >
                <UserIcon className="w-4 h-4 text-indigo-600" />
                <span>Lihat Profil Saya</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        )}

        {/* Dedicated Admin Card (Placed right below Profile Card) */}
        {isAdmin && (
          <div className="bg-gradient-to-b from-amber-500/10 via-amber-50/80 to-amber-100/40 border border-amber-200/90 rounded-2xl p-3.5 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-sm shadow-amber-500/30">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-amber-900 tracking-tight">Admin Control Center</h4>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold text-amber-800 bg-amber-200/80 rounded-full border border-amber-300">
                Admin
              </span>
            </div>

            <nav className="space-y-1 pt-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                      isActive
                        ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/20'
                        : 'text-amber-900 hover:bg-amber-200/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-amber-700'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
        
        {/* Main Navigation Menu */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-sm">
          <nav className="space-y-1">
            <p className="px-3.5 pt-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Menu Utama
            </p>
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Call to Action Box */}
        <div className="bg-gradient-to-br from-indigo-50 to-slate-100 border border-indigo-100 rounded-2xl p-5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/10 border border-indigo-200 flex items-center justify-center mb-3">
            <Compass className="w-4 h-4 text-indigo-600" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">Bagikan Inspirasimu</h4>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Tulis kutipan favoritmu, lirik lagu, atau filosofi hidup dan tingkatkan XP-mu.
          </p>
          <Link
            href="/quotes/create"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Buat Kutipan</span>
          </Link>
        </div>

      </div>
    </aside>
  );
}
