'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Heart,
  ThumbsDown,
  MessageCircle,
  Bookmark,
  Share2,
  Music,
  ExternalLink,
  Edit,
  AlertTriangle
} from 'lucide-react';
import { QuoteItem } from '@/types';
import { toggleVote, toggleBookmark } from '@/services/quotes';
import ReportDialog from './ReportDialog';
import { toast } from 'sonner';

interface QuoteCardProps {
  quote: QuoteItem;
  currentUserId?: string;
}

export default function QuoteCard({ quote, currentUserId }: QuoteCardProps) {
  const [likesCount, setLikesCount] = useState(quote.likes_count || 0);
  const [dislikesCount, setDislikesCount] = useState(quote.dislikes_count || 0);
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(quote.user_vote || null);
  const [isBookmarked, setIsBookmarked] = useState(quote.is_bookmarked || false);
  const [reportOpen, setReportOpen] = useState(false);

  const handleVote = async (type: 'like' | 'dislike') => {
    try {
      if (userVote === type) {
        setUserVote(null);
        if (type === 'like') setLikesCount((prev) => Math.max(0, prev - 1));
        else setDislikesCount((prev) => Math.max(0, prev - 1));
      } else {
        if (userVote === 'like') setLikesCount((prev) => Math.max(0, prev - 1));
        if (userVote === 'dislike') setDislikesCount((prev) => Math.max(0, prev - 1));

        setUserVote(type);
        if (type === 'like') setLikesCount((prev) => prev + 1);
        else setDislikesCount((prev) => prev + 1);
      }

      await toggleVote(quote.id, type);
    } catch (err: any) {
      toast.error(err.message || 'Gagal memberikan suara');
    }
  };

  const handleBookmark = async () => {
    try {
      const bookmarked = await toggleBookmark(quote.id);
      setIsBookmarked(bookmarked);
      toast.success(bookmarked ? 'Tersimpan di bookmark' : 'Dihapus dari bookmark');
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan bookmark');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/quotes/${quote.id}`);
      toast.success('Tautan kutipan berhasil disalin!');
    }
  };

  return (
    <>
      <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all duration-200 hover:border-indigo-300 hover:shadow-md">
        
        {/* Top Bar: Author & Category */}
        <div className="flex items-center justify-between mb-4">
          {quote.user ? (
            <Link href={`/profile/${quote.user.username}`} className="flex items-center gap-3 group/author">
              <img
                src={quote.user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${quote.user.username}`}
                alt={quote.user.name}
                className="w-10 h-10 rounded-full bg-slate-100 object-cover ring-2 ring-indigo-500/20 group-hover/author:ring-indigo-500 transition-all"
              />
              <div>
                <h4 className="text-base font-semibold text-slate-900 group-hover/author:text-indigo-600 transition-colors">
                  {quote.user.name}
                </h4>
                <p className="text-xs text-slate-500 font-mono">@{quote.user.username}</p>
              </div>
            </Link>
          ) : (
            <span className="text-sm font-medium text-slate-500">Anonim</span>
          )}

          <div className="flex items-center gap-2">
            {quote.category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full">
                {quote.category.name}
              </span>
            )}

            {currentUserId === quote.user_id && (
              <Link
                href={`/quotes/${quote.id}/edit`}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Edit Kutipan"
              >
                <Edit className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Quote Content */}
        <blockquote className="relative my-4">
          <p className="text-lg sm:text-xl font-medium text-slate-800 leading-relaxed italic">
            "{quote.content}"
          </p>
        </blockquote>

        {/* Song Card: with Spotify Embed if available */}
        {(quote.song_title || quote.song_artist) && (
          <div className="my-4 space-y-2">
            {/* Show song info row only if no Spotify embed available */}
            {!quote.spotify_url && (
              <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <Music className="w-4 h-4 text-emerald-600 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {quote.song_title || 'Lagu Mutiara'}
                  </p>
                  <p className="text-xs text-slate-600 truncate">
                    {quote.song_artist || 'Artis'}
                  </p>
                  {quote.song_lyric_snippet && (
                    <p className="text-xs text-slate-500 italic line-clamp-1 mt-0.5">
                      "{quote.song_lyric_snippet}"
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Spotify Embed Player (replaces info row when available) */}
            {quote.spotify_url && (() => {
              const match = quote.spotify_url.match(/spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/);
              if (!match) return null;
              const embedUrl = `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
              return (
                <div className="rounded-xl overflow-hidden border border-slate-200">
                  <iframe
                    src={embedUrl}
                    width="100%"
                    height="80"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    scrolling="no"
                    style={{ display: 'block', overflow: 'hidden' }}
                    title={`Spotify: ${quote.song_title}`}
                  />
                </div>
              );
            })()}
          </div>
        )}



        {/* Action Footer Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-sm text-slate-600">
          
          {/* Votes */}
          <div className="flex items-center gap-1 bg-slate-100/80 border border-slate-200/80 rounded-full p-1">
            <button
              onClick={() => handleVote('like')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
                userVote === 'like'
                  ? 'bg-rose-500 text-white font-semibold shadow-sm'
                  : 'hover:text-rose-600 hover:bg-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${userVote === 'like' ? 'fill-white' : ''}`} />
              <span>{likesCount}</span>
            </button>

            <button
              onClick={() => handleVote('dislike')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all ${
                userVote === 'dislike'
                  ? 'bg-slate-700 text-white font-semibold'
                  : 'hover:text-slate-900 hover:bg-white'
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
              <span>{dislikesCount}</span>
            </button>
          </div>

          {/* Comments, Bookmark, Share, Report */}
          <div className="flex items-center gap-2">
            <Link
              href={`/quotes/${quote.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/80 hover:bg-white hover:text-indigo-600 transition-all font-medium"
            >
              <MessageCircle className="w-4 h-4 text-indigo-600" />
              <span>{quote.comments_count || 0}</span>
            </Link>

            <button
              onClick={handleBookmark}
              className={`p-2 rounded-full border transition-all ${
                isBookmarked
                  ? 'bg-amber-100 border-amber-200 text-amber-700'
                  : 'bg-slate-100/80 border-slate-200/80 hover:bg-white text-slate-600 hover:text-amber-600'
              }`}
              title="Simpan Bookmark"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-600' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-slate-100/80 border border-slate-200/80 hover:bg-white text-slate-600 hover:text-indigo-600 transition-all"
              title="Bagikan"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setReportOpen(true)}
              className="p-2 rounded-full bg-slate-100/80 border border-slate-200/80 hover:bg-white text-slate-400 hover:text-rose-600 transition-all"
              title="Laporkan Konten"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      <ReportDialog
        quoteId={quote.id}
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
      />
    </>
  );
}
