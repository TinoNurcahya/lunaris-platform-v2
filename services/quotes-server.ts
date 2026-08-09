import { createClient } from '@/utils/supabase/server';
import { QuoteItem } from '@/types';

export async function fetchQuoteByIdServer(id: number): Promise<QuoteItem | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('quotes')
    .select(`
      *,
      user:profiles!user_id(*),
      category:categories(*)
    `)
    .eq('id', id)
    .eq('status', 'approved')
    .maybeSingle();

  if (error || !data) return null;
  return data as QuoteItem;
}

export async function fetchAllQuotesForSitemap(): Promise<{ id: number; updated_at: string }[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('quotes')
    .select('id, updated_at')
    .eq('status', 'approved')
    .order('updated_at', { ascending: false });

  if (error || !data) return [];
  return data as { id: number; updated_at: string }[];
}

export async function fetchQuotesServer(options?: {
  categoryId?: number;
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
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (options?.categoryId) {
    query = query.eq('category_id', options.categoryId);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  } else {
    query = query.limit(20);
  }

  const { data, error } = await query;
  if (error) return [];

  // We skip votes/bookmarks for initial server render for speed, or we can fetch them
  return data as QuoteItem[];
}

export async function fetchCategoriesServer(): Promise<any[]> {
  const supabase = createClient();
  const { data } = await supabase.from('categories').select('*').order('name', { ascending: true });
  return data || [];
}
