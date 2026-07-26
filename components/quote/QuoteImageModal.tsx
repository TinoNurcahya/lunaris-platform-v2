'use client';

import { useState, useRef, useEffect } from 'react';
import { QuoteItem } from '@/types';
import { Download, X, Sparkles, Image as ImageIcon, Check, Crop, Type, Sliders, Upload } from 'lucide-react';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';

interface QuoteImageModalProps {
  quote: QuoteItem;
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_THEMES = [
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
    id: 'light',
    name: 'Minimal Light',
    bgClass: 'bg-gradient-to-br from-slate-50 via-white to-slate-100 border border-slate-200',
    textClass: 'text-slate-900',
    authorClass: 'text-indigo-600',
    subTextClass: 'text-slate-500',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-100'
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

const PHOTO_BACKGROUNDS = [
  { id: 'none', name: 'Tanpa Foto', url: null },
  { id: 'starry', name: 'Malam Berbintang', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80' },
  { id: 'rainy', name: 'Hujan di Kota', url: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=800&q=80' },
  { id: 'sunset', name: 'Senja Awan', url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=800&q=80' },
  { id: 'forest', name: 'Hutan Pinus', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80' },
  { id: 'coffee', name: 'Kopi & Buku', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80' },
];

export default function QuoteImageModal({ quote, isOpen, onClose }: QuoteImageModalProps) {
  const [selectedTheme, setSelectedTheme] = useState(PRESET_THEMES[0]);
  const [selectedPhoto, setSelectedPhoto] = useState(PHOTO_BACKGROUNDS[0]);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '9:16'>('1:1');
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.6);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCustomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Silakan pilih file gambar (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ukuran gambar terlalu besar (maksimal 10MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setSelectedPhoto({ id: 'custom', name: 'Foto Saya', url: dataUrl });
        toast.success('Foto latar belakang berhasil dipasang!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto cursor-pointer py-8"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 my-auto animate-in fade-in zoom-in duration-150 cursor-default"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Ekspor Gambar Kutipan</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pilih wallpaper estetik & sesuaikan gaya kartu.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aspect Ratio & Font Selection Controls */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
          
          {/* Aspect Ratio Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <Crop className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              <span>Rasio Kartu</span>
            </label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setAspectRatio('1:1')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  aspectRatio === '1:1'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                }`}
              >
                1:1 (Post)
              </button>
              <button
                onClick={() => setAspectRatio('9:16')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  aspectRatio === '9:16'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                }`}
              >
                9:16 (Story)
              </button>
            </div>
          </div>

          {/* Font Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <Type className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              <span>Gaya Font</span>
            </label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFontFamily('sans')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  fontFamily === 'sans'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                }`}
              >
                Sans
              </button>
              <button
                onClick={() => setFontFamily('serif')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-serif font-semibold transition-all cursor-pointer ${
                  fontFamily === 'serif'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                }`}
              >
                Serif
              </button>
              <button
                onClick={() => setFontFamily('mono')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  fontFamily === 'mono'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                }`}
              >
                Mono
              </button>
            </div>
          </div>

        </div>

        {/* Wallpaper Photo Presets & Custom Upload */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pilih Foto Latar Belakang</label>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">Bisa Upload Sendiri</span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleCustomPhotoUpload}
          />

          <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
            {/* Custom Photo Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`h-14 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-1 transition-all cursor-pointer ${
                selectedPhoto.id === 'custom'
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                  : 'border-indigo-300 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/60'
              }`}
              title="Unggah foto sendiri dari perangkat Anda"
            >
              <Upload className="w-4 h-4 mb-0.5" />
              <span className="text-[9px] font-bold truncate">Unggah Foto</span>
            </button>

            {PHOTO_BACKGROUNDS.map((photo) => {
              const isSelected = selectedPhoto.id === photo.id;
              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setSelectedPhoto(photo)}
                  className={`h-14 rounded-xl border text-[10px] font-semibold flex flex-col items-center justify-end p-1 transition-all overflow-hidden relative cursor-pointer ${
                    isSelected ? 'ring-2 ring-indigo-600 border-white' : 'border-slate-200 dark:border-slate-700'
                  }`}
                  style={photo.url ? { backgroundImage: `url(${photo.url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                >
                  {photo.url && <div className="absolute inset-0 bg-black/40" />}
                  <span className="relative z-10 text-white drop-shadow-md truncate text-[9px]">
                    {photo.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Overlay Opacity Slider (When Photo is Active) */}
        {selectedPhoto.url && (
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <span>Gelap Latar (Overlay)</span>
            </span>
            <input
              type="range"
              min="0.2"
              max="0.9"
              step="0.05"
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
              className="w-28 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        )}

        {/* Theme Presets Selection (When no photo is active) */}
        {!selectedPhoto.url && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pilih Tema Gradien</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_THEMES.map((theme) => {
                const isSelected = selectedTheme.id === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme)}
                    className={`p-2 rounded-xl text-left border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="truncate">{theme.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Image Preview Card */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pratinjau Gambar ({aspectRatio})</label>
          
          <div
            ref={cardRef}
            className={`relative overflow-hidden p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col justify-between transition-all w-full mx-auto ${
              selectedPhoto.url ? 'bg-slate-900 text-white' : selectedTheme.bgClass
            } ${
              aspectRatio === '9:16' ? 'aspect-[9/16] max-h-[380px]' : 'aspect-square max-h-[300px]'
            }`}
            style={selectedPhoto.url ? { backgroundImage: `url(${selectedPhoto.url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
          >
            {/* Dark Overlay Layer for Photo Background */}
            {selectedPhoto.url && (
              <div
                className="absolute inset-0 bg-slate-950 transition-opacity"
                style={{ opacity: overlayOpacity }}
              />
            )}

            {/* Top Bar inside Card */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className={`text-xs font-bold tracking-tight ${selectedPhoto.url ? 'text-white' : selectedTheme.textClass}`}>
                  Lunarys
                </span>
              </div>

              {quote.category && (
                <span className={`px-3 py-1 text-[11px] font-semibold rounded-full border ${selectedPhoto.url ? 'bg-white/20 text-white border-white/30 backdrop-blur-md' : selectedTheme.badgeClass}`}>
                  {quote.category.name}
                </span>
              )}
            </div>

            {/* Main Content */}
            <blockquote className="relative z-10 space-y-2 py-4 my-auto">
              <p className={`text-lg sm:text-xl font-medium leading-relaxed italic ${selectedPhoto.url ? 'text-white drop-shadow-md' : selectedTheme.textClass} ${getFontClass()}`}>
                &quot;{quote.content}&quot;
              </p>
            </blockquote>

            {/* Song Snippet inside Image if present */}
            {(quote.song_title || quote.song_artist) && (
              <div className="relative z-10 pt-2 mb-3 border-t border-white/20 text-xs">
                <p className={`font-semibold ${selectedPhoto.url ? 'text-indigo-200' : selectedTheme.authorClass}`}>
                  {quote.song_title || 'Lagu'} &mdash; {quote.song_artist || 'Artis'}
                </p>
                {quote.song_lyric_snippet && (
                  <p className={`italic line-clamp-1 mt-0.5 ${selectedPhoto.url ? 'text-white/80' : selectedTheme.subTextClass}`}>
                    &quot;{quote.song_lyric_snippet}&quot;
                  </p>
                )}
              </div>
            )}

            {/* Author Footer inside Card */}
            <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/20 text-xs">
              <div className="flex items-center gap-2.5">
                <img
                  src={quote.user?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${quote.user?.username || 'anon'}`}
                  alt={quote.user?.name || 'Anonim'}
                  className="w-8 h-8 rounded-full bg-slate-200 object-cover ring-2 ring-white/30"
                />
                <div>
                  <p className={`font-bold ${selectedPhoto.url ? 'text-white' : selectedTheme.textClass}`}>
                    {quote.user?.name || 'Anonim'}
                  </p>
                  <p className={`font-mono text-[11px] ${selectedPhoto.url ? 'text-white/70' : selectedTheme.subTextClass}`}>
                    @{quote.user?.username || 'lunarys'}
                  </p>
                </div>
              </div>

              <span className={`text-[10px] font-mono ${selectedPhoto.url ? 'text-white/70' : selectedTheme.subTextClass}`}>
                lunarys-platform.vercel.app
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
