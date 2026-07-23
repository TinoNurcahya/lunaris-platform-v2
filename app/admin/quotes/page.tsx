'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { QuoteItem } from '@/types';
import { Check, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuotes() {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from('quotes')
        .select(`*, user:profiles!user_id(*), category:categories(*)`)
        .order('created_at', { ascending: false });

      if (data) setQuotes(data as QuoteItem[]);
      setLoading(false);
    }
    loadQuotes();
  }, []);

  const handleUpdateStatus = async (id: number, status: 'approved' | 'rejected') => {
    try {
      const supabase = createClient();
      await supabase.from('quotes').update({ status }).eq('id', id);
      toast.success(`Kutipan berhasil di-${status}!`);
      setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
    } catch (err: any) {
      toast.error('Gagal memperbarui status');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const supabase = createClient();
      await supabase.from('quotes').delete().eq('id', id);
      toast.success('Kutipan berhasil dihapus!');
      setQuotes((prev) => prev.filter((q) => q.id !== id));
    } catch (err: any) {
      toast.error('Gagal menghapus kutipan');
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-white border border-slate-200 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {quotes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <p className="text-xs text-slate-500">Belum ada kutipan yang terdaftar.</p>
        </div>
      ) : (
        quotes.map((quote) => (
          <div
            key={quote.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
          >
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-indigo-600">
                  {quote.user?.name || 'Anonim'} (@{quote.user?.username})
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    quote.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : quote.status === 'rejected'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {quote.status}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-800 italic">"{quote.content}"</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {quote.status !== 'approved' && (
                <button
                  onClick={() => handleUpdateStatus(quote.id, 'approved')}
                  className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-colors"
                  title="Setujui"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}

              {quote.status !== 'rejected' && (
                <button
                  onClick={() => handleUpdateStatus(quote.id, 'rejected')}
                  className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl transition-colors"
                  title="Tolak"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => handleDelete(quote.id)}
                className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors"
                title="Hapus Permanent"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
