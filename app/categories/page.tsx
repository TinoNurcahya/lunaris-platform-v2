'use client';

import { useEffect, useState } from 'react';
import { fetchCategories } from '@/services/categories';
import { Category } from '@/types';
import { Grid, Sparkles } from 'lucide-react';
import Link from 'next/link';

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
        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
          <Grid className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Kategori Kutipan</h2>
          <p className="text-xs text-slate-500">Jelajahi kutipan berdasarkan tema dan nuansa perasaan.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/?category=${cat.id}`}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 hover:border-indigo-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                  # {cat.slug}
                </span>
                <Sparkles className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {cat.name}
              </h3>

              <p className="text-xs text-slate-500 mt-2 font-medium">Lihat semua kutipan →</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
