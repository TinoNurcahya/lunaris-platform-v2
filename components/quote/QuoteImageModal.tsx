'use client';

import { useState, useRef } from 'react';
import { QuoteItem } from '@/types';
import { Download, X, Sparkles, Image as ImageIcon, Check, Crop, Type } from 'lucide-react';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';

interface QuoteImageModalProps {
  quote: QuoteItem;
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_THEMES = [
  {
    id: 'light',
    name: 'Minimal Light',
    bgClass: 'bg-gradient-to-br from-slate-50 via-white to-slate-100 border border-slate-200',
    textClass: 'text-slate-900',
    authorClass: 'text-indigo-600',
    subTextClass: 'text-slate-500',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-100'
  },
  {
    id: 'indigo',
    name: 'Sapphire Glow',
    bgClass: 'bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 border border-indigo-700/50',
    textClass: 'text-white',
    authorClass: 'text-indigo-300',
    subTextClass: 'text-indigo-200/70',
    badgeClass: 'bg-indigo-800/60 text-indigo-200 border-indigo-700'
  },
  {
    id: 'emerald',
    name: 'Emerald Calm',
    bgClass: 'bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-900 border border-emerald-700/50',
    textClass: 'text-white',
    authorClass: 'text-emerald-300',
    subTextClass: 'text-emerald-200/70',
    badgeClass: 'bg-emerald-800/60 text-emerald-200 border-emerald-700'
  },
  {
    id: 'rose',
    name: 'Sunset Rose',
    bgClass: 'bg-gradient-to-br from-rose-900 via-slate-900 to-purple-950 border border-rose-700/50',
    textClass: 'text-white',
    authorClass: 'text-rose-300',
    subTextClass: 'text-rose-200/70',
    badgeClass: 'bg-rose-800/60 text-rose-200 border-rose-700'
  }
];

export default function QuoteImageModal({ quote, isOpen, onClose }: QuoteImageModalProps) {
  const [selectedTheme, setSelectedTheme] = useState(PRESET_THEMES[0]);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '9:16'>('1:1');
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setDownloading(true);

    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        quality: 0.95
      });

      const link = document.createElement('a');
      link.download = `lunarys-quote-${quote.id}-${aspectRatio === '9:16' ? 'story' : 'post'}.png`;
      link.href = dataUrl;
      link.click();

      toast.success('Gambar kutipan berhasil diunduh!');
    } catch (err: unknown) {
      console.error('Error generating image:', err);
      toast.error('Gagal mengunduh gambar. Silakan coba lagi.');
    } finally {
      setDownloading(false);
    }
  };

  const getFontClass = () => {
    if (fontFamily === 'serif') return 'font-serif';
    if (fontFamily === 'mono') return 'font-mono';
    return 'font-sans';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 my-8 animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Ekspor Gambar Kutipan</h3>
              <p className="text-xs text-slate-500">Sesuaikan rasio, tema, dan font sebelum mengunduh.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aspect Ratio & Font Selection Controls */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
          
          {/* Aspect Ratio Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <Crop className="w-3 h-3 text-indigo-600" />
              <span>Rasio Kartu</span>
            </label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setAspectRatio('1:1')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  aspectRatio === '1:1'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                1:1 (Post)
              </button>
              <button
                onClick={() => setAspectRatio('9:16')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  aspectRatio === '9:16'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                9:16 (Story)
              </button>
            </div>
          </div>

          {/* Font Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <Type className="w-3 h-3 text-indigo-600" />
              <span>Gaya Font</span>
            </label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFontFamily('sans')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  fontFamily === 'sans'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Sans
              </button>
              <button
                onClick={() => setFontFamily('serif')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-serif font-semibold transition-all cursor-pointer ${
                  fontFamily === 'serif'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Serif
              </button>
              <button
                onClick={() => setFontFamily('mono')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  fontFamily === 'mono'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Mono
              </button>
            </div>
          </div>

        </div>

        {/* Theme Presets Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Pilih Tema Warna</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESET_THEMES.map((theme) => {
              const isSelected = selectedTheme.id === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme)}
                  className={`p-2 rounded-xl text-left border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="truncate">{theme.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Image Preview Card */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Pratinjau Gambar ({aspectRatio})</label>
          
          <div
            ref={cardRef}
            className={`p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col justify-between transition-all ${selectedTheme.bgClass} ${
              aspectRatio === '9:16' ? 'aspect-[9/16] min-h-[420px]' : 'aspect-square min-h-[300px]'
            }`}
          >
            {/* Top Bar inside Card */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className={`text-xs font-bold tracking-tight ${selectedTheme.textClass}`}>
                  Lunarys
                </span>
              </div>

              {quote.category && (
                <span className={`px-3 py-1 text-[11px] font-semibold rounded-full border ${selectedTheme.badgeClass}`}>
                  {quote.category.name}
                </span>
              )}
            </div>

            {/* Main Content */}
            <blockquote className="space-y-2 py-4 my-auto">
              <p className={`text-lg sm:text-xl font-medium leading-relaxed italic ${selectedTheme.textClass} ${getFontClass()}`}>
                &quot;{quote.content}&quot;
              </p>
            </blockquote>

            {/* Song Snippet inside Image if present */}
            {(quote.song_title || quote.song_artist) && (
              <div className="pt-2 mb-3 border-t border-white/10 text-xs">
                <p className={`font-semibold ${selectedTheme.authorClass}`}>
                  {quote.song_title || 'Lagu'} &mdash; {quote.song_artist || 'Artis'}
                </p>
                {quote.song_lyric_snippet && (
                  <p className={`italic line-clamp-1 mt-0.5 ${selectedTheme.subTextClass}`}>
                    &quot;{quote.song_lyric_snippet}&quot;
                  </p>
                )}
              </div>
            )}

            {/* Author Footer inside Card */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
              <div className="flex items-center gap-2.5">
                <img
                  src={quote.user?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${quote.user?.username || 'anon'}`}
                  alt={quote.user?.name || 'Anonim'}
                  className="w-8 h-8 rounded-full bg-slate-200 object-cover ring-2 ring-white/20"
                />
                <div>
                  <p className={`font-bold ${selectedTheme.textClass}`}>
                    {quote.user?.name || 'Anonim'}
                  </p>
                  <p className={`font-mono text-[11px] ${selectedTheme.subTextClass}`}>
                    @{quote.user?.username || 'lunarys'}
                  </p>
                </div>
              </div>

              <span className={`text-[10px] font-mono ${selectedTheme.subTextClass}`}>
                lunarys.app
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleDownloadImage}
          disabled={downloading}
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-2xl shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'Mengunduh Gambar...' : `Unduh PNG (${aspectRatio})`}</span>
        </button>

      </div>
    </div>
  );
}
