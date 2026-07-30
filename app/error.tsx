'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled Root Error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-12">
      <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4 shadow-md">
        <AlertCircle className="w-8 h-8" />
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
        Terjadi Kesalahan Sistem
      </h2>

      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-md">
        Maaf, halaman ini tidak dapat dimuat saat ini. Silakan coba muat ulang halaman atau kembali ke beranda.
      </p>

      {error.digest && (
        <p className="mt-2 text-xs font-mono text-slate-400 dark:text-slate-500">
          Kode Error: {error.digest}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Coba Lagi</span>
        </button>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full border border-slate-200 dark:border-slate-700 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    </div>
  );
}
