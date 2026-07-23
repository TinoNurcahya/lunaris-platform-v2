import Link from 'next/link';
import { Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200/90 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-800">Lunarys Platform V2</span>
          </div>

          <p className="text-xs text-slate-500 flex items-center gap-1">
            Dibuat dengan <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> menggunakan Next.js 16, Supabase, & Vercel.
          </p>

          <div className="flex items-center gap-6 text-xs text-slate-600 font-medium">
            <Link href="/" className="hover:text-indigo-600 transition-colors">Beranda</Link>
            <Link href="/categories" className="hover:text-indigo-600 transition-colors">Kategori</Link>
            <Link href="/leaderboard" className="hover:text-indigo-600 transition-colors">Leaderboard</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
