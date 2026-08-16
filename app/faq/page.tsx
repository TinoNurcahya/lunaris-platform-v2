"use client";

import {useState, useMemo} from "react";
import {HelpCircle, ChevronDown, Search} from "lucide-react";
import Link from "next/link";

interface FAQItem {
  id: string;
  category: "general" | "gamification" | "features" | "account";
  categoryLabel: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: "faq-1",
    category: "general",
    categoryLabel: "Umum",
    question: "Apa itu Lunarys Platform?",
    answer:
      "Lunarys v2 adalah platform sosial modern bagi komunitas penulis, pencipta kata mutiara, dan penikmat musik di Indonesia untuk saling berbagi kutipan inspiratif, lirik lagu favorit, dan filosofi hidup.",
  },
  {
    id: "faq-2",
    category: "account",
    categoryLabel: "Akun & Login",
    question: "Apakah saya bisa masuk menggunakan akun Google?",
    answer:
      'Ya! Anda dapat masuk atau mendaftar secara instan dalam 1 klik menggunakan tombol "Masuk dengan Google" pada halaman Login maupun Pendaftaran.',
  },
  {
    id: "faq-3",
    category: "gamification",
    categoryLabel: "XP & Level",
    question: "Bagaimana cara menaikkan XP dan Level di profil saya?",
    answer:
      "Setiap kali Anda membuat kutipan baru (+50 XP), memberikan tanggapan suka (+10 XP), atau berkomentar (+5 XP), XP Anda akan bertambah secara otomatis dan menaikkan Level profil Anda di Leaderboard.",
  },
  {
    id: "faq-4",
    category: "features",
    categoryLabel: "Fitur Kutipan",
    question: "Bagaimana cara menambahkan lagu atau player Spotify ke kutipan?",
    answer:
      "Saat membuat atau mengedit kutipan, Anda dapat memasukkan tautan (URL) lagu Spotify. Player musik Spotify interaktif beserta cuplikan lirik akan tampil secara otomatis di kartu kutipan Anda.",
  },
  {
    id: "faq-5",
    category: "features",
    categoryLabel: "Fitur Kutipan",
    question: "Bagaimana cara menyematkan (pin) kutipan di profil?",
    answer:
      "Klik ikon Jarum Semat (Pin) pada kartu kutipan milik Anda sendiri. Kutipan yang disematkan akan selalu tampil di bagian paling atas halaman profil Anda.",
  },
  {
    id: "faq-6",
    category: "general",
    categoryLabel: "Umum",
    question: "Apakah aplikasi Lunarys gratis untuk digunakan?",
    answer: "Ya, seluruh fitur di Lunarys v2 dapat diakses 100% secara gratis oleh seluruh pengguna.",
  },
];

export default function FAQPage() {
  const [openIds, setOpenIds] = useState<string[]>(["faq-1", "faq-3"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const toggleFAQ = (id: string) => {
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const filteredFAQs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesSearch =
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-indigo-600 p-8 sm:p-10 text-white shadow-lg">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-sky-100 bg-white/10 border border-white/20 rounded-full backdrop-blur-md">
            <HelpCircle className="w-4 h-4" />
            <span>Pusat Bantuan & FAQ</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">Pertanyaan yang Sering Diajukan</h1>

          <p className="text-xs sm:text-sm text-indigo-100 max-w-xl leading-relaxed">
            Temukan jawaban lengkap seputar cara penggunaan Lunarys, fitur lirik lagu, sistem level & XP,
            serta manajemen akun.
          </p>

          {/* Search Box inside Banner */}
          <div className="pt-2 max-w-md">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari pertanyaan atau kata kunci..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-800 dark:text-slate-100 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
            selectedCategory === "all"
              ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}>
          Semua Pertanyaan ({FAQ_DATA.length})
        </button>

        <button
          onClick={() => setSelectedCategory("general")}
          className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
            selectedCategory === "general"
              ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}>
          Umum
        </button>

        <button
          onClick={() => setSelectedCategory("gamification")}
          className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
            selectedCategory === "gamification"
              ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}>
          XP & Level
        </button>

        <button
          onClick={() => setSelectedCategory("features")}
          className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
            selectedCategory === "features"
              ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}>
          Fitur & Musik
        </button>

        <button
          onClick={() => setSelectedCategory("account")}
          className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
            selectedCategory === "account"
              ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}>
          Akun & Login
        </button>
      </div>

      {/* Accordion FAQ List */}
      <div className="space-y-4">
        {filteredFAQs.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Tidak Ada Pertanyaan Ditemukan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Coba gunakan kata kunci lain dalam pencarian Anda.
            </p>
          </div>
        ) : (
          filteredFAQs.map((faq) => {
            const isOpen = openIds.includes(faq.id);

            return (
              <div
                key={faq.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs transition-all duration-200">
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-slate-900 dark:text-white hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-800 rounded-full shrink-0">
                      {faq.categoryLabel}
                    </span>
                    <span className="text-sm sm:text-base font-bold">{faq.question}</span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-indigo-600 dark:text-indigo-400" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-100 dark:border-slate-800/60 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal bg-slate-50/40 dark:bg-slate-900/40">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* CTA Bottom Card */}
      <div className="bg-indigo-50 dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-base font-bold text-slate-900 dark:text-white">Punya Pertanyaan Lain?</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Mulai bagikan inspirasimu dan bergabunglah bersama komunitas Lunarys hari ini.
          </p>
        </div>
        <Link
          href="/quotes/create"
          className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all shrink-0">
          Buat Kutipan Pertama
        </Link>
      </div>
    </div>
  );
}
