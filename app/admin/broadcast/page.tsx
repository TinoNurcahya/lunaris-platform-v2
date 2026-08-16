'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { UserProfile } from '@/types';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminBroadcastPage() {
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [targetUserId, setTargetUserId] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase.from('profiles').select('*').order('name', { ascending: true });
      if (data) setUsersList(data as UserProfile[]);
      setLoading(false);
    }
    loadUsers();
  }, []);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    try {
      const supabase = createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (targetUserId === 'all') {
        const notifs = usersList.map((u) => ({
          user_id: u.id,
          sender_id: currentUser?.id || null,
          type: 'broadcast',
          message: broadcastMessage.trim()
        }));
        await supabase.from('notifications').insert(notifs);
      } else {
        await supabase.from('notifications').insert({
          user_id: targetUserId,
          sender_id: currentUser?.id || null,
          type: 'broadcast',
          message: broadcastMessage.trim()
        });
      }

      toast.success('Notifikasi pengumuman telah dikirim!');
      setBroadcastMessage('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal mengirim notifikasi';
      toast.error(message);
    }
  };

  if (loading) {
    return <div className="h-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />;
  }

  return (
    <form onSubmit={handleSendBroadcast} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 max-w-xl">
      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Send className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        <span>Kirim Broadcast Notifikasi Sistem</span>
      </h4>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pilih Penerima</label>
        <select
          value={targetUserId}
          onChange={(e) => setTargetUserId(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600"
        >
          <option value="all">Semua Pengguna Terdaftar ({usersList.length} user)</option>
          {usersList.map((u) => (
            <option key={u.id} value={u.id}>{u.name} (@{u.username})</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pesan Pengumuman</label>
        <textarea
          rows={4}
          placeholder="Tuliskan pengumuman penting untuk pengguna..."
          value={broadcastMessage}
          onChange={(e) => setBroadcastMessage(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 resize-none"
          required
        />
      </div>

      <button type="submit" className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all cursor-pointer">
        Kirim Notifikasi Sekarang
      </button>
    </form>
  );
}
