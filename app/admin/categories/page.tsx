"use client";

import {useEffect, useState} from "react";
import {createClient} from "@/utils/supabase/client";
import {Category} from "@/types";
import {
  Sparkles,
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
  Tag,
  Globe,
  Star,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  Grid,
  Check,
  X,
} from "lucide-react";
import Link from "next/link";
import {toast} from "sonner";

const ICON_LIST = [
  {name: "Sparkles", icon: Sparkles},
  {name: "Heart", icon: Heart},
  {name: "Compass", icon: Compass},
  {name: "Flame", icon: Flame},
  {name: "BookOpen", icon: BookOpen},
  {name: "Zap", icon: Zap},
  {name: "Coffee", icon: Coffee},
  {name: "Music", icon: Music},
  {name: "Sun", icon: Sun},
  {name: "Moon", icon: Moon},
  {name: "Feather", icon: Feather},
  {name: "Smile", icon: Smile},
  {name: "Tag", icon: Tag},
  {name: "Globe", icon: Globe},
  {name: "Star", icon: Star},
];

const COLOR_LIST = [
  {
    name: "Indigo",
    bg: "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400",
    hex: "#6366f1",
  },
  {
    name: "Rose",
    bg: "bg-rose-50 dark:bg-rose-950/60 border-rose-100 dark:border-rose-900 text-rose-600 dark:text-rose-400",
    hex: "#f43f5e",
  },
  {
    name: "Emerald",
    bg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400",
    hex: "#10b981",
  },
];

const normalizeCategoryColor = (colorName?: string): string => {
  if (colorName === "Indigo" || colorName === "Rose" || colorName === "Emerald") {
    return colorName;
  }

  // Legacy colors are mapped into the 3-color palette.
  switch (colorName) {
    case "Amber":
    case "Yellow":
    case "Orange":
    case "Pink":
      return "Rose";
    case "Blue":
    case "Violet":
    case "Cyan":
    default:
      return "Indigo";
  }
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<(Category & {quotes_count?: number})[]>([]);
  const [editingCatId, setEditingCatId] = useState<number | null>(null);

  // Form State
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("Sparkles");
  const [selectedColor, setSelectedColor] = useState("Indigo");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = async () => {
    const supabase = createClient();

    const [{data: catsData}, {data: quotesData}] = await Promise.all([
      supabase.from("categories").select("*").order("name", {ascending: true}),
      supabase.from("quotes").select("category_id"),
    ]);

    if (catsData) {
      const countsMap: Record<number, number> = {};
      quotesData?.forEach((q) => {
        if (q.category_id) {
          countsMap[q.category_id] = (countsMap[q.category_id] || 0) + 1;
        }
      });

      const formatted = catsData.map((c) => ({
        ...c,
        quotes_count: countsMap[c.id] || 0,
      }));
      setCategories(formatted);
    }
    setLoading(false);
  };

  useEffect(() => {
    let ignore = false;
    async function loadInitial() {
      const supabase = createClient();
      const [{data: catsData}, {data: quotesData}] = await Promise.all([
        supabase.from("categories").select("*").order("name", {ascending: true}),
        supabase.from("quotes").select("category_id"),
      ]);

      if (!ignore && catsData) {
        const countsMap: Record<number, number> = {};
        quotesData?.forEach((q) => {
          if (q.category_id) {
            countsMap[q.category_id] = (countsMap[q.category_id] || 0) + 1;
          }
        });

        const formatted = catsData.map((c) => ({
          ...c,
          quotes_count: countsMap[c.id] || 0,
        }));
        setCategories(formatted);
        setLoading(false);
      }
    }
    loadInitial();
    return () => {
      ignore = true;
    };
  }, []);

  const resetForm = () => {
    setEditingCatId(null);
    setCatName("");
    setCatSlug("");
    setSelectedIcon("Sparkles");
    setSelectedColor("Indigo");
  };

  const handleStartEdit = (cat: Category) => {
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setSelectedIcon(cat.icon || "Sparkles");
    setSelectedColor(normalizeCategoryColor(cat.color));
  };

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    setSubmitting(true);
    try {
      const supabase = createClient();
      const slug =
        catSlug.trim() ||
        catName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

      if (editingCatId) {
        const {error} = await supabase
          .from("categories")
          .update({
            name: catName.trim(),
            slug,
            icon: selectedIcon,
            color: selectedColor,
          })
          .eq("id", editingCatId);

        if (error) throw error;
        toast.success("Kategori berhasil diperbarui!");
      } else {
        const {error} = await supabase.from("categories").insert({
          name: catName.trim(),
          slug,
          icon: selectedIcon,
          color: selectedColor,
        });

        if (error) throw error;
        toast.success("Kategori baru berhasil ditambahkan!");
      }

      resetForm();
      await loadCategories();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menyimpan kategori";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (catId: number, catName: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus kategori "${catName}"?`)) return;

    try {
      const supabase = createClient();
      const {error} = await supabase.from("categories").delete().eq("id", catId);
      if (error) throw error;

      toast.success("Kategori berhasil dihapus!");
      setCategories((prev) => prev.filter((c) => c.id !== catId));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menghapus kategori";
      toast.error(message);
    }
  };

  const renderCategoryIcon = (iconName?: string) => {
    const found = ICON_LIST.find((i) => i.name === iconName) || ICON_LIST[0];
    const IconComponent = found.icon;
    return <IconComponent className="w-5 h-5" />;
  };

  const getColorClass = (colorName?: string) => {
    const found = COLOR_LIST.find((c) => c.name === colorName) || COLOR_LIST[0];
    return found.bg;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-32 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Overview Banner */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Kelola Kategori Kutipan</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Atur nama, slug, ikon, dan tema warna kategori platform.
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
          {categories.length} Kategori Aktif
        </span>
      </div>

      {/* Category Editor Form */}
      <form
        onSubmit={handleSubmitCategory}
        className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {editingCatId ? (
              <Edit3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            )}
            <span>{editingCatId ? "Edit Kategori" : "Tambah Kategori Baru"}</span>
          </h4>
          {editingCatId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 font-medium cursor-pointer">
              <X className="w-3.5 h-3.5" />
              <span>Batal Edit</span>
            </button>
          )}
        </div>

        {/* Input Name & Slug */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nama Kategori <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Misal: Asmara & Cinta"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 transition-all"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Slug (URL Keyword)
            </label>
            <input
              type="text"
              placeholder="Misal: asmara-cinta (Otomatis jika kosong)"
              value={catSlug}
              onChange={(e) => setCatSlug(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 transition-all"
            />
          </div>
        </div>

        {/* Icon Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Pilih Ikon Kategori
          </label>
          <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl max-h-32 overflow-y-auto">
            {ICON_LIST.map((item) => {
              const IconComp = item.icon;
              const isSelected = selectedIcon === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setSelectedIcon(item.name)}
                  className={`p-2 rounded-lg transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}>
                  <IconComp className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Pilih Warna Tema Card
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {COLOR_LIST.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setSelectedColor(c.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border flex items-center gap-1.5 cursor-pointer ${
                  selectedColor === c.name
                    ? "ring-2 ring-indigo-600 shadow-xs"
                    : "opacity-80 hover:opacity-100"
                } ${c.bg}`}>
                <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: c.hex}} />
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {editingCatId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer">
              Batal
            </button>
          )}

          <button
            type="submit"
            disabled={submitting || !catName.trim()}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer">
            <Check className="w-4 h-4" />
            <span>
              {submitting ? "Menyimpan..." : editingCatId ? "Perbarui Kategori" : "Simpan Kategori Baru"}
            </span>
          </button>
        </div>
      </form>

      {/* Grid Categories Cards List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const colorClass = getColorClass(cat.color);

          return (
            <div
              key={cat.id}
              className="group relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${colorClass}`}>
                    {renderCategoryIcon(cat.icon)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-medium">
                      #{cat.slug}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 text-[11px] font-bold font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                  {cat.quotes_count || 0} Kutipan
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <Link
                  href={`/?category=${cat.id}`}
                  target="_blank"
                  className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold flex items-center gap-1 transition-colors">
                  <span>Lihat Kutipan</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEdit(cat)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Edit Kategori">
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Kategori">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
