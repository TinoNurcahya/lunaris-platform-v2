'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { NotificationItem } from '@/types';
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Megaphone,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';
import Link from 'next/link';
import {
  markNotificationsAsRead,
  toggleNotificationRead,
  deleteNotification,
  deleteAllNotifications
} from '@/services/notifications';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'interaction' | 'broadcast'>('all');
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('notifications')
      .select(`
        *,
        sender:profiles!sender_id(*),
        quote:quotes(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setNotifications(data as NotificationItem[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success('Semua notifikasi ditandai telah dibaca');
    } catch (err: any) {
      toast.error('Gagal menandai notifikasi');
    }
  };

  const handleToggleRead = async (id: number, currentReadState: boolean) => {
    try {
      const newReadState = await toggleNotificationRead(id, currentReadState);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: newReadState } : n))
      );
      toast.success(newReadState ? 'Notifikasi ditandai dibaca' : 'Notifikasi ditandai belum dibaca');
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengubah status notifikasi');
    }
  };

  const handleDeleteSingle = async (id: number) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Notifikasi berhasil dihapus');
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus notifikasi');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus semua notifikasi?')) return;
    try {
      await deleteAllNotifications();
      setNotifications([]);
      toast.success('Semua notifikasi berhasil dihapus');
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus semua notifikasi');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-rose-600 fill-rose-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-indigo-600" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-emerald-600" />;
      case 'broadcast':
        return <Megaphone className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  // Filtered Notifications List
  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'interaction') return n.type === 'like' || n.type === 'comment' || n.type === 'follow';
    if (filter === 'broadcast') return n.type === 'broadcast';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Title & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notifikasi</h2>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 text-xs font-bold font-mono text-white bg-rose-500 rounded-full shadow-xs">
                  {unreadCount} Baru
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Aktivitas dan interaksi pengguna terhadap akun & kutipanmu.</p>
          </div>
        </div>

        {/* Global Action Buttons */}
        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 rounded-xl transition-all cursor-pointer"
                title="Tandai Semua Dibaca"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Tandai Dibaca</span>
              </button>
            )}

            <button
              onClick={handleDeleteAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-900 rounded-xl transition-all cursor-pointer"
              title="Hapus Semua Notifikasi"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Hapus Semua</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Semua ({notifications.length})</span>
        </button>

        <button
          onClick={() => setFilter('unread')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            filter === 'unread'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Belum Dibaca ({unreadCount})</span>
        </button>

        <button
          onClick={() => setFilter('interaction')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            filter === 'interaction'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-rose-500" />
          <span>Interaksi</span>
        </button>

        <button
          onClick={() => setFilter('broadcast')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            filter === 'broadcast'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5 text-amber-500" />
          <span>Pengumuman</span>
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <Bell className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Tidak Ada Notifikasi</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Belum ada aktivitas atau pemberitahuan pada kategori ini.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => {
            const senderName = notif.sender?.name || (notif.type === 'broadcast' ? 'Pengumuman Lunarys' : 'Pengguna');
            const senderUsername = notif.sender?.username;
            const targetUrl = notif.quote_id
              ? `/quotes/${notif.quote_id}`
              : senderUsername
              ? `/profile/${senderUsername}`
              : '#';

            return (
              <div
                key={notif.id}
                className={`group relative p-4 rounded-2xl border shadow-xs transition-all duration-200 flex items-start justify-between gap-3 ${
                  notif.is_read
                    ? 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    : 'bg-indigo-50/70 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800/80 text-slate-900 dark:text-white ring-1 ring-indigo-500/20'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Notification Icon Badge */}
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <Link
                        href={targetUrl}
                        className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        {senderName}
                      </Link>
                      <span className="text-slate-600 dark:text-slate-300">{notif.message}</span>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-pulse" />
                      )}
                    </div>

                    {notif.quote && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-1">
                        "{notif.quote.content}"
                      </p>
                    )}

                    <p className="text-[10px] text-slate-400 font-mono">
                      {new Date(notif.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Single Item Action Buttons */}
                <div className="flex items-center gap-1 shrink-0 pt-0.5">
                  <button
                    onClick={() => handleToggleRead(notif.id, notif.is_read)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title={notif.is_read ? 'Tandai Belum Dibaca' : 'Tandai Dibaca'}
                  >
                    {notif.is_read ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                  </button>

                  <button
                    onClick={() => handleDeleteSingle(notif.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Notifikasi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
