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
