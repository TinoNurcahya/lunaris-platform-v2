'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchCategories } from '@/services/categories';
import { Category } from '@/types';
import { createClient } from '@/utils/supabase/client';
import { Sparkles, Music, Send, ArrowLeft, Eye } from 'lucide-react';
import { MOOD_OPTIONS } from '@/components/quote/MoodFilterWidget';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CreateQuotePage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [mood, setMood] = useState<string>('all');
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const [songSnippet, setSongSnippet] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [showManualFields, setShowManualFields] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userName, setUserName] = useState('Anda');
  const [userHandle, setUserHandle] = useState('username');
  const [userAvatar, setUserAvatar] = useState('');

  useEffect(() => {
    fetchCategories().then((cats) => {
      setCategories(cats);
      if (cats.length > 0) setCategoryId(cats[0].id);
    });

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from('profiles')
          .select('name, username, avatar_url')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setUserName(data.name);
              setUserHandle(data.username);
              setUserAvatar(data.avatar_url || '');
            }
          });
      }
    });
  }, []);

  const selectedCategoryObj = categories.find((c) => c.id === categoryId);

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
        toast.error('Silakan login terlebih dahulu untuk membuat kutipan');
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('quotes')
        .insert({
          user_id: user.id,
          category_id: categoryId || null,
          content: content.trim(),
          mood: mood !== 'all' ? mood : null,
          song_title: songTitle.trim() || null,
          song_artist: songArtist.trim() || null,
          song_lyric_snippet: songSnippet.trim() || null,
          spotify_url: spotifyUrl.trim() || null,
          status: 'approved'
        })
        .select()
        .single();

      if (error) throw error;

      // Add XP to user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('xp, level')
        .eq('id', user.id)
        .single();

      if (profile) {
        const newXp = (profile.xp || 0) + 15;
        const newLevel = Math.floor(newXp / 100) + 1;
        await supabase.from('profiles').update({ xp: newXp, level: newLevel }).eq('id', user.id);
      }

      toast.success('Kutipan berhasil diterbitkan! (+15 XP)');
      router.push(`/quotes/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Gagal membuat kutipan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Batal & Kembali</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Creation Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Studio Pembuat Kutipan</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tulis inspirasi Anda dan lihat pratinjau kartu secara langsung.</p>
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

            {/* Mood Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pilih Suasana Hati (Mood)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MOOD_OPTIONS.map((m) => {
                  const Icon = m.icon;
                  const isSelected = mood === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMood(m.id)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? `${m.activeClass} border-transparent`
                          : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                        <span className="truncate text-[11px]">{m.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Song Integration */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-4">
              <h4 className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                <Music className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Integrasi Musik Spotify (Opsional)</span>
              </h4>

              {/* Spotify Link Field (Primary) */}
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

              {/* Toggle or Show manual fields only when NO Spotify URL is entered */}
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
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-2xl shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Menerbitkan...' : 'Terbitkan Kutipan (+15 XP)'}</span>
            </button>
          </form>
        </div>

        {/* Right Side: Sticky Live Preview Studio */}
        <div className="lg:col-span-5 sticky top-24 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Pratinjau Langsung (Live Preview)</span>
          </div>

          <div className="group relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-md transition-all">
            {/* Top Bar inside Card */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={userAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${userHandle}`}
                  alt={userName}
                  className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 object-cover ring-2 ring-indigo-500/20"
                />
                <div>
                  <h4 className="text-base font-semibold text-slate-900 dark:text-white">{userName}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">@{userHandle}</p>
                </div>
              </div>

              {selectedCategoryObj && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-800 rounded-full">
                  {selectedCategoryObj.name}
                </span>
              )}
            </div>

            {/* Quote Content */}
            <blockquote className="relative my-4">
              <p className="text-lg font-medium text-slate-800 dark:text-slate-100 leading-relaxed italic">
                "{content || 'Pratinjau isi kutipan Anda akan muncul di sini saat diketik...'}"
              </p>
            </blockquote>

            {/* Song Card Snippet or Spotify Preview */}
            {spotifyUrl.trim() ? (
              <div className="my-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <Music className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Player Spotify Aktif</span>
              </div>
            ) : (songTitle || songArtist) ? (
              <div className="my-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0">
                  <Music className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {songTitle || 'Judul Lagu'}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                    {songArtist || 'Nama Artis'}
                  </p>
                  {songSnippet && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-1 mt-0.5">
                      "{songSnippet}"
                    </p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>

      </div>
    </div>
  );
}
