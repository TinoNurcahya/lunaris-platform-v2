'use client';

import { useState } from 'react';
import { QuoteItem } from '@/types';
import { X, BookOpen, Type, Sparkles } from 'lucide-react';

interface ReaderViewModalProps {
  quote: QuoteItem;
  isOpen: boolean;
  onClose: () => void;
}

const THEME_OPTIONS = [
  { id: 'sepia', name: 'Warm Sepia', bgClass: 'bg-[#fbf0d9] text-[#433422]', fontClass: 'font-serif' },
  { id: 'white', name: 'Pure White', bgClass: 'bg-white text-slate-900', fontClass: 'font-sans' },
  { id: 'mint', name: 'Soft Mint', bgClass: 'bg-[#eef7f2] text-[#1b4332]', fontClass: 'font-sans' },
  { id: 'dark', name: 'Midnight', bgClass: 'bg-[#18181b] text-[#f4f4f5]', fontClass: 'font-mono' },
];

export default function ReaderViewModal({ quote, isOpen, onClose }: ReaderViewModalProps) {
  const [theme, setTheme] = useState(THEME_OPTIONS[0]);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('large');

  if (!isOpen) return null;

  const fontSizes = {
    normal: 'text-lg sm:text-xl leading-relaxed',
    large: 'text-xl sm:text-2xl leading-relaxed',
    huge: 'text-2xl sm:text-3xl leading-loose',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden space-y-6 animate-in fade-in zoom-in duration-150 my-8">
        
        {/* Controls Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Mode Fokus Pembaca</h3>
          </div>

          <div className="flex items-center gap-3">
            {/* Font Size Selector */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setFontSize('normal')}
                className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  fontSize === 'normal' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  fontSize === 'large' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('huge')}
                className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  fontSize === 'huge' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                A+
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Theme Tabs */}
        <div className="px-6 flex items-center gap-2 overflow-x-auto">
          {THEME_OPTIONS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                theme.id === t.id
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Reader Paper Canvas */}
        <div className="px-6 pb-6">
          <div className={`p-8 sm:p-12 rounded-3xl border border-black/5 shadow-inner space-y-8 ${theme.bgClass}`}>
            
            {/* Header info inside paper */}
            <div className="flex items-center justify-between border-b border-current/10 pb-4 opacity-70 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="font-semibold tracking-wide">Lunarys Focus Reader</span>
              </div>
              {quote.category && (
                <span className="font-semibold uppercase tracking-wider text-[10px]">
                  {quote.category.name}
                </span>
              )}
            </div>

            {/* Main Quote Text */}
            <blockquote className={`font-medium ${fontSizes[fontSize]} ${theme.fontClass}`}>
              "{quote.content}"
            </blockquote>

            {/* Song Snippet if present */}
            {(quote.song_title || quote.song_artist) && (
              <div className="pt-4 border-t border-current/10 opacity-80 text-xs">
                <p className="font-semibold">
                  Musik: {quote.song_title || 'Lagu'} — {quote.song_artist || 'Artis'}
                </p>
                {quote.song_lyric_snippet && (
                  <p className="italic mt-1">"{quote.song_lyric_snippet}"</p>
                )}
              </div>
            )}

            {/* Author Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-current/10 opacity-70 text-xs">
              <div>
                <p className="font-bold">{quote.user?.name || 'Anonim'}</p>
                <p className="font-mono text-[11px]">@{quote.user?.username || 'lunarys'}</p>
              </div>

              <span className="text-[10px] font-mono">
                {new Date(quote.created_at).toLocaleDateString('id-ID')}
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
