import { createClient } from '@/utils/supabase/client';
import { QuoteItem, CommentItem } from '@/types';

export async function fetchQuotes(options?: {
  categoryId?: number;
  userId?: string;
  sortBy?: 'latest' | 'popular' | 'of_the_day' | 'has_song';
  mood?: string;
  limit?: number;
}): Promise<QuoteItem[]> {
  const supabase = createClient();

  let query = supabase
    .from('quotes')
    .select(`
      *,
      user:profiles!user_id(*),
      category:categories(*)
    `)
    .eq('status', 'approved');

  if (options?.categoryId) {
    query = query.eq('category_id', options.categoryId);
  }

  if (options?.userId) {
    query = query.eq('user_id', options.userId);
  }

  if (options?.mood && options.mood !== 'all') {
    query = query.eq('mood', options.mood);
  }

  if (options?.sortBy === 'popular') {
    query = query.order('likes_count', { ascending: false });
  } else if (options?.sortBy === 'of_the_day') {
    query = query.eq('is_quote_of_day', true);
  } else if (options?.sortBy === 'has_song') {
    query = query.not('song_title', 'is', null);
  } else {
    query = query.order('created_at', { ascending: false });
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching quotes:', error);
    return [];
  }

  let quotes = (data as QuoteItem[]) || [];

  // Check current user votes & bookmarks
  const { data: { user } } = await supabase.auth.getUser();
  if (user && quotes.length > 0) {
    const quoteIds = quotes.map((q) => q.id);

    const [votesRes, bookmarksRes] = await Promise.all([
      supabase.from('votes').select('quote_id, vote_type').eq('user_id', user.id).in('quote_id', quoteIds),
      supabase.from('bookmarks').select('quote_id').eq('user_id', user.id).in('quote_id', quoteIds)
    ]);

    const votesMap = new Map(votesRes.data?.map((v) => [v.quote_id, v.vote_type]));
    const bookmarksSet = new Set(bookmarksRes.data?.map((b) => b.quote_id));

    quotes = quotes.map((q) => ({
      ...q,
      user_vote: (votesMap.get(q.id) as 'like' | 'dislike') || null,
      is_bookmarked: bookmarksSet.has(q.id)
    }));
  }

  return quotes;
}

export async function fetchQuoteById(id: number): Promise<QuoteItem | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('quotes')
    .select(`
      *,
      user:profiles!user_id(*),
      category:categories(*)
    `)
    .eq('id', id)
    .single();

  if (error || !data) return null;

  const quote = data as QuoteItem;

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const [voteRes, bookmarkRes] = await Promise.all([
      supabase.from('votes').select('vote_type').eq('user_id', user.id).eq('quote_id', id).maybeSingle(),
      supabase.from('bookmarks').select('quote_id').eq('user_id', user.id).eq('quote_id', id).maybeSingle()
    ]);

    quote.user_vote = (voteRes.data?.vote_type as 'like' | 'dislike') || null;
    quote.is_bookmarked = !!bookmarkRes.data;
  }

  return quote;
}

export async function fetchQuoteComments(quoteId: number): Promise<CommentItem[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      user:profiles(*)
    `)
    .eq('quote_id', quoteId)
    .order('created_at', { ascending: true });

  if (error) return [];
  return (data as CommentItem[]) || [];
}

export async function deleteComment(commentId: number, _quoteId?: number): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Silakan login terlebih dahulu');

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function toggleVote(quoteId: number, voteType: 'like' | 'dislike'): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Silakan login terlebih dahulu');

  const { data: existingVote } = await supabase
    .from('votes')
    .select('*')
    .eq('user_id', user.id)
    .eq('quote_id', quoteId)
    .maybeSingle();

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      await supabase.from('votes').delete().eq('id', existingVote.id);
    } else {
      await supabase.from('votes').update({ vote_type: voteType }).eq('id', existingVote.id);
    }
  } else {
    await supabase.from('votes').insert({
      user_id: user.id,
      quote_id: quoteId,
      vote_type: voteType
    });
  }
}

export async function toggleBookmark(quoteId: number): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Silakan login terlebih dahulu');

  const { data: existing } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', user.id)
    .eq('quote_id', quoteId)
    .maybeSingle();

  if (existing) {
    await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('quote_id', quoteId);
    return false;
  } else {
    await supabase.from('bookmarks').insert({
      user_id: user.id,
      quote_id: quoteId
    });
    return true;
  }
}

export async function togglePinQuote(quoteId: number, currentPinnedState: boolean): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Silakan login terlebih dahulu');

  const newPinnedState = !currentPinnedState;

  if (newPinnedState) {
    // Unpin other quotes for this user first
    await supabase.from('quotes').update({ is_pinned: false }).eq('user_id', user.id);
  }

  const { error } = await supabase
    .from('quotes')
    .update({ is_pinned: newPinnedState })
    .eq('id', quoteId)
    .eq('user_id', user.id);

  if (error) throw error;
  return newPinnedState;
}
