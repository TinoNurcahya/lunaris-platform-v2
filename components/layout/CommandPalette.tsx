'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Quote, User, Folder, X, ExternalLink } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { QuoteItem, Profile, Category } from '@/types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setQuotes([]);
      setUsers([]);
      setCategories([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setQuotes([]);
      setUsers([]);
      setCategories([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();
      const searchTerm = `%${query.trim()}%`;

      const [{ data: quotesData }, { data: usersData }, { data: categoriesData }] = await Promise.all([
        supabase
          .from('quotes')
          .select('*, user:profiles(*), category:categories(*)')
          .eq('status', 'approved')
          .or(`content.ilike.${searchTerm},song_title.ilike.${searchTerm}`)
          .limit(4),
        supabase
          .from('profiles')
          .select('*')
          .or(`name.ilike.${searchTerm},username.ilike.${searchTerm}`)
          .limit(3),
        supabase
          .from('categories')
          .select('*')
          .or(`name.ilike.${searchTerm},slug.ilike.${searchTerm}`)
          .limit(3)
      ]);

      setQuotes((quotesData as QuoteItem[]) || []);
      setUsers((usersData as Profile[]) || []);
      setCategories((categoriesData as Category[]) || []);
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const navigateTo = (path: string) => {
    router.push(path);
    onClose();
  };

  const handleFullSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      navigateTo(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] my-auto"
      >
        
        {/* Input Bar */}
        <form onSubmit={handleFullSearch} className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Cari kutipan, pengguna, atau kata kunci..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full py-4 px-3 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 bg-transparent focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
          >
            ESC
          </button>
        </form>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!query.trim() ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Mulai mengetik untuk mencari kata-kata, nama pengguna, atau kategori.
            </div>
          ) : loading ? (
            <div className="py-8 text-center text-xs text-indigo-600 font-semibold animate-pulse">
              Mencari data...
            </div>
          ) : quotes.length === 0 && users.length === 0 && categories.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Tidak ada hasil yang sesuai dengan "{query}"
            </div>
          ) : (
            <>
              {/* Full Search Action Option */}
              <button
                onClick={() => handleFullSearch()}
                className="w-full p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-between text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors cursor-pointer"
              >
                <span>Lihat Semua Hasil Pencarian untuk "{query}"</span>
                <ExternalLink className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </button>

              {/* Users Result */}
              {users.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                    Pengguna
                  </span>
                  <div className="space-y-1">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => navigateTo(`/profile/${u.username}`)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
                      >
                        <img
                          src={u.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                          alt={u.name}
                          className="w-8 h-8 rounded-full bg-slate-200 object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-white">{u.name}</p>
                          <p className="text-[11px] text-indigo-600 font-mono">@{u.username}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories Result */}
              {categories.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                    Kategori
                  </span>
                  <div className="space-y-1">
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => navigateTo(`/?category=${c.id}`)}
                        className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
                      >
                        <Folder className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span className="text-xs font-bold text-slate-800 dark:text-white">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quotes Result */}
              {quotes.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                    Kutipan
                  </span>
                  <div className="space-y-1">
                    {quotes.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => navigateTo(`/quotes/${q.id}`)}
                        className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors space-y-1 cursor-pointer"
                      >
                        <p className="text-xs text-slate-800 dark:text-slate-200 font-medium italic line-clamp-2">
                          "{q.content}"
                        </p>
                        <p className="text-[10px] text-slate-400">
                          oleh {q.user?.name || 'Anonim'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}
