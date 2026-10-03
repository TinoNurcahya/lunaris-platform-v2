'use client';

import { useEffect, useState } from 'react';
import { fetchCategories } from '@/services/categories';
import { Category } from '@/types';
import {
  Tag,
  Heart,
  Compass,
  Flame,
  BookOpen,
  Zap,
  Coffee,
  Music,
  Sun,
  Moon,
  Feather,
  Smile,
  Globe,
  Star,
  Bookmark,
  Folder,
  Layers,
  Grid,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';

const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  Tag,
  Heart,
  Compass,
  Flame,
  BookOpen,
  Zap,
  Coffee,
  Music,
  Sun,
  Moon,
  Feather,
  Smile,
  Globe,
  Star,
  Bookmark,
  Folder,
  Layers,
  Grid,
};

function getCategoryIcon(iconName?: string | null): LucideIcon {
  if (!iconName || iconName === 'Sparkles') {
    return Tag;
  }
  return CATEGORY_ICON_MAP[iconName] || Tag;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories().then((cats) => {
      setCategories(cats);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center">
          <Grid className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Kategori Kutipan</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Jelajahi kutipan berdasarkan tema dan nuansa perasaan.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.icon);

            return (
              <Link
                key={cat.id}
                href={`/?category=${cat.id}`}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-mono">
                      # {cat.slug}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-200">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {cat.name}
                  </h3>
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  <span>Lihat semua kutipan</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
