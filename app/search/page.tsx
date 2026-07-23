'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { fetchQuotes } from '@/services/quotes';
import QuoteCard from '@/components/quote/QuoteCard';
import { QuoteItem } from '@/types';
import { Search, Sparkles } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function performSearch() {
      setLoading(true);
      if (query.trim()) {
        const results = await fetchQuotes({ search: query });
        setQuotes(results);
      } else {
        setQuotes([]);
      }
      setLoading(false);
    }
    performSearch();
  }, [query]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
          <Search className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Hasil Pencarian</h2>
          <p className="text-xs text-slate-500">
            {query ? `Menampilkan hasil untuk "${query}"` : 'Masukkan kata kunci di kolom pencarian'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : quotes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <Sparkles className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Tidak Ada Hasil</h3>
          <p className="text-xs text-slate-500 mt-1">Coba cari dengan kata kunci, lagu, atau artis lain.</p>
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

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="h-40 rounded-2xl bg-white border border-slate-200 animate-pulse" />}>
      <SearchContent />
    </Suspense>
  );
}
