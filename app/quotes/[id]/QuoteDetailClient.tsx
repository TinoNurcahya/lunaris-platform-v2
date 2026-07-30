'use client';

import { use, useEffect, useState } from 'react';
import { fetchQuoteById, fetchQuoteComments, deleteComment } from '@/services/quotes';
import { createNotification } from '@/services/notifications';
import QuoteCard from '@/components/quote/QuoteCard';
import { QuoteItem, CommentItem } from '@/types';
import { createClient } from '@/utils/supabase/client';
import { MessageCircle, Send, ArrowLeft, Trash2, Reply, X, CornerDownRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface QuoteDetailClientProps {
  params: Promise<{ id: string }>;
}

export default function QuoteDetailClient({ params }: QuoteDetailClientProps) {
  const { id } = use(params);
  const quoteId = parseInt(id, 10);

  const [quote, setQuote] = useState<QuoteItem | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: number; name: string; username?: string } | null>(null);
  const [replyText, setReplyText] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

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

  const handlePostComment = async (e: React.FormEvent, parentId?: number) => {
    e.preventDefault();
    const textToSend = parentId ? replyText : newComment;
    if (!textToSend.trim()) return;

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
          content: textToSend.trim(),
          parent_id: parentId || null
        })
        .select(`*, user:profiles(*)`)
        .single();

      if (error) throw error;

      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('quote_id', quoteId);

      await supabase
        .from('quotes')
        .update({ comments_count: count || 0 })
        .eq('id', quoteId);

      if (parentId) {
        const parentComment = comments.find((c) => c.id === parentId);
        if (parentComment && parentComment.user_id !== user.id) {
          await createNotification({
            userId: parentComment.user_id,
            senderId: user.id,
            type: 'comment',
            message: 'membalas komentarmu',
            quoteId
          });
        }
      } else if (quote && quote.user_id !== user.id) {
        await createNotification({
          userId: quote.user_id,
          senderId: user.id,
          type: 'comment',
          message: 'mengomentari kutipanmu',
          quoteId
        });
      }

      toast.success(parentId ? 'Balasan berhasil dikirim!' : 'Komentar berhasil dipublikasikan!');
      setComments((prev) => [...prev, data as CommentItem]);

      if (parentId) {
        setReplyText('');
        setReplyingTo(null);
      } else {
        setNewComment('');
      }

      if (quote) {
        setQuote({ ...quote, comments_count: (count || 0) });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal mengirim komentar';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment(commentId);
      toast.success('Komentar berhasil dihapus');
      setComments((prev) => prev.filter((c) => c.id !== commentId && c.parent_id !== commentId));
      if (quote) {
        setQuote({ ...quote, comments_count: Math.max(0, (quote.comments_count || 1) - 1) });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menghapus komentar';
      toast.error(message);
    }
  };

  if (loading) {
    return <div className="h-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />;
  }

  if (!quote) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Kutipan Tidak Ditemukan</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">Kutipan yang Anda cari mungkin telah dihapus atau tidak tersedia.</p>
        <Link href="/" className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const parentComments = comments.filter((c) => !c.parent_id);
  const getReplies = (parentId: number) => comments.filter((c) => c.parent_id === parentId);

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Beranda</span>
      </Link>

      {/* Main Quote Card */}
      <QuoteCard quote={quote} currentUserId={currentUserId} />

      {/* Comments Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Komentar ({comments.length})</span>
        </h3>

        {/* Main Comment Form */}
        <form onSubmit={(e) => handlePostComment(e)} className="space-y-3">
          <textarea
            rows={3}
            placeholder="Tulis tanggapan atau pengalamanmu mengenai kutipan ini..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 transition-all resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-full shadow-sm transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Mengirim...' : 'Kirim Komentar'}</span>
            </button>
          </div>
        </form>

        {/* Comments Tree */}
        <div className="space-y-4 pt-2">
          {comments.length === 0 ? (
            <p className="text-center py-6 text-xs text-slate-500 dark:text-slate-400">Belum ada komentar. Jadilah yang pertama memberikan tanggapan!</p>
          ) : (
            parentComments.map((comment) => {
              const isOwner = currentUserId === comment.user_id;
              const replies = getReplies(comment.id);

              return (
                <div key={comment.id} className="space-y-3">
                  {/* Parent Comment Item */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3">
                    <img
                      src={comment.user?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.user_id}`}
                      alt={comment.user?.name || 'User'}
                      className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {comment.user?.name || 'Pengguna'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            {new Date(comment.created_at).toLocaleDateString('id-ID')}
                          </span>

                          <button
                            onClick={() => {
                              if (replyingTo?.id === comment.id) {
                                setReplyingTo(null);
                              } else {
                                setReplyingTo({
                                  id: comment.id,
                                  name: comment.user?.name || 'Pengguna',
                                  username: comment.user?.username
                                });
                                setReplyText('');
                              }
                            }}
                            className="p-1 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
                            title="Balas Komentar"
                          >
                            <Reply className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Balas</span>
                          </button>

                          {isOwner && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Komentar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>

                  {/* Inline Reply Form for Parent */}
                  {replyingTo?.id === comment.id && (
                    <form
                      onSubmit={(e) => handlePostComment(e, comment.id)}
                      className="ml-6 sm:ml-10 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/80 space-y-2 animate-in fade-in duration-150"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                        <span>Membalas @{replyingTo.username || replyingTo.name}</span>
                        <button
                          type="button"
                          onClick={() => setReplyingTo(null)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <textarea
                        rows={2}
                        placeholder={`Tulis balasanmu untuk @${replyingTo.username || replyingTo.name}...`}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-600 resize-none"
                        autoFocus
                      />

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setReplyingTo(null)}
                          className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-full cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={submitting || !replyText.trim()}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-full shadow-xs cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>{submitting ? 'Mengirim...' : 'Kirim Balasan'}</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Replies Thread */}
                  {replies.length > 0 && (
                    <div className="ml-6 sm:ml-10 space-y-2 border-l-2 border-indigo-100 dark:border-indigo-900 pl-3">
                      {replies.map((reply) => {
                        const isReplyOwner = currentUserId === reply.user_id;
                        const parentUserName = comment.user?.username || comment.user?.name || 'Pengguna';

                        return (
                          <div key={reply.id} className="space-y-2">
                            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2.5">
                              <img
                                src={reply.user?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${reply.user_id}`}
                                alt={reply.user?.name || 'User'}
                                className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 object-cover shrink-0"
                              />
                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex items-center justify-between flex-wrap gap-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                                      {reply.user?.name || 'Pengguna'}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                      <CornerDownRight className="w-3 h-3 text-indigo-500" />
                                      <span>membalas</span>
                                      <span className="font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900 px-1.5 py-0.5 rounded-md">
                                        @{parentUserName}
                                      </span>
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                      {new Date(reply.created_at).toLocaleDateString('id-ID')}
                                    </span>

                                    <button
                                      onClick={() => {
                                        if (replyingTo?.id === reply.id) {
                                          setReplyingTo(null);
                                        } else {
                                          setReplyingTo({
                                            id: reply.id,
                                            name: reply.user?.name || 'Pengguna',
                                            username: reply.user?.username
                                          });
                                          setReplyText('');
                                        }
                                      }}
                                      className="p-1 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
                                      title="Balas Komentar Ini"
                                    >
                                      <Reply className="w-3.5 h-3.5" />
                                      <span className="hidden sm:inline">Balas</span>
                                    </button>

                                    {isReplyOwner && (
                                      <button
                                        onClick={() => handleDeleteComment(reply.id)}
                                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                                        title="Hapus Balasan"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                  {reply.content}
                                </p>
                              </div>
                            </div>

                            {/* Inline Reply Form for Child Reply */}
                            {replyingTo?.id === reply.id && (
                              <form
                                onSubmit={(e) => handlePostComment(e, comment.id)}
                                className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/80 space-y-2 animate-in fade-in duration-150"
                              >
                                <div className="flex items-center justify-between text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                                  <span>Membalas @{replyingTo.username || replyingTo.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => setReplyingTo(null)}
                                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <textarea
                                  rows={2}
                                  placeholder={`Tulis balasanmu untuk @${replyingTo.username || replyingTo.name}...`}
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-600 resize-none"
                                  autoFocus
                                />

                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setReplyingTo(null)}
                                    className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-full cursor-pointer"
                                  >
                                    Batal
                                  </button>
                                  <button
                                    type="submit"
                                    disabled={submitting || !replyText.trim()}
                                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-full shadow-xs cursor-pointer"
                                  >
                                    <Send className="w-3 h-3" />
                                    <span>{submitting ? 'Mengirim...' : 'Kirim Balasan'}</span>
                                  </button>
                                </div>
                              </form>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
