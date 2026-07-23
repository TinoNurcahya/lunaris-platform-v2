'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import QuoteCard from '@/components/quote/QuoteCard';
import { QuoteItem } from '@/types';
import { Bookmark, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function BookmarksPage() {
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookmarks() {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('bookmarks')
        .select(`
          quote:quotes(
            *,
            user:profiles!user_id(*),
            category:categories(*)
          )
        `)
        .eq('user_id', user.id);

      if (data) {
        const bookmarkedQuotes = data
          .map((item: any) => item.quote)
          .filter((q: any) => q !== null)
          .map((q: any) => ({ ...q, is_bookmarked: true }));
        setQuotes(bookmarkedQuotes);
      }

      setLoading(false);
    }
    loadBookmarks();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 flex items-center justify-center">
          <Bookmark className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Kutipan Tersimpan</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Koleksi kutipan dan lirik lagu favoritmu.</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : quotes.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <Sparkles className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Belum Ada Bookmark</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">Simpan kutipan favoritmu dengan menekan ikon bookmark.</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all shadow-sm"
          >
            Jelajahi Kutipan
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {quotes.map((quote) => (
            <QuoteCard key={quote.id} quote={quote} />
          ))}
        </div>
      )}
    </div>
  );
}
