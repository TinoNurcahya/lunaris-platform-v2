import { createClient } from '@/utils/supabase/server';
import { UserProfile } from '@/types';

export async function fetchProfileByUsernameServer(username: string): Promise<UserProfile | null> {
  const supabase = createClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle();

  if (error || !profile) return null;

  const { count: quotesCount } = await supabase
    .from('quotes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id)
    .eq('status', 'approved');

  const { count: followersCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', profile.id);

  return {
    ...profile,
    quotes_count: quotesCount || 0,
    followers_count: followersCount || 0,
    following_count: 0,
    is_following: false,
  } as UserProfile;
}

export async function fetchAllProfilesForSitemap(): Promise<{ username: string; updated_at: string }[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('username, updated_at')
    .order('updated_at', { ascending: false });

  if (error || !data) return [];
  return data as { username: string; updated_at: string }[];
}
