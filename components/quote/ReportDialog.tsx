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
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengirim laporan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900">Laporkan Kutipan</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Bantu kami menjaga komunitas Lunarys tetap sehat. Jelaskan alasan laporan Anda (misal: spam, kata-kata kasar, ciptaan orang lain tanpa kredit).
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            rows={3}
            placeholder="Tuliskan alasan laporan..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-rose-500 transition-all resize-none"
            required
          />

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || !reason.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl shadow-sm transition-all"
            >
              {submitting ? 'Mengirim...' : 'Kirim Laporan'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
