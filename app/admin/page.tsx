'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Quote, Users, AlertTriangle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function AdminStatsPage() {
  const [stats, setStats] = useState({ quotes: 0, users: 0, reports: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      const supabase = createClient();

      const [
        { count: quotesCount },
        { count: usersCount },
        { count: reportsCount },
        { count: pendingCount }
      ] = await Promise.all([
        supabase.from('quotes').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('reports').select('*', { count: 'exact', head: true }),
        supabase.from('quotes').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      setStats({
        quotes: quotesCount || 0,
        users: usersCount || 0,
        reports: reportsCount || 0,
        pending: pendingCount || 0
      });

      setLoading(false);
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-white border border-slate-200 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/quotes" className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-indigo-300 transition-all space-y-2 group">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Total Kutipan</span>
            <Quote className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{stats.quotes}</h3>
        </Link>

        <Link href="/admin/quotes" className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-amber-300 transition-all space-y-2 group">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Menunggu Moderasi</span>
            <Clock className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-2xl font-bold text-amber-600">{stats.pending}</h3>
        </Link>

        <Link href="/admin/users" className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-emerald-300 transition-all space-y-2 group">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Total Pengguna</span>
            <Users className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-2xl font-bold text-emerald-600">{stats.users}</h3>
        </Link>

        <Link href="/admin/reports" className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-rose-300 transition-all space-y-2 group">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Laporan Pengaduan</span>
            <AlertTriangle className="w-5 h-5 text-rose-600 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-2xl font-bold text-rose-600">{stats.reports}</h3>
        </Link>
      </div>
    </div>
  );
}
