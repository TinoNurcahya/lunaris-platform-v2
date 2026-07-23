'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchQuoteById } from '@/services/quotes';
import { fetchCategories } from '@/services/categories';
import { Category } from '@/types';
import { createClient } from '@/utils/supabase/client';
import { Sparkles, Music, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const quoteId = parseInt(id, 10);
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const [songSnippet, setSongSnippet] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [showManualFields, setShowManualFields] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role === 'admin') {
          setIsAdmin(true);
        }
      }

      const [cats, quoteData] = await Promise.all([
        fetchCategories(),
        fetchQuoteById(quoteId)
      ]);
      setCategories(cats);

      if (quoteData) {
        setContent(quoteData.content);
        setCategoryId(quoteData.category_id || (cats[0]?.id));
        setSongTitle(quoteData.song_title || '');
        setSongArtist(quoteData.song_artist || '');
        setSongSnippet(quoteData.song_lyric_snippet || '');
        setSpotifyUrl(quoteData.spotify_url || '');
      }
      setLoading(false);
    }
    loadData();
  }, [quoteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Konten kutipan wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Silakan login terlebih dahulu');
        router.push('/login');
        return;
      }

      let updateQuery = supabase
        .from('quotes')
        .update({
          category_id: categoryId || null,
          content: content.trim(),
          song_title: songTitle.trim() || null,
          song_artist: songArtist.trim() || null,
          song_lyric_snippet: songSnippet.trim() || null,
          spotify_url: spotifyUrl.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId);

      // If not admin, restrict update to own quotes only
      if (!isAdmin) {
        updateQuery = updateQuery.eq('user_id', user.id);
      }

      const { error } = await updateQuery;

      if (error) throw error;

      toast.success('Kutipan berhasil diperbarui!');
      router.push(`/quotes/${quoteId}`);
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui kutipan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="max-w-2xl mx-auto h-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <Link
        href={`/quotes/${quoteId}`}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Batal & Kembali</span>
      </Link>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Kutipan</h2>
              {isAdmin && (
                <span className="px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 rounded-full border border-amber-200 dark:border-amber-800">
                  Mode Admin
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Perbarui kutipan atau tautan musik lagumu.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Quote Content */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Isi Kutipan / Kata Mutiara <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Tulis kutipan indahmu di sini..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 transition-all resize-none"
              required
            />
          </div>

          {/* Category Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pilih Kategori</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 transition-all"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Optional Song Integration */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-4">
            <h4 className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
              <Music className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Integrasi Musik Spotify (Opsional)</span>
            </h4>

            {/* Spotify Link Field */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Tautan Lagu / Share Link Spotify</label>
              <input
                type="text"
                placeholder="https://open.spotify.com/track/... atau tempel link Spotify di sini"
                value={spotifyUrl}
                onChange={(e) => setSpotifyUrl(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-600"
              />
            </div>

            {/* Manual Fields only when NO Spotify URL */}
            {!spotifyUrl.trim() && (
              <div className="space-y-3 pt-1">
                {!showManualFields ? (
                  <button
                    type="button"
                    onClick={() => setShowManualFields(true)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    + Tambah Judul & Artis Lagu Secara Manual
                  </button>
                ) : (
                  <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Detail Lagu Manual</span>
                      <button
                        type="button"
                        onClick={() => setShowManualFields(false)}
                        className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        Sembunyikan
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-600 dark:text-slate-400">Judul Lagu</label>
                        <input
                          type="text"
                          placeholder="Misal: Asmalibrasi"
                          value={songTitle}
                          onChange={(e) => setSongTitle(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-600 dark:text-slate-400">Nama Artis / Band</label>
                        <input
                          type="text"
                          placeholder="Misal: Soegi Bornean"
                          value={songArtist}
                          onChange={(e) => setSongArtist(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-600 dark:text-slate-400">Potongan Lirik (Lyric Snippet)</label>
                      <input
                        type="text"
                        placeholder="Misal: Jadikan hanya aku satu-satunya..."
                        value={songSnippet}
                        onChange={(e) => setSongSnippet(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Simpan...' : 'Simpan Perubahan'}</span>
          </button>
        </form>

      </div>
    </div>
  );
}
