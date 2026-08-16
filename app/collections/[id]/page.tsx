"use client";

import {use, useEffect, useState} from "react";
import {fetchCollectionById, deleteCollection} from "@/services/collections";
import {QuoteCollection} from "@/types";
import QuoteCard from "@/components/quote/QuoteCard";
import {FolderHeart, Globe, Lock, Trash2, ArrowLeft, Sparkles} from "lucide-react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {createClient} from "@/utils/supabase/client";
import {toast} from "sonner";

function normalizeCoverColor(value?: string) {
  if (!value) return "bg-indigo-600";
  if (value.includes("slate")) return "bg-slate-800";
  return "bg-sky-600";
}

export default function CollectionDetailPage({params}: {params: Promise<{id: string}>}) {
  const {id} = use(params);
  const router = useRouter();
  const collectionId = parseInt(id, 10);

  const [collection, setCollection] = useState<QuoteCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    async function loadCollection() {
      setLoading(true);
      const data = await fetchCollectionById(collectionId);
      setCollection(data);

      if (data) {
        const supabase = createClient();
        const {
          data: {user},
        } = await supabase.auth.getUser();
        if (user && user.id === data.user_id) {
          setIsOwner(true);
        }
      }

      setLoading(false);
    }

    loadCollection();
  }, [collectionId]);

  const handleDelete = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus koleksi ini?")) return;

    setDeleteLoading(true);
    try {
      await deleteCollection(collectionId);
      toast.success("Koleksi berhasil dihapus");
      router.push("/collections");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus koleksi";
      toast.error(msg);
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="h-44 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-white dark:bg-slate-900 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-4">
        <FolderHeart className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Koleksi Tidak Ditemukan</h3>
        <p className="text-xs text-slate-500">Koleksi ini mungkin telah dihapus atau diset privat.</p>
        <Link
          href="/collections"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-full">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Jelajah Koleksi</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Back Button */}
      <Link
        href="/collections"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Koleksi</span>
      </Link>

      {/* Collection Cover Banner */}
      <div
        className={`relative overflow-hidden rounded-3xl ${normalizeCoverColor(collection.cover_gradient)} p-6 sm:p-10 text-white shadow-lg space-y-4`}>
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-black/20 backdrop-blur-md rounded-full border border-white/20">
            {collection.is_public ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>{collection.is_public ? "Koleksi Publik" : "Koleksi Privat"}</span>
          </div>

          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="p-2 bg-rose-500/20 hover:bg-rose-500/40 text-rose-100 rounded-xl transition-colors cursor-pointer"
              title="Hapus Koleksi">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">{collection.name}</h1>
          {collection.description && (
            <p className="text-xs sm:text-sm text-white/80 mt-2 max-w-xl leading-relaxed">
              {collection.description}
            </p>
          )}
        </div>

        {collection.user && (
          <div className="flex items-center gap-3 pt-2 border-t border-white/20">
            <img
              src={
                collection.user.avatar_url ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${collection.user.username}`
              }
              alt={collection.user.name}
              className="w-8 h-8 rounded-full bg-white/10 object-cover ring-2 ring-white/30"
            />
            <div className="text-xs">
              <span className="font-semibold text-white">{collection.user.name}</span>
              <span className="text-white/60 ml-2 font-mono">@{collection.user.username}</span>
            </div>
          </div>
        )}
      </div>

      {/* Collection Quotes Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Daftar Kutipan ({collection.quotes?.length || 0})</span>
        </h3>

        {!collection.quotes || collection.quotes.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <p className="text-xs text-slate-500 dark:text-slate-400">Belum ada kutipan dalam koleksi ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {collection.quotes.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
