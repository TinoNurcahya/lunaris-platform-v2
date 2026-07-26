'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';

interface ReportDialogProps {
  quoteId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportDialog({ quoteId, isOpen, onClose }: ReportDialogProps) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Silakan login terlebih dahulu untuk melaporkan kutipan');
        setSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from('reports')
        .insert({
          quote_id: quoteId,
          reporter_id: user.id,
          reason: reason.trim(),
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Laporan Anda telah terkirim ke tim moderasi. Terima kasih!');
      setReason('');
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal mengirim laporan';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Laporkan Kutipan</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Bantu kami menjaga komunitas Lunarys tetap sehat. Jelaskan alasan laporan Anda (misal: spam, kata-kata kasar, ciptaan orang lain tanpa kredit).
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            rows={3}
            placeholder="Tuliskan alasan laporan..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-rose-500 transition-all resize-none"
            required
          />

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || !reason.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              {submitting ? 'Mengirim...' : 'Kirim Laporan'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
