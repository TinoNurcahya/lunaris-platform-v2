'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { QuoteItem, UserProfile } from '@/types';
import QuoteCard from '@/components/quote/QuoteCard';
import { Search, Quote, Users, Music, Sparkles } from 'lucide-react';
import Link from 'next/link';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'quotes' | 'users' | 'songs'>('all');
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuery(initialQuery);
    if (!initialQuery.trim()) {
      setQuotes([]);
      setUsers([]);
      return;
    }

    async function searchData() {
      setLoading(true);
      const supabase = createClient();
      const searchTerm = `%${initialQuery.trim()}%`;

      const [{ data: quotesData }, { data: usersData }] = await Promise.all([
        supabase
          .from('quotes')
          .select('*, user:profiles!user_id(*), category:categories(*)')
          .eq('status', 'approved')
          .or(`content.ilike.${searchTerm},song_title.ilike.${searchTerm},song_artist.ilike.${searchTerm}`)
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('*')
          .or(`name.ilike.${searchTerm},username.ilike.${searchTerm}`)
          .limit(20)
      ]);

      setQuotes((quotesData as QuoteItem[]) || []);
      setUsers((usersData as UserProfile[]) || []);
      setLoading(false);
    }
    searchData();
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const songQuotes = quotes.filter((q) => !!q.song_title);

  return (
    <div className="space-y-6 pb-12">
      {/* Search Header Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Penelusuran Lunarys</h2>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Cari kata-kata kutipan, nama pengguna @username, atau judul lagu..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-24 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 transition-all"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          <button
            type="submit"
            className="absolute right-2 top-2 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            Cari
          </button>
        </form>

        {/* Search Result Tabs */}
        {initialQuery && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Semua Hasil ({quotes.length + users.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('quotes')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'quotes'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Quote className="w-3.5 h-3.5" />
              <span>Kutipan ({quotes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Pengguna ({users.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('songs')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'songs'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Music className="w-3.5 h-3.5 text-emerald-500" />
              <span>Lagu Terkait ({songQuotes.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* Results Feed */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : !initialQuery ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <Search className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Ketik Kata Kunci untuk Memulai</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cari kutipan inspiratif, lagu favorit, atau profil penulis.</p>
        </div>
      ) : quotes.length === 0 && users.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Tidak Ada Hasil Ditemukan</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Coba gunakan kata kunci lain atau periksa ejaanmu.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* User Results Row if active tab is 'all' or 'users' */}
          {(activeTab === 'all' || activeTab === 'users') && users.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 px-1">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Pengguna Ditemukan ({users.length})</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {users.map((u) => (
                  <Link
                    key={u.id}
                    href={`/profile/${u.username}`}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 flex items-center gap-3 transition-all group"
                  >
                    <img
                      src={u.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                      alt={u.name}
                      className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 object-cover ring-2 ring-indigo-500/20"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors truncate">
                        {u.name}
                      </h4>
                      <p className="text-xs text-indigo-600 font-mono">@{u.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quote Results if active tab is 'all', 'quotes', or 'songs' */}
          {(activeTab === 'all' || activeTab === 'quotes' || activeTab === 'songs') && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 px-1">
                <Quote className="w-4 h-4 text-indigo-600" />
                <span>
                  {activeTab === 'songs' ? `Kutipan dengan Lagu (${songQuotes.length})` : `Kutipan Ditemukan (${quotes.length})`}
                </span>
              </h3>

              <div className="grid grid-cols-1 gap-5">
                {(activeTab === 'songs' ? songQuotes : quotes).map((quote) => (
                  <QuoteCard key={quote.id} quote={quote} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="h-64 rounded-2xl bg-white border border-slate-200 animate-pulse" />}>
      <SearchContent />
    </Suspense>
  );
}
