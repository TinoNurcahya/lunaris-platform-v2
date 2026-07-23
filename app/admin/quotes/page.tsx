'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { QuoteItem } from '@/types';
import { Check, X, Trash2, Edit3 } from 'lucide-react';
import Link from 'next/link';
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
    if (!window.confirm('Apakah Anda yakin ingin menghapus kutipan ini secara permanen?')) return;
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
          <div key={i} className="h-24 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Kelola & Moderasi Kutipan</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Edit, setujui, tolak, atau hapus kutipan pengguna di seluruh platform.</p>
        </div>
        <span className="text-xs font-semibold font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
          {quotes.length} Total
        </span>
      </div>

      {quotes.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400">Belum ada kutipan yang terdaftar.</p>
        </div>
      ) : (
        quotes.map((quote) => (
          <div
            key={quote.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
          >
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {quote.user?.name || 'Anonim'} (@{quote.user?.username})
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    quote.status === 'approved'
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : quote.status === 'rejected'
                      ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {quote.status}
                </span>

                {quote.category && (
                  <span className="px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-md">
                    {quote.category.name}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 italic">"{quote.content}"</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/quotes/${quote.id}/edit`}
                className="p-2 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-xl transition-colors"
                title="Edit Kutipan Ini"
              >
                <Edit3 className="w-4 h-4" />
              </Link>

              {quote.status !== 'approved' && (
                <button
                  onClick={() => handleUpdateStatus(quote.id, 'approved')}
                  className="p-2 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-xl transition-colors cursor-pointer"
                  title="Setujui"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}

              {quote.status !== 'rejected' && (
                <button
                  onClick={() => handleUpdateStatus(quote.id, 'rejected')}
                  className="p-2 bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-xl transition-colors cursor-pointer"
                  title="Tolak"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => handleDelete(quote.id)}
                className="p-2 bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900 rounded-xl transition-colors cursor-pointer"
                title="Hapus Permanen"
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
