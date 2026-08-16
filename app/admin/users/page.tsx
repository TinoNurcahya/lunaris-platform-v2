"use client";

import {useEffect, useState} from "react";
import {createClient} from "@/utils/supabase/client";
import {UserProfile} from "@/types";
import {toast} from "sonner";
import {recordAuditLog} from "@/services/audit-log";

export default function AdminUsersPage() {
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      const supabase = createClient();
      const {data} = await supabase.from("profiles").select("*").order("created_at", {ascending: false});
      if (data) setUsersList(data as UserProfile[]);
      setLoading(false);
    }
    loadUsers();
  }, []);

  const handleToggleUserRole = async (userId: string, currentRole: "user" | "admin") => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      const supabase = createClient();
      const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
      if (error) throw error;

      await recordAuditLog({
        action: "UPDATE_USER_ROLE",
        path: "/admin/users",
        method: "POST",
        details: { target_user_id: userId, new_role: newRole },
      });

      toast.success(`Role pengguna berhasil diubah ke ${newRole}`);
      setUsersList((prev) => prev.map((u) => (u.id === userId ? {...u, role: newRole} : u)));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal mengubah role";
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {usersList.map((u) => (
        <div
          key={u.id}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={u.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
              alt={u.name}
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 object-cover shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {u.name} (@{u.username})
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Lvl {u.level} • {u.xp} XP • Role:{" "}
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">{u.role}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => handleToggleUserRole(u.id, u.role)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer ${
              u.role === "admin"
                ? "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-800"
                : "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800"
            }`}>
            {u.role === "admin" ? "Jadikan User" : "Jadikan Admin"}
          </button>
        </div>
      ))}
    </div>
  );
}
