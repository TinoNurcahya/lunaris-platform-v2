'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { NotificationItem } from '@/types';
import { Bell, Sparkles } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
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
          sender:profiles(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setNotifications(data as NotificationItem[]);
      }
      setLoading(false);
    }
    loadNotifications();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
          <Bell className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Notifikasi</h2>
          <p className="text-xs text-slate-500">Aktivitas dan interaksi pengguna terhadap kutipanmu.</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <Sparkles className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Belum Ada Notifikasi</h3>
          <p className="text-xs text-slate-500 mt-1">Notifikasi akan muncul saat ada yang menyukai atau mengomentari kutipanmu.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border transition-all flex items-center gap-3 ${
                notif.is_read ? 'bg-white border-slate-200' : 'bg-indigo-50/60 border-indigo-100'
              }`}
            >
              <img
                src={notif.sender?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${notif.sender_id}`}
                alt={notif.sender?.name || 'User'}
                className="w-9 h-9 rounded-full bg-slate-200 object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-800 leading-relaxed">
                  <span className="font-bold text-slate-900">{notif.sender?.name || 'Pengguna'}</span>{' '}
                  {notif.message}
                </p>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(notif.created_at).toLocaleDateString('id-ID')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
