'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Send,
  Settings,
  HelpCircle,
  FolderHeart
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Profile } from '@/types';
import { signOut } from '@/services/auth';
import {
  getUnreadNotificationsCount,
  getAdminSidebarCounts,
  getMainSidebarCounts,
  formatBadgeCount
} from '@/services/notifications';
import { toast } from 'sonner';

interface SidebarProps {
  profile?: Profile | null;
  isAdmin?: boolean;
}

export default function Sidebar({ profile: propProfile, isAdmin: propIsAdmin }: SidebarProps) {
  const pathname = usePathname();

  const [profile, setProfile] = useState<Profile | null>(propProfile || null);
  const [isAdmin, setIsAdmin] = useState<boolean>(propIsAdmin || false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [mainCounts, setMainCounts] = useState({
    bookmarkCount: 0,
    categoryCount: 0
  });
  const [adminCounts, setAdminCounts] = useState({
    pendingQuotes: 0,
    pendingReports: 0,
    totalCategories: 0,
    totalUsers: 0
  });

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          const userProf = data as Profile;
          setProfile(userProf);
          const adminCheck = userProf.role === 'admin';
          setIsAdmin(adminCheck);

          if (adminCheck) {
            getAdminSidebarCounts().then((counts) => setAdminCounts(counts));
          }
        }

        const count = await getUnreadNotificationsCount();
        setUnreadNotifCount(count);
      } else {
        setProfile(null);
        setIsAdmin(false);
        setUnreadNotifCount(0);
      }
    }

    getMainSidebarCounts().then((counts) => setMainCounts(counts));

    if (!propProfile) {
      loadUser();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setProfile(null);
        setIsAdmin(false);
        setUnreadNotifCount(0);
      } else {
        loadUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [propProfile]);

  const mainNavItems = [
    {
      label: 'Beranda',
      href: '/',
      icon: Home,
      badgeText: 'Feed',
      badgeColor: 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800'
    },
    {
      label: 'Kategori',
      href: '/categories',
      icon: Grid,
      badgeCount: mainCounts.categoryCount,
      badgeSuffix: 'Tema',
      badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
    },
    {
      label: 'Koleksi Kutipan',
      href: '/collections',
      icon: FolderHeart,
      badgeText: 'Album',
      badgeColor: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
    },
    {
      label: 'Leaderboard',
      href: '/leaderboard',
      icon: Trophy,
      badgeText: 'Top 20',
      badgeColor: 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
    },
    {
      label: 'Bookmark',
      href: '/bookmarks',
      icon: Bookmark,
      badgeCount: mainCounts.bookmarkCount,
      badgeColor: 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-700',
      emptyText: 'Disimpan'
    },
    {
      label: 'Notifikasi',
      href: '/notifications',
      icon: Bell,
      badgeCount: unreadNotifCount,
      badgeColor: unreadNotifCount > 0 ? 'bg-rose-500 text-white animate-pulse shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
      emptyText: '0 Baru'
    },
    {
      label: 'Pusat Bantuan FAQ',
      href: '/faq',
      icon: HelpCircle,
      badgeText: 'Bantuan',
      badgeColor: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
    },
  ];

  const adminNavItems = [
    {
      label: 'Ringkasan Admin',
      href: '/admin',
      icon: BarChart3,
      badgeText: 'Insight',
      badgeColor: 'bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
    },
    {
      label: 'Moderasi Kutipan',
      href: '/admin/quotes',
      icon: Quote,
      badgeCount: adminCounts.pendingQuotes,
      badgeColor: adminCounts.pendingQuotes > 0 ? 'bg-amber-500 text-white animate-pulse' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300',
      emptyText: 'Aman'
    },
    {
      label: 'Laporan Pengaduan',
      href: '/admin/reports',
      icon: AlertTriangle,
      badgeCount: adminCounts.pendingReports,
      badgeColor: adminCounts.pendingReports > 0 ? 'bg-rose-500 text-white animate-pulse' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300',
      emptyText: 'Clean'
    },
    {
      label: 'Kelola Kategori',
      href: '/admin/categories',
      icon: Grid,
      badgeCount: adminCounts.totalCategories,
      badgeColor: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono border border-indigo-200 dark:border-indigo-800'
    },
    {
      label: 'Kelola Pengguna',
      href: '/admin/users',
      icon: Users,
      badgeCount: adminCounts.totalUsers,
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono border border-emerald-200 dark:border-emerald-800'
    },
    {
      label: 'Broadcast Pengumuman',
      href: '/admin/broadcast',
      icon: Send,
      badgeText: 'Kirim',
      badgeColor: 'bg-amber-500 text-white'
    },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Berhasil keluar');
      window.location.href = '/login';
    } catch {
      toast.error('Gagal keluar');
    }
  };

  const totalAdminPending = adminCounts.pendingQuotes + adminCounts.pendingReports;

  return (
    <aside className="w-64 hidden md:block shrink-0">
      <div className="sticky top-20 space-y-4">

        {/* User Profile Card in Sidebar (If Logged In) */}
        {profile && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3 transition-colors duration-200">
            <div className="flex items-center gap-3">
              <Image
                src={profile.avatar_url?.trim() ? profile.avatar_url : `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`}
                alt={profile.name}
                width={48}
                height={48}
                unoptimized
                className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 object-cover ring-2 ring-indigo-500/30 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-base font-bold text-slate-900 dark:text-white truncate transition-colors duration-200">{profile.name}</h4>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-medium transition-colors duration-200">@{profile.username}</p>
                <div className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 rounded-full border border-indigo-100 dark:border-indigo-800 transition-colors duration-200">
                  <Zap className="w-3.5 h-3.5 fill-indigo-600 dark:fill-indigo-400" />
                  <span>Lvl {profile.level} • {profile.xp} XP</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 transition-colors duration-200">
              <Link
                href={`/profile/${profile.username}`}
                className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-colors"
              >
                <UserIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Lihat Profil Saya</span>
              </Link>

              <Link
                href="/settings"
                className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-colors"
              >
                <Settings className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Pengaturan Akun</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Navigation Menu */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3 shadow-sm space-y-2 transition-colors duration-200">
          <div className="flex items-center justify-between px-2 pt-1">
            <p className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              Menu Utama
            </p>
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          </div>

          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const badge = item.badgeCount !== undefined && item.badgeCount > 0
                ? `${formatBadgeCount(item.badgeCount)}${item.badgeSuffix ? ` ${item.badgeSuffix}` : ''}`
                : item.badgeText;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {/* Left Indicator Pill on Active */}
                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 dark:bg-indigo-400 rounded-r-full" />
                  )}

                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {badge ? (
                    <span className={`px-2 py-0.5 text-[10px] font-bold font-mono rounded-full shrink-0 ${item.badgeColor || 'bg-indigo-600 text-white'}`}>
                      {badge}
                    </span>
                  ) : item.emptyText ? (
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full shrink-0 ${item.badgeColor}`}>
                      {item.emptyText}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Dedicated Admin Control Center Card */}
        {isAdmin && (
          <div className="bg-gradient-to-b from-amber-500/15 via-amber-50/90 to-amber-100/50 dark:from-amber-950/40 dark:via-slate-900 dark:to-amber-950/20 border border-amber-300/80 dark:border-amber-700/60 rounded-2xl p-3.5 shadow-sm space-y-3">
            
            {/* Admin Header & Live System Status Badge */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs shadow-amber-500/30">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-950 dark:text-amber-200 tracking-tight">Admin Control Center</h4>
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>Live System</span>
                  </div>
                </div>
              </div>

              {totalAdminPending > 0 ? (
                <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-rose-500 rounded-full animate-pulse shadow-xs">
                  {formatBadgeCount(totalAdminPending)} Aksi
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-200/80 dark:bg-amber-900/60 rounded-full border border-amber-300 dark:border-amber-700">
                  Admin
                </span>
              )}
            </div>

            {/* Admin Navigation List with Rich Badges */}
            <nav className="space-y-1 pt-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const badge = item.badgeCount !== undefined ? formatBadgeCount(item.badgeCount) : item.badgeText;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                      isActive
                        ? 'bg-amber-600 text-white shadow-xs shadow-amber-600/20'
                        : 'text-amber-950 dark:text-amber-200 hover:bg-amber-200/60 dark:hover:bg-amber-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-amber-700 dark:text-amber-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {badge ? (
                      <span className={`px-2 py-0.5 text-[10px] font-bold font-mono rounded-full shrink-0 ${item.badgeColor || 'bg-amber-600 text-white'}`}>
                        {badge}
                      </span>
                    ) : item.emptyText ? (
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full shrink-0 ${item.badgeColor}`}>
                        {item.emptyText}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Call to Action Box */}
        <div className="bg-gradient-to-br from-indigo-50 to-slate-100 dark:from-slate-900 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/10 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center mb-3">
            <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Bagikan Inspirasimu</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
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
