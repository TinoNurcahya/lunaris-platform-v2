'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Check } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from('reports')
        .select(`*, reporter:profiles(*), quote:quotes(*)`)
        .order('created_at', { ascending: false });

      if (data) setReports(data);
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
    } catch (err: any) {
      toast.error('Gagal memperbarui laporan');
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-white border border-slate-200 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <p className="text-xs text-slate-500">Belum ada laporan pengaduan dari pengguna.</p>
        </div>
      ) : (
        reports.map((rep) => (
          <div key={rep.id} className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Pelapor: {rep.reporter?.name || 'User'}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  rep.status === 'resolved' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  {rep.status}
                </span>
              </div>
              <p className="text-xs text-rose-600 font-medium">Alasan: {rep.reason}</p>
              {rep.quote && <p className="text-xs text-slate-500 italic">Kutipan: "{rep.quote.content}"</p>}
            </div>

            {rep.status !== 'resolved' && (
              <button
                onClick={() => handleResolveReport(rep.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Tandai Selesai</span>
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
