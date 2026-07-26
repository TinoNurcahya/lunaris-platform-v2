import { createClient } from '@/utils/supabase/client';
import { QuoteCollection, QuoteItem } from '@/types';

interface CollectionItemCountRow {
  collection_items?: Array<{ count: number }>;
  user?: QuoteCollection['user'];
  [key: string]: unknown;
}

export async function fetchUserCollections(userId: string): Promise<QuoteCollection[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('collections')
    .select('*, collection_items(count)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user collections:', error);
    return [];
  }

  return (data || []).map((col: CollectionItemCountRow) => ({
    ...(col as unknown as QuoteCollection),
    items_count: col.collection_items?.[0]?.count || 0
  })) as QuoteCollection[];
}

export async function fetchPublicCollections(): Promise<QuoteCollection[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('collections')
    .select('*, user:profiles!user_id(*), collection_items(count)')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) {
    console.error('Error fetching public collections:', error);
    return [];
  }

  return (data || []).map((col: CollectionItemCountRow) => ({
    ...(col as unknown as QuoteCollection),
    user: col.user,
    items_count: col.collection_items?.[0]?.count || 0
  })) as QuoteCollection[];
}

export async function fetchCollectionById(collectionId: number): Promise<QuoteCollection | null> {
  const supabase = createClient();
  const { data: collection, error } = await supabase
    .from('collections')
    .select('*, user:profiles!user_id(*)')
    .eq('id', collectionId)
    .single();

  if (error || !collection) {
    console.error('Error fetching collection header:', error);
    return null;
  }

  // 1. Fetch collection items to get quote_ids
  const { data: items, error: itemsErr } = await supabase
    .from('collection_items')
    .select('quote_id')
    .eq('collection_id', collectionId)
    .order('created_at', { ascending: false });

  if (itemsErr) {
    console.error('Error fetching collection items:', itemsErr);
  }

  if (!items || items.length === 0) {
    return {
      ...(collection as unknown as QuoteCollection),
      user: collection.user,
      items_count: 0,
      quotes: []
    };
  }

  const quoteIds = items.map((i) => i.quote_id);

  // 2. Fetch full quote items with user and category
  const { data: quotesData, error: quotesErr } = await supabase
    .from('quotes')
    .select('*, user:profiles!user_id(*), category:categories(*)')
    .in('id', quoteIds);

  if (quotesErr) {
    console.error('Error fetching collection quotes:', quotesErr);
  }

  let quotes = (quotesData || []) as QuoteItem[];

  const { data: { user } } = await supabase.auth.getUser();
  if (user && quotes.length > 0) {
    const qIds = quotes.map((q) => q.id);

    const [votesRes, bookmarksRes] = await Promise.all([
      supabase.from('votes').select('quote_id, vote_type').eq('user_id', user.id).in('quote_id', qIds),
      supabase.from('bookmarks').select('quote_id').eq('user_id', user.id).in('quote_id', qIds)
    ]);

    const votesMap = new Map(votesRes.data?.map((v) => [v.quote_id, v.vote_type]));
    const bookmarksSet = new Set(bookmarksRes.data?.map((b) => b.quote_id));

    quotes = quotes.map((q) => ({
      ...q,
      user_vote: (votesMap.get(q.id) as 'like' | 'dislike') || null,
      is_bookmarked: bookmarksSet.has(q.id)
    }));
  }

  return {
    ...(collection as unknown as QuoteCollection),
    user: collection.user,
    items_count: quotes.length,
    quotes
  } as QuoteCollection;
}

export async function createCollection(payload: {
  name: string;
  description?: string;
  is_public?: boolean;
  cover_gradient?: string;
}): Promise<QuoteCollection> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Silakan login terlebih dahulu');

  const { data, error } = await supabase
    .from('collections')
    .insert({
      user_id: user.id,
      name: payload.name.trim(),
      description: payload.description?.trim() || null,
      is_public: payload.is_public ?? true,
      cover_gradient: payload.cover_gradient || 'from-indigo-600 to-blue-700'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating collection:', error.message || error.details || error);
    throw new Error(error.message || 'Gagal membuat koleksi. Pastikan skema database collections sudah dijalankan di Supabase SQL Editor.');
  }

  return data as QuoteCollection;
}

export async function addQuoteToCollection(collectionId: number, quoteId: number): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('collection_items')
    .insert({
      collection_id: collectionId,
      quote_id: quoteId
    });

  if (error && error.code !== '23505') { // Ignore unique constraint duplicate
    console.error('Error adding quote to collection:', error.message || error.details || error);
    throw new Error(error.message || 'Gagal menambahkan kutipan ke koleksi');
  }
}

export async function removeQuoteFromCollection(collectionId: number, quoteId: number): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('collection_items')
    .delete()
    .eq('collection_id', collectionId)
    .eq('quote_id', quoteId);

  if (error) {
    console.error('Error removing quote from collection:', error.message || error.details || error);
    throw new Error(error.message || 'Gagal menghapus kutipan dari koleksi');
  }
}

export async function deleteCollection(collectionId: number): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', collectionId);

  if (error) {
    console.error('Error deleting collection:', error);
    throw error;
  }
}

export async function fetchCollectionIdsForQuote(quoteId: number): Promise<number[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('collection_items')
    .select('collection_id, collections!inner(user_id)')
    .eq('quote_id', quoteId)
    .eq('collections.user_id', user.id);

  if (error || !data) return [];
  return data.map((d: { collection_id: number }) => d.collection_id);
}
