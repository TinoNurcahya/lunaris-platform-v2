'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Check, ExternalLink, AlertTriangle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface ReportWithDetails {
  id: number;
  reason: string;
  status: string;
  created_at: string;
  reporter?: { name: string; username: string } | null;
  quote?: { id: number; content: string } | null;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from('reports')
        .select(`*, reporter:profiles(*), quote:quotes(*)`)
        .order('created_at', { ascending: false });

      if (data) setReports(data as ReportWithDetails[]);
      setLoading(false);
    }
    loadReports();
  }, []);

  const handleResolveReport = async (reportId: number) => {
    try {
      const supabase = createClient();
      await supabase.from('reports').update({ status: 'resolved' }).eq('id', reportId);
      toast.success('Laporan berhasil ditandai selesai');
      setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: 'resolved' } : r)));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memperbarui laporan';
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Title Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Laporan Pengaduan Pengguna</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Kelola dan tinjau pengaduan konten kutipan dari komunitas.</p>
          </div>
        </div>
        <span className="text-xs font-semibold font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
          {reports.length} Laporan
        </span>
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Semua Bersih</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Belum ada laporan pengaduan dari pengguna saat ini.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((rep) => (
            <div key={rep.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Pelapor: {rep.reporter?.name || 'Pengguna'} (@{rep.reporter?.username || '-'})
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    rep.status === 'resolved' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  }`}>
                    {rep.status === 'resolved' ? 'Selesai' : 'Pending'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(rep.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Alasan Pengaduan: {rep.reason}</span>
                </p>

                {rep.quote ? (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl space-y-1">
                    <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed line-clamp-2">
                      &quot;{rep.quote.content}&quot;
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Kutipan telah dihapus.</p>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-end gap-2 pt-1">
                {rep.quote && (
                  <Link
                    href={`/quotes/${rep.quote.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 rounded-xl transition-all shadow-xs"
                  >
                    <span>Lihat Kutipan</span>
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  </Link>
                )}

                {rep.status !== 'resolved' && (
                  <button
                    onClick={() => handleResolveReport(rep.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Tandai Selesai</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
