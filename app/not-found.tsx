import Link from 'next/link';
import { Compass, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-12 space-y-4">
      <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-md">
        <Compass className="w-10 h-10 animate-pulse" />
      </div>

      <div className="space-y-1">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          404 — Halaman Tidak Ditemukan
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Jejak Kutipan Hilang
        </h1>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
        Halaman atau kutipan yang kamu cari tidak ada atau telah dipindahkan.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-md shadow-indigo-600/20 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full border border-slate-200 dark:border-slate-700 transition-all"
        >
          <Search className="w-4 h-4" />
          <span>Cari Kutipan Lain</span>
        </Link>
      </div>
    </div>
  );
}
