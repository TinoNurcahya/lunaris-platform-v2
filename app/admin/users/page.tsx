'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { UserProfile } from '@/types';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (data) setUsersList(data as UserProfile[]);
      setLoading(false);
    }
    loadUsers();
  }, []);

  const handleToggleUserRole = async (userId: string, currentRole: 'user' | 'admin') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const supabase = createClient();
      await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      toast.success(`Role pengguna berhasil diubah ke ${newRole}`);
      setUsersList((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (err: any) {
      toast.error('Gagal mengubah role');
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-2xl bg-white border border-slate-200 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {usersList.map((u) => (
        <div key={u.id} className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <img src={u.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`} alt={u.name} className="w-10 h-10 rounded-full bg-slate-100 object-cover shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{u.name} (@{u.username})</p>
              <p className="text-xs text-slate-500 font-mono">Lvl {u.level} • {u.xp} XP • Role: <span className="font-semibold text-indigo-600">{u.role}</span></p>
            </div>
          </div>

          <button
            onClick={() => handleToggleUserRole(u.id, u.role)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm transition-all ${
              u.role === 'admin' ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200' : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            {u.role === 'admin' ? 'Jadikan User' : 'Jadikan Admin'}
          </button>
        </div>
      ))}
    </div>
  );
}
