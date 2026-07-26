import Link from 'next/link';
import { Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-all">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Lunarys
                </span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 -mt-1 font-mono">
                  v2.0 Platform
                </span>
              </div>
            </Link>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              Platform berbagi kutipan kata mutiara, inspirasi lirik lagu, dan filosofi hidup terpopuler untuk komunitas Indonesia.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Navigasi Utama
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Beranda Feed
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Jelajah Kategori
                </Link>
              </li>
              <li>
                <Link href="/collections" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Koleksi & Album Kutipan
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Papan Peringkat (Leaderboard)
                </Link>
              </li>
              <li>
                <Link href="/bookmarks" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Kutipan Tersimpan
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Pertanyaan Umum (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Hubungi Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* Technology & Info Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Teknologi
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Dibangun dengan Next.js 16 (App Router), React 19, Supabase, Tailwind CSS v4, dan Vercel.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 rounded-full border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Vercel Live
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {currentYear} Lunarys Platform. Hak cipta dilindungi undang-undang.</p>
          <div className="flex items-center gap-1">
            <span>Dibuat dengan</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 mx-0.5" />
            <span>untuk Komunitas Penulis</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
