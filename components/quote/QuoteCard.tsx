'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Copy,
  Edit,
  Music,
  Maximize2,
  BookOpen,
  ThumbsDown,
  AlertTriangle,
  Pin,
  FolderPlus
} from 'lucide-react';
import { QuoteItem } from '@/types';
import { toggleVote, toggleBookmark, togglePinQuote } from '@/services/quotes';
import { createClient } from '@/utils/supabase/client';
import ReportDialog from './ReportDialog';
import QuoteImageModal from './QuoteImageModal';
import ReaderViewModal from './ReaderViewModal';
import AddToCollectionModal from '../collection/AddToCollectionModal';
import { MOOD_OPTIONS } from './MoodFilterWidget';
import { toast } from 'sonner';

interface QuoteCardProps {
  quote: QuoteItem;
  currentUserId?: string;
}

function getSpotifyEmbedUrl(inputUrl?: string | null): string | null {
  if (!inputUrl) return null;

  if (inputUrl.includes('open.spotify.com/embed')) {
    return inputUrl;
  }

  const match = inputUrl.match(/(?:spotify\.com(?:\/[a-z]{2}(?:-[a-z]{2})?)?|spotify:)(?:\/|:)?(track|album|playlist|episode)(?:\/|:)([a-zA-Z0-9]+)/i);
  if (match) {
    const type = match[1].toLowerCase();
    const id = match[2];
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
  }

  return null;
}

export default function QuoteCard({ quote, currentUserId }: QuoteCardProps) {
  const [likesCount, setLikesCount] = useState(quote.likes_count || 0);
  const [dislikesCount, setDislikesCount] = useState(quote.dislikes_count || 0);
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(quote.user_vote || null);
  const [isBookmarked, setIsBookmarked] = useState(quote.is_bookmarked || false);
  const [isPinned, setIsPinned] = useState(quote.is_pinned || false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [readerModalOpen, setReaderModalOpen] = useState(false);
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);

  const [prevQuote, setPrevQuote] = useState(quote);
  if (prevQuote !== quote) {
    setPrevQuote(quote);
    setIsBookmarked(quote.is_bookmarked || false);
    setLikesCount(quote.likes_count || 0);
    setDislikesCount(quote.dislikes_count || 0);
    setUserVote(quote.user_vote || null);
    setIsPinned(quote.is_pinned || false);
  }

  useEffect(() => {
    if (currentUserId) {
      const supabase = createClient();
      supabase.from('profiles').select('role').eq('id', currentUserId).single().then(({ data }) => {
        if (data?.role === 'admin') setIsAdmin(true);
      });
    }
  }, [currentUserId]);

  const spotifyEmbedUrl = getSpotifyEmbedUrl(quote.spotify_url);

  const handleVote = async (type: 'like' | 'dislike') => {
    try {
      if (userVote === type) {
        if (type === 'like') setLikesCount((prev) => Math.max(0, prev - 1));
        if (type === 'dislike') setDislikesCount((prev) => Math.max(0, prev - 1));
        setUserVote(null);
      } else {
        if (userVote === 'like') setLikesCount((prev) => Math.max(0, prev - 1));
        if (userVote === 'dislike') setDislikesCount((prev) => Math.max(0, prev - 1));

        if (type === 'like') setLikesCount((prev) => prev + 1);
        if (type === 'dislike') setDislikesCount((prev) => prev + 1);
        setUserVote(type);
      }

      await toggleVote(quote.id, type);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memberikan tanggapan';
      toast.error(message);
      setLikesCount(quote.likes_count || 0);
      setDislikesCount(quote.dislikes_count || 0);
      setUserVote(quote.user_vote || null);
    }
  };

  const handleBookmarkToggle = async () => {
    try {
      const bookmarked = await toggleBookmark(quote.id);
      setIsBookmarked(bookmarked);
      toast.success(bookmarked ? 'Kutipan disimpan ke Bookmark' : 'Kutipan dihapus dari Bookmark');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan bookmark';
      toast.error(message);
    }
  };

  const handlePinToggle = async () => {
    try {
      const pinned = await togglePinQuote(quote.id, isPinned);
      setIsPinned(pinned);
      toast.success(pinned ? 'Kutipan disematkan di paling atas profil!' : 'Kutipan dilepas dari sematan profil.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menyematkan kutipan';
      toast.error(message);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/quotes/${quote.id}`);
      toast.success('Tautan kutipan berhasil disalin!');
    }
  };

  const handleCopyText = () => {
    if (navigator.clipboard) {
      const authorText = quote.user?.name ? ` - ${quote.user.name}` : '';
      const songText = quote.song_title ? ` (${quote.song_title})` : '';
      const textToCopy = `"${quote.content}"${authorText}${songText}\n\n(via Lunarys)`;
      navigator.clipboard.writeText(textToCopy);
      toast.success('Teks kutipan berhasil disalin!');
    }
  };

  return (
    <>
      <div className={`group relative overflow-hidden rounded-2xl border bg-white dark:bg-slate-900 p-6 shadow-sm transition-all duration-200 hover:shadow-md ${
        isPinned ? 'border-amber-300 dark:border-amber-500/50 ring-1 ring-amber-300/50' : 'border-slate-200/90 dark:border-slate-800 hover:border-indigo-300'
      }`}>
        
        {/* Top Bar: Author & Category & Pinned Status */}
        <div className="flex items-center justify-between mb-4">
          {quote.user ? (
            <Link href={`/profile/${quote.user.username}`} className="flex items-center gap-3 group/author">
              <Image
                src={quote.user.avatar_url?.trim() ? quote.user.avatar_url : `https://api.dicebear.com/7.x/bottts/svg?seed=${quote.user.username}`}
                alt={quote.user.name}
                width={40}
                height={40}
                unoptimized
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 object-cover ring-2 ring-indigo-500/20 group-hover/author:ring-indigo-500 transition-all"
              />
              <div>
                <h4 className="text-base font-semibold text-slate-900 dark:text-white group-hover/author:text-indigo-600 transition-colors">
                  {quote.user.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">@{quote.user.username}</p>
              </div>
            </Link>
          ) : (
            <span className="text-sm font-medium text-slate-500">Anonim</span>
          )}

          <div className="flex items-center gap-2">
            {isPinned && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 rounded-full shadow-2xs">
                <Pin className="w-3 h-3 fill-amber-600" />
                <span>Tersemat</span>
              </span>
            )}

            {quote.mood && (() => {
              const moodConfig = MOOD_OPTIONS.find((m) => m.id === quote.mood);
              if (!moodConfig || moodConfig.id === 'all') return null;
              const MoodIcon = moodConfig.icon;

              return (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${moodConfig.badgeClass}`}>
                  <MoodIcon className="w-3 h-3" />
                  <span>{moodConfig.label}</span>
                </span>
              );
            })()}

            {quote.category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-800 rounded-full">
                {quote.category.name}
              </span>
            )}

            {currentUserId === quote.user_id && (
              <button
                onClick={handlePinToggle}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isPinned ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/60' : 'text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={isPinned ? "Lepas Sematan" : "Sematkan di Paling Atas Profil"}
              >
                <Pin className={`w-4 h-4 ${isPinned ? 'fill-amber-600 text-amber-600' : ''}`} />
              </button>
            )}

            {(currentUserId === quote.user_id || isAdmin) && (
              <Link
                href={`/quotes/${quote.id}/edit`}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title={isAdmin && currentUserId !== quote.user_id ? "Edit Kutipan (Mode Admin)" : "Edit Kutipan"}
              >
                <Edit className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Quote Content */}
        <blockquote className="relative my-4">
          <p className="text-slate-800 dark:text-slate-100 text-base sm:text-lg leading-relaxed font-normal font-sans italic transition-colors duration-200">
            &quot;{quote.content}&quot;
          </p>
        </blockquote>

        {/* Embedded Song Integration */}
        {(spotifyEmbedUrl || quote.song_title) && (
          <div className="my-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors duration-200">
                <Music className="w-4 h-4 text-emerald-600 dark:text-emerald-400 transition-colors duration-200" />
                <span>{quote.song_title || 'Lagu Terkait'}</span>
                {quote.song_artist && <span className="text-slate-400 font-normal">• {quote.song_artist}</span>}
              </div>
            </div>

            {quote.song_lyric_snippet && (
              <p className="text-xs text-slate-600 dark:text-slate-400 italic border-l-2 border-emerald-500 pl-2 py-0.5 transition-colors duration-200">
                &quot;{quote.song_lyric_snippet}&quot;
              </p>
            )}

            {spotifyEmbedUrl && (
              <div className="pt-1 overflow-hidden rounded-lg">
                <iframe
                  src={spotifyEmbedUrl}
                  width="100%"
                  height="80"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="rounded-lg shadow-2xs"
                />
              </div>
            )}
          </div>
        )}

        {/* Card Footer Actions Bar */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs sm:text-sm transition-colors duration-200">
          
          {/* Like, Dislike & Comment Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleVote('like')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors font-semibold cursor-pointer ${
                userVote === 'like'
                  ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/60'
                  : 'hover:text-rose-600 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              title="Suka Kutipan Ini"
            >
              <Heart className={`w-4 h-4 ${userVote === 'like' ? 'fill-rose-600' : ''}`} />
              <span>{likesCount}</span>
            </button>

            <button
              onClick={() => handleVote('dislike')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors font-semibold cursor-pointer ${
                userVote === 'dislike'
                  ? 'text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-700'
                  : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              title="Kurang Suka"
            >
              <ThumbsDown className={`w-4 h-4 ${userVote === 'dislike' ? 'fill-slate-700 dark:fill-slate-200' : ''}`} />
              <span>{dislikesCount}</span>
            </button>

            <Link
              href={`/quotes/${quote.id}`}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-semibold"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{quote.comments_count || 0}</span>
            </Link>
          </div>

          {/* Utility Tools (Reader Mode, Export Image, Copy, Bookmark, Report) */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setReaderModalOpen(true)}
              className="p-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Mode Baca Fokus"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            <button
              onClick={() => setImageModalOpen(true)}
              className="p-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Ekspor sebagai Kartu Gambar"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleCopyText}
              className="p-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Salin Teks Kutipan"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              onClick={handleShare}
              className="p-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Bagikan Tautan"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleBookmarkToggle}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isBookmarked ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60' : 'hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
              title="Simpan ke Bookmark"
            >
              <Bookmark className={`w-4 h-4 transition-all ${isBookmarked ? 'fill-amber-500 text-amber-500 scale-105' : ''}`} />
            </button>

            <button
              onClick={() => setCollectionModalOpen(true)}
              className="p-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Tambah ke Koleksi"
            >
              <FolderPlus className="w-4 h-4" />
            </button>

            <button
              onClick={() => setReportOpen(true)}
              className="p-1.5 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
              title="Laporkan Kutipan"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Add To Collection Modal Component */}
      <AddToCollectionModal
        quoteId={quote.id}
        isOpen={collectionModalOpen}
        onClose={() => setCollectionModalOpen(false)}
      />

      {/* Report Dialog Component */}
      <ReportDialog
        quoteId={quote.id}
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
      />

      {/* Export Card Image Generator Modal */}
      <QuoteImageModal
        quote={quote}
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
      />

      {/* Reader View Modal Component */}
      <ReaderViewModal
        quote={quote}
        isOpen={readerModalOpen}
        onClose={() => setReaderModalOpen(false)}
      />
    </>
  );
}
