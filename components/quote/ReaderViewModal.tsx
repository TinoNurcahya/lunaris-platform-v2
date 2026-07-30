'use client';

import { useState, useEffect, useRef } from 'react';
import { QuoteItem } from '@/types';
import { X, BookOpen, Sparkles, Volume2, VolumeX, CloudRain, Waves, Wind, Music, Play, Pause } from 'lucide-react';

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

const AMBIENT_TRACKS = [
  { id: 'none', name: 'Mute', icon: VolumeX },
  { id: 'rain', name: 'Hujan Tenang', icon: CloudRain },
  { id: 'waves', name: 'Ombak Laut', icon: Waves },
  { id: 'breeze', name: 'Angin Malam', icon: Wind },
  { id: 'lofi', name: 'Lo-Fi Melodi', icon: Music },
];

export default function ReaderViewModal({ quote, isOpen, onClose }: ReaderViewModalProps) {
  const [theme, setTheme] = useState(THEME_OPTIONS[0]);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('large');
  
  // Ambient Sound State
  const [selectedTrack, setSelectedTrack] = useState<string>('none');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<AudioNode | null>(null);

  const stopAmbientSound = () => {
    if (sourceNodeRef.current) {
      try {
        if ('stop' in sourceNodeRef.current && typeof (sourceNodeRef.current as AudioBufferSourceNode).stop === 'function') {
          (sourceNodeRef.current as AudioBufferSourceNode).stop();
        }
        sourceNodeRef.current.disconnect();
      } catch {}
      sourceNodeRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try {
        audioCtxRef.current.close();
      } catch {}
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    if (!isOpen) {
      if (sourceNodeRef.current) {
        try {
          if ('stop' in sourceNodeRef.current && typeof (sourceNodeRef.current as AudioBufferSourceNode).stop === 'function') {
            (sourceNodeRef.current as AudioBufferSourceNode).stop();
          }
          sourceNodeRef.current.disconnect();
        } catch {}
        sourceNodeRef.current = null;
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try {
          audioCtxRef.current.close();
        } catch {}
        audioCtxRef.current = null;
      }
    }
  }, [isOpen]);

  const playAmbientSound = (trackId: string, currentVol: number) => {
    stopAmbientSound();
    if (trackId === 'none') return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(currentVol, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Generate White / Pink Noise for natural ambient sounds
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (trackId === 'rain') {
          // Pink noise filter for rain
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
        } else if (trackId === 'waves') {
          // Deep ocean noise
          output[i] = Math.sin(i / 400) * 0.3 + white * 0.1;
        } else if (trackId === 'breeze') {
          // Soft breeze noise
          output[i] = Math.sin(i / 1200) * 0.2 + white * 0.05;
        } else {
          // Lo-fi chord frequency combination
          output[i] = (Math.sin(i / 20) + Math.sin(i / 30) + Math.sin(i / 45)) * 0.15;
        }
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter Node
      const filter = ctx.createBiquadFilter();
      if (trackId === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, ctx.currentTime);
      } else if (trackId === 'waves') {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, ctx.currentTime);
      } else if (trackId === 'breeze') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, ctx.currentTime);
      } else {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, ctx.currentTime);
      }

      whiteNoise.connect(filter);
      filter.connect(masterGain);

      whiteNoise.start();
      sourceNodeRef.current = whiteNoise;
      setIsPlaying(true);
    } catch (e) {
      console.error('Audio synthesis failed:', e);
    }
  };

  const handleSelectTrack = (trackId: string) => {
    setSelectedTrack(trackId);
    if (trackId === 'none') {
      stopAmbientSound();
    } else {
      playAmbientSound(trackId, volume);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      stopAmbientSound();
    } else if (selectedTrack !== 'none') {
      playAmbientSound(selectedTrack, volume);
    } else {
      handleSelectTrack('rain');
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(newVol, audioCtxRef.current.currentTime);
    }
  };

  // Stop sound & close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopAmbientSound();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const fontSizes = {
    normal: 'text-lg sm:text-xl leading-relaxed',
    large: 'text-xl sm:text-2xl leading-relaxed',
    huge: 'text-2xl sm:text-3xl leading-loose',
  };

  return (
    <div
      onClick={() => {
        stopAmbientSound();
        onClose();
      }}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto cursor-pointer py-8"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden space-y-5 animate-in fade-in zoom-in duration-150 my-auto cursor-default"
      >
        
        {/* Top Controls Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Mode Baca Fokus</h3>
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
              onClick={() => {
                stopAmbientSound();
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Ambient Sound Control Toolbar */}
        <div className="px-6 flex flex-wrap items-center justify-between gap-3 bg-indigo-50/60 dark:bg-indigo-950/40 p-3 mx-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/60">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlayPause}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-all cursor-pointer shadow-xs ${
                isPlaying ? 'bg-indigo-600' : 'bg-slate-400 dark:bg-slate-700'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            
            <div className="text-xs">
              <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span>Musik Latar Suasana</span>
                {isPlaying && (
                  <span className="flex items-center gap-0.5">
                    <span className="w-1 h-3 bg-indigo-500 rounded-full animate-bounce" />
                    <span className="w-1 h-4 bg-indigo-500 rounded-full animate-bounce delay-100" />
                    <span className="w-1 h-2 bg-indigo-500 rounded-full animate-bounce delay-200" />
                  </span>
                )}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {selectedTrack === 'none' ? 'Mute' : AMBIENT_TRACKS.find((t) => t.id === selectedTrack)?.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Track Selector Buttons */}
            <div className="flex items-center gap-1">
              {AMBIENT_TRACKS.map((t) => {
                const Icon = t.icon;
                const isSelected = selectedTrack === t.id;

                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTrack(t.id)}
                    className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                    title={t.name}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>

            {/* Volume Slider */}
            {selectedTrack !== 'none' && (
              <div className="flex items-center gap-1 pl-2 border-l border-indigo-200 dark:border-indigo-800">
                <Volume2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-16 h-1 bg-indigo-200 dark:bg-indigo-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            )}
          </div>
        </div>

        {/* Paper Color Theme Tabs */}
        <div className="px-6 flex items-center gap-2 overflow-x-auto">
          {THEME_OPTIONS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
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
              &quot;{quote.content}&quot;
            </blockquote>

            {/* Song Snippet if present */}
            {(quote.song_title || quote.song_artist) && (
              <div className="pt-4 border-t border-current/10 opacity-80 text-xs">
                <p className="font-semibold">
                  Musik: {quote.song_title || 'Lagu'} — {quote.song_artist || 'Artis'}
                </p>
                {quote.song_lyric_snippet && (
                  <p className="italic mt-1">&quot;{quote.song_lyric_snippet}&quot;</p>
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
