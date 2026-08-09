import { createClient } from '@/utils/supabase/client';

import { NotificationItem } from '@/types';

export function formatBadgeCount(count: number): string | null {
  if (count <= 0) return null;
  if (count > 99) return '99+';
  return count.toString();
}

export async function createNotification(params: {
  userId: string;
  senderId: string;
  type: 'like' | 'comment' | 'follow' | 'broadcast';
  message: string;
  quoteId?: number;
}): Promise<void> {
  // Do not send notification to oneself UNLESS it is a broadcast announcement
  if (params.userId === params.senderId && params.type !== 'broadcast') return;

  try {
    const supabase = createClient();
    const { error } = await supabase.from('notifications').insert({
      user_id: params.userId,
      sender_id: params.senderId,
      type: params.type,
      message: params.message,
      quote_id: params.quoteId || null,
      is_read: false
    });

    if (error) {
      console.error('Error inserting notification:', error.message || error);
    }
  } catch (err) {
    console.error('Error creating notification:', err);
  }
}

export async function getUnreadNotificationsCount(): Promise<number> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  return count || 0;
}

export async function markNotificationsAsRead(): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);
}

export async function toggleNotificationRead(notificationId: number, currentReadState: boolean): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Silakan login terlebih dahulu');

  const newReadState = !currentReadState;
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: newReadState })
    .eq('id', notificationId)
    .eq('user_id', user.id);

  if (error) throw error;
  return newReadState;
}

export async function deleteNotification(notificationId: number): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Silakan login terlebih dahulu');

  const { data, error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', user.id)
    .select();

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('Gagal menghapus di database. Pastikan RLS policy DELETE sudah diaktifkan di Supabase.');
  }
}

export async function deleteAllNotifications(): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Silakan login terlebih dahulu');

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function fetchUserNotifications(options?: { page?: number; limit?: number; filter?: 'all' | 'unread' | 'interaction' | 'broadcast' }): Promise<NotificationItem[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('notifications')
    .select(`
      *,
      sender:profiles!sender_id(*),
      quote:quotes(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (options?.filter === 'unread') {
    query = query.eq('is_read', false);
  } else if (options?.filter === 'interaction') {
    query = query.in('type', ['like', 'comment', 'follow']);
  } else if (options?.filter === 'broadcast') {
    query = query.eq('type', 'broadcast');
  }

  const { data, error } = await query;
  if (error) return [];
  return (data as NotificationItem[]) || [];
}

export async function getAdminActionCounts(): Promise<{ pendingQuotes: number; pendingReports: number }> {
  const supabase = createClient();
  const [{ count: pendingQuotes }, { count: pendingReports }] = await Promise.all([
    supabase.from('quotes').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending')
  ]);

  return {
    pendingQuotes: pendingQuotes || 0,
    pendingReports: pendingReports || 0
  };
}

export async function getAdminSidebarCounts(): Promise<{
  pendingQuotes: number;
  pendingReports: number;
  totalCategories: number;
  totalUsers: number;
}> {
  const supabase = createClient();
  const [
    { count: pendingQuotes },
    { count: pendingReports },
    { count: totalCategories },
    { count: totalUsers }
  ] = await Promise.all([
    supabase.from('quotes').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true })
  ]);

  return {
    pendingQuotes: pendingQuotes || 0,
    pendingReports: pendingReports || 0,
    totalCategories: totalCategories || 0,
    totalUsers: totalUsers || 0
  };
}

export async function getMainSidebarCounts(): Promise<{
  bookmarkCount: number;
  categoryCount: number;
}> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ count: catCount }, { count: bCount }] = await Promise.all([
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    user
      ? supabase.from('bookmarks').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      : Promise.resolve({ count: 0 })
  ]);

  return {
    bookmarkCount: bCount || 0,
    categoryCount: catCount || 0
  };
}
