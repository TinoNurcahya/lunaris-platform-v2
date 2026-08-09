import { createClient } from '@/utils/supabase/client';
import { UserProfile } from '@/types';
import { createNotification } from './notifications';

export async function fetchLeaderboard(options?: { limit?: number; page?: number }): Promise<UserProfile[]> {
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('xp', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }

  return (data as UserProfile[]) || [];
}

export async function fetchProfileByUsername(username: string): Promise<UserProfile | null> {
  const supabase = createClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !profile) return null;

  const { data: { user: currentUser } } = await supabase.auth.getUser();

  // Counts
  const { count: quotesCount } = await supabase
    .from('quotes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id)
    .eq('status', 'approved');

  const { count: followersCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', profile.id);

  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', profile.id);

  let isFollowing = false;
  if (currentUser) {
    const { data: followRecord } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', currentUser.id)
      .eq('following_id', profile.id)
      .maybeSingle();

    isFollowing = !!followRecord;
  }

  return {
    ...profile,
    quotes_count: quotesCount || 0,
    followers_count: followersCount || 0,
    following_count: followingCount || 0,
    is_following: isFollowing
  } as UserProfile;
}

export async function fetchFollowers(userId: string): Promise<UserProfile[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('follows')
    .select('follower:profiles!follower_id(*)')
    .eq('following_id', userId);

  if (error || !data) return [];
  return (data as unknown as Array<{ follower: UserProfile }>).map((d) => d.follower).filter(Boolean);
}

export async function fetchFollowing(userId: string): Promise<UserProfile[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('follows')
    .select('following:profiles!following_id(*)')
    .eq('follower_id', userId);

  if (error || !data) return [];
  return (data as unknown as Array<{ following: UserProfile }>).map((d) => d.following).filter(Boolean);
}

export async function toggleFollow(targetUserId: string): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Silakan login terlebih dahulu');
  if (user.id === targetUserId) throw new Error('Anda tidak dapat mengikuti diri sendiri');

  const { data: existing } = await supabase
    .from('follows')
    .select('*')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .maybeSingle();

  if (existing) {
    await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetUserId);
    return false;
  } else {
    await supabase.from('follows').insert({ follower_id: user.id, following_id: targetUserId });

    // Send auto notification
    await createNotification({
      userId: targetUserId,
      senderId: user.id,
      type: 'follow',
      message: 'mulai mengikutimu'
    });

    return true;
  }
}

export async function updateUserProfile(
  userId: string,
  payload: { name: string; bio?: string; avatar_url?: string }
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      name: payload.name.trim(),
      bio: payload.bio?.trim() || null,
      avatar_url: payload.avatar_url?.trim() || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) throw error;
}
