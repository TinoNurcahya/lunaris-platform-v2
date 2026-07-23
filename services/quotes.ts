import { createClient } from '@/utils/supabase/client';
import { QuoteItem, CommentItem } from '@/types';

export async function fetchQuotes(options?: {
  categoryId?: number;
  tag?: string;
  search?: string;
  sortBy?: 'latest' | 'popular' | 'of_the_day';
  userId?: string;
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

  if (options?.search) {
    query = query.or(`content.ilike.%${options.search}%,song_title.ilike.%${options.search}%,song_artist.ilike.%${options.search}%`);
  }

  if (options?.sortBy === 'popular') {
    query = query.order('likes_count', { ascending: false });
  } else if (options?.sortBy === 'of_the_day') {
    query = query.eq('is_quote_of_day', true);
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching quotes:', error.message || error, error.details, error.hint);
    return [];
  }

  return (data as QuoteItem[]) || [];
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

  return data as QuoteItem;
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

export async function toggleVote(quoteId: number, voteType: 'like' | 'dislike') {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Silakan login terlebih dahulu');

  // Check existing vote
  const { data: existingVote } = await supabase
    .from('votes')
    .select('*')
    .eq('user_id', user.id)
    .eq('quote_id', quoteId)
    .maybeSingle();

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      // Remove vote
      await supabase.from('votes').delete().eq('id', existingVote.id);
    } else {
      // Update vote type
      await supabase.from('votes').update({ vote_type: voteType }).eq('id', existingVote.id);
    }
  } else {
    // Insert new vote
    await supabase.from('votes').insert({
      user_id: user.id,
      quote_id: quoteId,
      vote_type: voteType
    });
  }

  // Recalculate counts
  const { count: likes } = await supabase
    .from('votes')
    .select('*', { count: 'exact', head: true })
    .eq('quote_id', quoteId)
    .eq('vote_type', 'like');

  const { count: dislikes } = await supabase
    .from('votes')
    .select('*', { count: 'exact', head: true })
    .eq('quote_id', quoteId)
    .eq('vote_type', 'dislike');

  await supabase
    .from('quotes')
    .update({ likes_count: likes || 0, dislikes_count: dislikes || 0 })
    .eq('id', quoteId);
}

export async function toggleBookmark(quoteId: number) {
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
    await supabase.from('bookmarks').insert({ user_id: user.id, quote_id: quoteId });
    return true;
  }
}
