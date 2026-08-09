'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchQuotes } from '@/services/quotes';
import MoodFilterWidget from '@/components/quote/MoodFilterWidget';
import QuoteCard from '@/components/quote/QuoteCard';
import { QuoteItem, Category } from '@/types';
import { Sparkles, Flame, Clock, Compass, Filter, Music, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface HomeFeedClientProps {
  initialQuotes: QuoteItem[];
  initialCategories: Category[];
}

export default function HomeFeedClient({ initialQuotes, initialCategories }: HomeFeedClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get('category');

  const parsedCategory = categoryParam ? parseInt(categoryParam, 10) : undefined;
  const selectedCategory = parsedCategory && !isNaN(parsedCategory) ? parsedCategory : undefined;

  const [quotes, setQuotes] = useState<QuoteItem[]>(initialQuotes);
  const [categories] = useState<Category[]>(initialCategories);
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'of_the_day' | 'has_song'>('latest');
  const [selectedMood, setSelectedMood] = useState<string>('all');
  
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialQuotes.length === 20);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);
      return;
    }

    async function loadData() {
      setLoading(true);
      const quotesData = await fetchQuotes({ categoryId: selectedCategory, sortBy, mood: selectedMood, page: 1, limit: 20 });
      setQuotes(quotesData);
      setPage(1);
      setHasMore(quotesData.length === 20);
      setLoading(false);
    }
    loadData();
  }, [selectedCategory, sortBy, selectedMood]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const moreQuotes = await fetchQuotes({ categoryId: selectedCategory, sortBy, mood: selectedMood, page: nextPage, limit: 20 });
    
    if (moreQuotes.length > 0) {
      setQuotes((prev) => [...prev, ...moreQuotes]);
      setPage(nextPage);
      setHasMore(moreQuotes.length === 20);
    } else {
      setHasMore(false);
    }
    setLoadingMore(false);
  };

  const handleSelectCategory = (catId?: number) => {
    if (catId) {
      router.push(`/?category=${catId}`);
    } else {
      router.push('/');
    }
  };

  const quoteOfTheDay = quotes.find((q) => q.is_quote_of_day) || quotes[0];

  return (
    <div className="space-y-8 pb-12 min-w-0 w-full max-w-full">
      
      {/* Hero / Quote of the Day Banner */}
      {quoteOfTheDay && !selectedCategory && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 p-6 sm:p-8 shadow-lg text-white">
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-amber-200 bg-white/10 border border-white/20 rounded-full backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Kutipan Hari Ini</span>
            </div>

            <blockquote className="text-xl sm:text-2xl font-bold leading-snug italic">
              &quot;{quoteOfTheDay.content}&quot;
            </blockquote>

            <div className="flex items-center justify-between pt-2">
              {quoteOfTheDay.user && (
                <Link
                  href={`/profile/${quoteOfTheDay.user.username}`}
                  className="text-xs sm:text-sm font-medium text-indigo-100 hover:text-white transition-colors"
                >
                  — {quoteOfTheDay.user.name} (@{quoteOfTheDay.user.username})
                </Link>
              )}
              <Link
                href={`/quotes/${quoteOfTheDay.id}`}
                className="text-xs sm:text-sm font-semibold text-white hover:underline"
              >
                Lihat Detail & Komentar →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mood Filter Widget */}
      <MoodFilterWidget selectedMood={selectedMood} onSelectMood={setSelectedMood} />

      {/* Categories Filter */}
      <div className="space-y-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-colors duration-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2 transition-colors duration-200">
            <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400 transition-colors duration-200" />
            <span>Kategori Populer</span>
          </h3>
          <Link href="/categories" className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-semibold shrink-0 transition-colors duration-200">
            Lihat Semua →
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => handleSelectCategory(undefined)}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-full border transition-all duration-200 cursor-pointer ${
              selectedCategory === undefined
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat.id)}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-full border transition-all duration-200 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sorting Tabs & Feed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 min-w-0 w-full max-w-full transition-colors duration-200">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 shrink-0 transition-colors duration-200">
          <Compass className="w-5 h-5 text-indigo-600 dark:text-indigo-400 transition-colors duration-200" />
          <span>
            {selectedCategory
              ? `Kutipan Kategori: ${categories.find((c) => c.id === selectedCategory)?.name || ''}`
              : 'Jelajahi Kutipan'}
          </span>
        </h2>

        <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors duration-200">
          <button
            onClick={() => setSortBy('latest')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
              sortBy === 'latest'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 transition-colors duration-200" />
            <span>Terbaru</span>
          </button>

          <button
            onClick={() => setSortBy('popular')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
              sortBy === 'popular'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Populer</span>
          </button>

          <button
            onClick={() => setSortBy('of_the_day')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
              sortBy === 'of_the_day'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Pilihan Hari Ini</span>
          </button>

          <button
            onClick={() => setSortBy('has_song')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
              sortBy === 'has_song'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Music className="w-4 h-4 text-emerald-600 dark:text-emerald-400 transition-colors duration-200" />
            <span>Dengan Musik</span>
          </button>
        </div>
      </div>

      {/* Quotes Feed Grid */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse transition-colors duration-200" />
          ))}
        </div>
      ) : quotes.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm transition-colors duration-200">
          <Sparkles className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 transition-colors duration-200">Belum Ada Kutipan</h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4 transition-colors duration-200">Belum ada kutipan pada kategori ini.</p>
          <Link
            href="/quotes/create"
            className="inline-flex items-center px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all duration-200 shadow-sm"
          >
            Buat Kutipan Sekarang
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5">
            {quotes.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} />
            ))}
          </div>
          
          {hasMore && (
            <div className="pt-6 flex justify-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 rounded-xl transition-all border border-indigo-100 dark:border-indigo-800 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{loadingMore ? 'Memuat...' : 'Tampilkan Lebih Banyak'}</span>
              </button>
            </div>
          )}
        </>
      )}

    </div>
  );
}
