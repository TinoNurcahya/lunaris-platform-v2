'use client';

import { useState, useEffect } from 'react';
import { fetchPublicCollections, fetchUserCollections } from '@/services/collections';
import { QuoteCollection } from '@/types';
import { FolderHeart, Globe, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function CollectionsPage() {
  const [publicCollections, setPublicCollections] = useState<QuoteCollection[]>([]);
  const [userCollections, setUserCollections] = useState<QuoteCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'public' | 'user'>('public');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const publicCols = await fetchPublicCollections();
      setPublicCollections(publicCols);

      if (user) {
        setIsLoggedIn(true);
        const userCols = await fetchUserCollections(user.id);
        setUserCollections(userCols);
      }

      setLoading(false);
    }

    loadData();
  }, []);

  const activeCollections = activeTab === 'public' ? publicCollections : userCollections;

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 p-8 sm:p-10 text-white shadow-lg">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-amber-200 bg-white/10 border border-white/20 rounded-full backdrop-blur-md">
            <FolderHeart className="w-4 h-4" />
            <span>Album & Playlist Kutipan</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
            Jelajah Koleksi
          </h1>

          <p className="text-xs sm:text-sm text-indigo-100 max-w-xl leading-relaxed">
            Temukan koleksi kutipan yang dirangkai khusus berdasarkan tema, suasana hati, dan musik favorit oleh komunitas Lunarys.
          </p>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('public')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'public'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Koleksi Publik ({publicCollections.length})</span>
        </button>

        {isLoggedIn && (
          <button
            onClick={() => setActiveTab('user')}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'user'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FolderHeart className="w-4 h-4" />
            <span>Koleksi Saya ({userCollections.length})</span>
          </button>
        )}
      </div>

      {/* Collections Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : activeCollections.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <Sparkles className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {activeTab === 'public' ? 'Belum Ada Koleksi Publik' : 'Anda Belum Memiliki Koleksi'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
            {activeTab === 'public'
              ? 'Jadilah yang pertama membuat koleksi publik!'
              : 'Klik tombol "Tambah ke Koleksi" pada kartu kutipan untuk membuat album pertama Anda.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeCollections.map((col) => (
            <Link
              key={col.id}
              href={`/collections/${col.id}`}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200 flex flex-col"
            >
              {/* Collection Cover Header */}
              <div className={`h-24 bg-gradient-to-r ${col.cover_gradient} p-4 flex items-start justify-between text-white relative`}>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold bg-black/20 backdrop-blur-md rounded-full border border-white/20">
                  {col.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  <span>{col.is_public ? 'Publik' : 'Privat'}</span>
                </div>
                <span className="text-xs font-mono font-bold bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full">
                  {col.items_count || 0} Kutipan
                </span>
              </div>

              {/* Collection Card Info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {col.name}
                  </h3>
                  {col.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {col.description}
                    </p>
                  )}
                </div>

                {col.user && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <img
                      src={col.user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${col.user.username}`}
                      alt={col.user.name}
                      className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 object-cover"
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate">
                      {col.user.name}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}
