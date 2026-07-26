'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Plus,
  FolderPlus,
  Check,
  Globe,
  Lock,
  Sparkles
} from 'lucide-react';
import { QuoteCollection } from '@/types';
import {
  fetchUserCollections,
  createCollection,
  addQuoteToCollection,
  removeQuoteFromCollection,
  fetchCollectionIdsForQuote
} from '@/services/collections';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

interface AddToCollectionModalProps {
  quoteId: number;
  isOpen: boolean;
  onClose: () => void;
}

const COVER_GRADIENTS = [
  { label: 'Indigo Blue', value: 'from-indigo-600 to-blue-700' },
  { label: 'Amber Rose', value: 'from-amber-500 to-rose-600' },
  { label: 'Emerald Cyan', value: 'from-emerald-600 to-teal-700' },
  { label: 'Purple Pink', value: 'from-purple-600 to-pink-600' },
  { label: 'Slate Dark', value: 'from-slate-800 to-slate-950' },
];

export default function AddToCollectionModal({ quoteId, isOpen, onClose }: AddToCollectionModalProps) {
  const [collections, setCollections] = useState<QuoteCollection[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // New Collection Form State
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [selectedGradient, setSelectedGradient] = useState('from-indigo-600 to-blue-700');
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    async function loadCollections() {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Silakan login untuk menyimpan ke koleksi');
        onClose();
        return;
      }

      const [userCols, activeColIds] = await Promise.all([
        fetchUserCollections(user.id),
        fetchCollectionIdsForQuote(quoteId)
      ]);

      setCollections(userCols);
      setSelectedIds(activeColIds);
      setLoading(false);
    }

    loadCollections();
  }, [isOpen, quoteId, onClose]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleToggleCollection = async (collectionId: number) => {
    const isSelected = selectedIds.includes(collectionId);
    const updated = isSelected
      ? selectedIds.filter((id) => id !== collectionId)
      : [...selectedIds, collectionId];

    setSelectedIds(updated);

    try {
      if (isSelected) {
        await removeQuoteFromCollection(collectionId, quoteId);
        toast.success('Kutipan dihapus dari koleksi');
      } else {
        await addQuoteToCollection(collectionId, quoteId);
        toast.success('Kutipan ditambahkan ke koleksi');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui koleksi';
      toast.error(msg);
      // Revert selection
      setSelectedIds(selectedIds);
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    setCreateLoading(true);
    try {
      const created = await createCollection({
        name: newCollectionName,
        description: newCollectionDesc,
        is_public: isPublic,
        cover_gradient: selectedGradient
      });

      // Auto add quote to new collection
      await addQuoteToCollection(created.id, quoteId);

      setCollections([created, ...collections]);
      setSelectedIds([...selectedIds, created.id]);
      toast.success(`Koleksi "${created.name}" berhasil dibuat & kutipan disimpan!`);

      // Reset form
      setNewCollectionName('');
      setNewCollectionDesc('');
      setShowCreateForm(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membuat koleksi';
      toast.error(msg);
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] cursor-default"
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center">
              <FolderPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Simpan ke Koleksi</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Kelola album / playlist kutipan Anda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : showCreateForm ? (
            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nama Koleksi</label>
                <input
                  type="text"
                  placeholder="misal: Lirik Lagu Galau"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Deskripsi Singkat (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Kumpulan lirik favorit untuk teman begadang..."
                  value={newCollectionDesc}
                  onChange={(e) => setNewCollectionDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 resize-none"
                />
              </div>

              {/* Cover Gradient Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Warna Sampul</label>
                <div className="flex items-center gap-2">
                  {COVER_GRADIENTS.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setSelectedGradient(g.value)}
                      className={`w-7 h-7 rounded-full bg-gradient-to-r ${g.value} border-2 transition-all cursor-pointer ${
                        selectedGradient === g.value ? 'border-white ring-2 ring-indigo-600 scale-110' : 'border-transparent'
                      }`}
                      title={g.label}
                    />
                  ))}
                </div>
              </div>

              {/* Public Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  {isPublic ? <Globe className="w-4 h-4 text-emerald-500" /> : <Lock className="w-4 h-4 text-amber-500" />}
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {isPublic ? 'Koleksi Publik' : 'Koleksi Privat'}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {isPublic ? 'Dapat dilihat oleh semua pengguna' : 'Hanya bisa dilihat oleh Anda'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPublic(!isPublic)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Ubah
                </button>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {createLoading ? 'Membuat...' : 'Buat Koleksi'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full flex items-center justify-center gap-2 p-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-dashed border-indigo-300 dark:border-indigo-800 rounded-2xl transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Koleksi Baru</span>
              </button>

              {collections.length === 0 ? (
                <div className="text-center py-6 text-slate-500 dark:text-slate-400 space-y-1">
                  <Sparkles className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-xs font-semibold">Belum Memiliki Koleksi</p>
                  <p className="text-[11px]">Buat koleksi pertama Anda untuk mengelompokkan kutipan favorit.</p>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  {collections.map((col) => {
                    const isChecked = selectedIds.includes(col.id);

                    return (
                      <button
                        key={col.id}
                        onClick={() => handleToggleCollection(col.id)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
                          isChecked
                            ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-r ${col.cover_gradient} shrink-0 flex items-center justify-center shadow-xs`}>
                            {col.is_public ? <Globe className="w-4 h-4 text-white/80" /> : <Lock className="w-4 h-4 text-white/80" />}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{col.name}</h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                              {col.items_count || 0} kutipan • {col.is_public ? 'Publik' : 'Privat'}
                            </p>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                          isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}
