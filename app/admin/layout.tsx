'use client';

import { ShieldCheck } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6 pb-12">
      {/* Admin Header */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Admin Control Center</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Portal pusat manajemen platform, moderasi konten, dan pengumuman.</p>
        </div>
      </div>

      {/* Admin Page Content */}
      <div>{children}</div>
    </div>
  );
}
