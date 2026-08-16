"use client";

import { useEffect, useState } from "react";
import { fetchAuditLogs, fetchAuditLogStats } from "@/services/audit-log";
import { AuditLogItem, AuditLogStats } from "@/types";
import {
  Shield,
  Activity,
  Globe,
  Clock,
  Search,
  RefreshCw,
  Info,
  Terminal,
  Laptop,
  X,
  Code,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [stats, setStats] = useState<AuditLogStats>({
    total_logs: 0,
    today_logs: 0,
    unique_ips: 1,
    admin_actions: 0,
    top_browser: "Chrome",
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setLoading(true);
    try {
      const [logItems, statsData] = await Promise.all([
        fetchAuditLogs({ page: 1, limit: 20, search, actionFilter }),
        fetchAuditLogStats(),
      ]);

      setLogs(logItems);
      setStats(statsData);
    } catch {
      toast.error("Gagal memuat log audit");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function loadInitial() {
      setLoading(true);
      const [logItems, statsData] = await Promise.all([
        fetchAuditLogs({ page: 1, limit: 20, search: "", actionFilter: "all" }),
        fetchAuditLogStats(),
      ]);

      if (!ignore) {
        setLogs(logItems);
        setStats(statsData);
        setLoading(false);
      }
    }
    loadInitial();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(true);
  };

  const getActionBadgeColor = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes("ADMIN") || act.includes("ROLE") || act.includes("BROADCAST")) {
      return "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
    }
    if (act.includes("AUTH") || act.includes("LOGIN") || act.includes("REGISTER")) {
      return "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    }
    if (act.includes("DELETE") || act.includes("REPORT")) {
      return "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800";
    }
    return "bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800";
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Audit Log & Security Access</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Monitoring alamat IP, perangkat pengguna, dan log aktivitas platform.
            </p>
          </div>
        </div>

        <button
          onClick={() => loadData(true)}
          className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 rounded-xl transition-all cursor-pointer"
          title="Refresh Log Data">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-600" : ""}`} />
        </button>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Record</span>
            <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {stats.total_logs}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Aktivitas Hari Ini</span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {stats.today_logs}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Unique IP Address</span>
            <Globe className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {stats.unique_ips}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Aksi Admin</span>
            <Shield className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {stats.admin_actions}
          </p>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Cari IP Address, Action, Path, atau Email User..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs cursor-pointer">
            Cari
          </button>
        </form>

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-xs">
          {[
            { label: "Semua Action", value: "all" },
            { label: "Akses Halaman", value: "PAGE_ACCESS" },
            { label: "Auth / Session", value: "AUTH_EVENT" },
            { label: "Aksi Admin", value: "UPDATE_USER_ROLE" },
            { label: "System Broadcast", value: "SYSTEM_BROADCAST" },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => {
                setActionFilter(item.value);
                fetchAuditLogs({ page: 1, limit: 20, search, actionFilter: item.value }).then(
                  (data) => setLogs(data),
                );
              }}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
                actionFilter === item.value
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3">
          <Terminal className="w-10 h-10 text-indigo-500 mx-auto" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Belum ada log audit di Database Supabase
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Log aktivitas riil akan tercatat otomatis secara real-time saat pengguna/admin mengakses halaman, mengubah role, atau melakukan aksi di platform.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700 max-w-lg mx-auto text-left text-xs space-y-2">
            <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Petunjuk Setup Tabel Supabase (`audit_logs`):</span>
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              Jika Anda belum membuat tabel `audit_logs` di Supabase, jalankan file SQL migrasi di 
              <code className="bg-slate-200 dark:bg-slate-900 px-1.5 py-0.5 rounded font-mono text-indigo-600 dark:text-indigo-400 ml-1">
                supabase/migrations/create_audit_logs_table.sql
              </code> 
              pada Supabase Dashboard &gt; SQL Editor.
            </p>
            <button
              type="button"
              onClick={() => {
                const sqlScript = `create table if not exists public.audit_logs (
  id bigint generated by default as identity primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.profiles(id) on delete set null,
  user_email text,
  action text not null,
  ip_address text,
  user_agent text,
  location text,
  path text,
  method text,
  details jsonb default '{}'::jsonb
);
alter table public.audit_logs enable row level security;
create policy "Admins can view audit logs" on public.audit_logs for select using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));
create policy "Allow insert for audit logs" on public.audit_logs for insert with check (true);`;
                navigator.clipboard.writeText(sqlScript);
                toast.success("Script SQL Migrasi berhasil disalin!");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer">
              <Code className="w-3.5 h-3.5" />
              <span>Salin Script SQL Migrasi ke Clipboard</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {logs.map((log) => (
            <div
              key={log.id}
              onClick={() => setSelectedLog(log)}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all cursor-pointer group">
              <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                  <Laptop className="w-4 h-4 group-hover:text-indigo-600 transition-colors" />
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {log.user?.name || log.user_email || "Guest (Pengunjung Anonim)"}
                    </span>
                    {log.user?.username && (
                      <span className="text-indigo-600 dark:text-indigo-400 font-mono">
                        @{log.user.username}
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getActionBadgeColor(
                        log.action,
                      )}`}>
                      {log.action}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap font-mono">
                    <span className="text-slate-700 dark:text-slate-300 font-bold">
                      IP: {log.ip_address || "127.0.0.1"}
                    </span>
                    <span>•</span>
                    <span>{log.location || "Local Dev"}</span>
                    <span>•</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                      {log.method || "GET"} {log.path || "/"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-400 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <span className="font-mono text-[10px]">
                  {new Date(log.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
                <Info className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail JSON Modal */}
      {selectedLog && (
        <div
          onClick={() => setSelectedLog(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto cursor-default">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                <Code className="w-4 h-4" />
                <span>Rincian Metadata Log Audit #{selectedLog.id}</span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">IP ADDRESS</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedLog.ip_address || "127.0.0.1"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">WAKTU ACCESSED</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {new Date(selectedLog.created_at).toLocaleString("id-ID")}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ROUTE PATH</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {selectedLog.method} {selectedLog.path}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">LOKASI</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedLog.location || "Localhost / Dev"}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  User Agent (Perangkat / Browser):
                </span>
                <p className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-600 dark:text-slate-400 break-all leading-relaxed">
                  {selectedLog.user_agent || "Tidak diketahui"}
                </p>
              </div>

              {selectedLog.details && (
                <div className="space-y-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Payload Details (JSON):
                  </span>
                  <pre className="p-3 bg-slate-900 text-indigo-200 rounded-xl font-mono text-[11px] overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedLog(null)}
              className="w-full py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all cursor-pointer">
              Tutup Rincian
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
