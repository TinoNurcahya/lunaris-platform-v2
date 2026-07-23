'use client';

import { useEffect, useState } from 'react';
import { fetchQuotes } from '@/services/quotes';
import { fetchCategories } from '@/services/categories';
import QuoteCard from '@/components/quote/QuoteCard';
import { QuoteItem, Category } from '@/types';
import { Sparkles, Flame, Clock, Compass, Filter } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [quotesData, categoriesData] = await Promise.all([
        fetchQuotes({ categoryId: selectedCategory, sortBy }),
        fetchCategories()
      ]);
      setQuotes(quotesData);
      setCategories(categoriesData);
      setLoading(false);
    }
    loadData();
  }, [selectedCategory, sortBy]);

  const quoteOfTheDay = quotes.find((q) => q.is_quote_of_day) || quotes[0];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Hero / Quote of the Day Banner */}
      {quoteOfTheDay && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 p-6 sm:p-8 shadow-lg text-white">
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-amber-200 bg-white/10 border border-white/20 rounded-full backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Kutipan Hari Ini</span>
            </div>

            <blockquote className="text-xl sm:text-2xl font-bold leading-snug italic">
              "{quoteOfTheDay.content}"
            </blockquote>

            <div className="flex items-center justify-between pt-2">
              {quoteOfTheDay.user && (
                <Link
                  href={`/profile/${quoteOfTheDay.user.username}`}
                  className="text-xs font-medium text-indigo-100 hover:text-white transition-colors"
                >
                  — {quoteOfTheDay.user.name} (@{quoteOfTheDay.user.username})
                </Link>
              )}
              <Link
                href={`/quotes/${quoteOfTheDay.id}`}
                className="text-xs font-semibold text-white hover:underline"
              >
                Lihat Detail & Komentar →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Categories Horizontal Filter Scroll */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>Kategori Populer</span>
          </h3>
          <Link href="/categories" className="text-xs text-indigo-600 hover:underline font-semibold">
            Lihat Semua →
          </Link>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(undefined)}
            className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all shrink-0 ${
              selectedCategory === undefined
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sorting Tabs & Feed Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Compass className="w-5 h-5 text-indigo-600" />
          <span>Jelajahi Kutipan</span>
        </h2>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setSortBy('latest')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              sortBy === 'latest'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Terbaru</span>
          </button>

          <button
            onClick={() => setSortBy('popular')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              sortBy === 'popular'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Populer</span>
          </button>
        </div>
      </div>

      {/* Quotes Feed Grid */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : quotes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <Sparkles className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Belum Ada Kutipan</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Jadilah orang pertama yang menulis inspirasi di sini!</p>
          <Link
            href="/quotes/create"
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all shadow-sm"
          >
            Buat Kutipan Sekarang
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
