'use client';

import { use, useEffect, useState } from 'react';
import { fetchQuoteById, fetchQuoteComments } from '@/services/quotes';
import QuoteCard from '@/components/quote/QuoteCard';
import { QuoteItem, CommentItem } from '@/types';
import { createClient } from '@/utils/supabase/client';
import { MessageCircle, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const quoteId = parseInt(id, 10);

  const [quote, setQuote] = useState<QuoteItem | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [qData, cData] = await Promise.all([
        fetchQuoteById(quoteId),
        fetchQuoteComments(quoteId)
      ]);
      setQuote(qData);
      setComments(cData);
      setLoading(false);
    }
    loadData();
  }, [quoteId]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Silakan login terlebih dahulu untuk berkomentar');
        setSubmitting(false);
        return;
      }

      const { data, error } = await supabase
        .from('comments')
        .insert({
          quote_id: quoteId,
          user_id: user.id,
          content: newComment.trim()
        })
        .select(`*, user:profiles(*)`)
        .single();

      if (error) throw error;

      // Update comments_count on the quote row
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('quote_id', quoteId);

      await supabase
        .from('quotes')
        .update({ comments_count: count || 0 })
        .eq('id', quoteId);

      toast.success('Komentar berhasil dipublikasikan!');
      setComments((prev) => [...prev, data as CommentItem]);
      setNewComment('');
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengirim komentar');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="h-64 rounded-2xl bg-white border border-slate-200 animate-pulse" />;
  }

  if (!quote) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800">Kutipan Tidak Ditemukan</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">Kutipan yang Anda cari mungkin telah dihapus atau tidak tersedia.</p>
        <Link href="/" className="text-xs text-indigo-600 font-semibold hover:underline">
          ← Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Beranda</span>
      </Link>

      {/* Main Quote Card */}
      <QuoteCard quote={quote} />

      {/* Comments Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-indigo-600" />
          <span>Komentar ({comments.length})</span>
        </h3>

        {/* Comment Form */}
        <form onSubmit={handlePostComment} className="space-y-3">
          <textarea
            rows={3}
            placeholder="Tulis tanggapan atau pengalamanmu mengenai kutipan ini..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-full shadow-sm transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Mengirim...' : 'Kirim Komentar'}</span>
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-3 pt-2">
          {comments.length === 0 ? (
            <p className="text-center py-6 text-xs text-slate-500">Belum ada komentar. Jadilah yang pertama memberikan tanggapan!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <img
                  src={comment.user?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.user_id}`}
                  alt={comment.user?.name || 'User'}
                  className="w-8 h-8 rounded-full bg-slate-200 object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      {comment.user?.name || 'Pengguna'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(comment.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}
