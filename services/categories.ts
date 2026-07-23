import { createClient } from '@/utils/supabase/client';
import { Category } from '@/types';

export async function fetchCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return (data as Category[]) || [];
}
