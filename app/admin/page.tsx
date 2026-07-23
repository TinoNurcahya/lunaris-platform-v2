'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Quote, Users, AlertTriangle, Clock, PieChart, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function AdminStatsPage() {
  const [stats, setStats] = useState({ quotes: 0, users: 0, reports: 0, pending: 0, approved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      const supabase = createClient();

      const [
        { count: quotesCount },
        { count: usersCount },
        { count: reportsCount },
        { count: pendingCount },
        { count: approvedCount }
      ] = await Promise.all([
        supabase.from('quotes').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('reports').select('*', { count: 'exact', head: true }),
        supabase.from('quotes').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('quotes').select('*', { count: 'exact', head: true }).eq('status', 'approved')
      ]);

      setStats({
        quotes: quotesCount || 0,
        users: usersCount || 0,
        reports: reportsCount || 0,
        pending: pendingCount || 0,
        approved: approvedCount || 0
      });

      setLoading(false);
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  const totalSystemItems = Math.max(stats.quotes + stats.users + stats.reports, 1);
  const approvedPct = Math.round((stats.approved / Math.max(stats.quotes, 1)) * 100);
  const pendingPct = Math.round((stats.pending / Math.max(stats.quotes, 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Kutipan Card */}
        <Link href="/admin/quotes" className="relative overflow-hidden p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-300 transition-all space-y-2 group">
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Total Kutipan</span>
            <Quote className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="relative z-10 text-2xl font-bold text-slate-900 dark:text-white">{stats.quotes}</h3>

          <div className="absolute inset-x-0 bottom-0 h-9 pointer-events-none opacity-25 group-hover:opacity-50 transition-opacity">
            <svg className="w-full h-full" viewBox="0 0 100 35" preserveAspectRatio="none">
              <defs>
                <linearGradient id="adminIndigoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M0 24 C20 12, 45 22, 65 14, 85 24, 100 10 L100 35 L0 35 Z" fill="url(#adminIndigoGrad)" />
              <path d="M0 24 C20 12, 45 22, 65 14, 85 24, 100 10" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </Link>

        {/* Menunggu Moderasi Card */}
        <Link href="/admin/quotes" className="relative overflow-hidden p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-300 transition-all space-y-2 group">
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Menunggu Moderasi</span>
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="relative z-10 text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</h3>

          <div className="absolute inset-x-0 bottom-0 h-9 pointer-events-none opacity-25 group-hover:opacity-50 transition-opacity">
            <svg className="w-full h-full" viewBox="0 0 100 35" preserveAspectRatio="none">
              <defs>
                <linearGradient id="adminAmberGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M0 22 C20 28, 40 16, 60 22, 80 12, 100 18 L100 35 L0 35 Z" fill="url(#adminAmberGrad)" />
              <path d="M0 22 C20 28, 40 16, 60 22, 80 12, 100 18" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </Link>

        {/* Total Pengguna Card */}
        <Link href="/admin/users" className="relative overflow-hidden p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-300 transition-all space-y-2 group">
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Total Pengguna</span>
            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="relative z-10 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.users}</h3>

          <div className="absolute inset-x-0 bottom-0 h-9 pointer-events-none opacity-25 group-hover:opacity-50 transition-opacity">
            <svg className="w-full h-full" viewBox="0 0 100 35" preserveAspectRatio="none">
              <defs>
                <linearGradient id="adminEmeraldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M0 26 C20 16, 40 24, 60 12 C80 20, 90 8, 100 14 L100 35 L0 35 Z" fill="url(#adminEmeraldGrad)" />
              <path d="M0 26 C20 16, 40 24, 60 12 C80 20, 90 8, 100 14" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </Link>

        {/* Laporan Pengaduan Card */}
        <Link href="/admin/reports" className="relative overflow-hidden p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-rose-300 transition-all space-y-2 group">
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Laporan Pengaduan</span>
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="relative z-10 text-2xl font-bold text-rose-600 dark:text-rose-400">{stats.reports}</h3>

          <div className="absolute inset-x-0 bottom-0 h-9 pointer-events-none opacity-25 group-hover:opacity-50 transition-opacity">
            <svg className="w-full h-full" viewBox="0 0 100 35" preserveAspectRatio="none">
              <defs>
                <linearGradient id="adminRoseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M0 25 C20 15, 40 22, 60 10 C80 18, 90 12, 100 16 L100 35 L0 35 Z" fill="url(#adminRoseGrad)" />
              <path d="M0 25 C20 15, 40 22, 60 10 C80 18, 90 12, 100 16" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Admin Visual Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Moderation Status Distribution Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Status Moderasi Konten</h4>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 font-mono">Platform Health</span>
          </div>

          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Disetujui (Approved)</span>
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{stats.approved} ({approvedPct}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${approvedPct}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Menunggu Review (Pending)</span>
                </span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{stats.pending} ({pendingPct}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${pendingPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* System Resource Proportion */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Proporsi Entitas Sistem</h4>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 font-mono">Overview</span>
          </div>

          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <span>Pengguna Terdaftar</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{stats.users}</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${Math.round((stats.users / totalSystemItems) * 100)}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <span>Total Kutipan Dipublikasikan</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{stats.quotes}</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${Math.round((stats.quotes / totalSystemItems) * 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
