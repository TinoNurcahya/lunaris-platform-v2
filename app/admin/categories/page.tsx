'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Category } from '@/types';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase.from('categories').select('*').order('name', { ascending: true });
      if (data) setCategories(data as Category[]);
      setLoading(false);
    }
    loadCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const supabase = createClient();
      const slug = newCatSlug.trim() || newCatName.toLowerCase().replace(/\s+/g, '-');
      const { data, error } = await supabase
        .from('categories')
        .insert({ name: newCatName.trim(), slug })
        .select()
        .single();

      if (error) throw error;

      toast.success('Kategori baru berhasil ditambahkan!');
      setCategories((prev) => [...prev, data as Category]);
      setNewCatName('');
      setNewCatSlug('');
    } catch (err: any) {
      toast.error(err.message || 'Gagal menambah kategori');
    }
  };

  if (loading) {
    return <div className="h-40 rounded-2xl bg-white border border-slate-200 animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      {/* Form Add Category */}
      <form onSubmit={handleAddCategory} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Plus className="w-4 h-4 text-indigo-600" />
          <span>Tambah Kategori Baru</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nama Kategori (misal: Puisi Cinta)"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600"
            required
          />
          <input
            type="text"
            placeholder="Slug (misal: puisi-cinta)"
            value={newCatSlug}
            onChange={(e) => setNewCatSlug(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600"
          />
        </div>
        <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl shadow-sm hover:bg-indigo-700">
          Simpan Kategori
        </button>
      </form>

      {/* Grid Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => (
          <div key={cat.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">{cat.name}</p>
              <p className="text-xs text-indigo-600 font-mono">#{cat.slug}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
