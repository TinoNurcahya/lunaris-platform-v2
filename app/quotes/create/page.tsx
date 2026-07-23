'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchCategories } from '@/services/categories';
import { Category } from '@/types';
import { createClient } from '@/utils/supabase/client';
import { Sparkles, Music, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CreateQuotePage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const [songSnippet, setSongSnippet] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories().then((cats) => {
      setCategories(cats);
      if (cats.length > 0) setCategoryId(cats[0].id);
    });
  }, []);

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
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Batal & Kembali</span>
      </Link>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Buat Kutipan Baru</h2>
            <p className="text-xs text-slate-500">Bagikan kata mutiara, inspirasi, atau lirik lagu favoritmu.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Quote Content */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Isi Kutipan / Kata Mutiara <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Tulis kutipan indahmu di sini..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all resize-none"
              required
            />
          </div>

          {/* Category Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Pilih Kategori</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-white text-slate-800">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Optional Song Integration */}
          <div className="border-t border-slate-100 pt-4 space-y-4">
            <h4 className="text-xs font-semibold text-indigo-700 flex items-center gap-2">
              <Music className="w-4 h-4 text-indigo-600" />
              <span>Integrasi Musik & Lirik (Opsional)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-600 font-medium">Judul Lagu</label>
                <input
                  type="text"
                  placeholder="Misal: Asmalibrasi"
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-600 font-medium">Nama Artis / Band</label>
                <input
                  type="text"
                  placeholder="Misal: Soegi Bornean"
                  value={songArtist}
                  onChange={(e) => setSongArtist(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-600 font-medium">Potongan Lirik (Lyric Snippet)</label>
              <input
                type="text"
                placeholder="Misal: Jadikan hanya aku satu-satunya..."
                value={songSnippet}
                onChange={(e) => setSongSnippet(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-600 font-medium">Tautan Spotify</label>
              <input
                type="url"
                placeholder="https://open.spotify.com/track/..."
                value={spotifyUrl}
                onChange={(e) => setSpotifyUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-md shadow-indigo-600/20 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Menerbitkan...' : 'Terbitkan Kutipan (+15 XP)'}</span>
          </button>
        </form>

      </div>
    </div>
  );
}
