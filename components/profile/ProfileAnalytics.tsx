"use client";

import {UserProfile, QuoteItem} from "@/types";
import {Heart, MessageCircle, Flame, BarChart3, Tag, ThumbsDown, PieChart, TrendingUp} from "lucide-react";
import Link from "next/link";

interface ProfileAnalyticsProps {
  profile: UserProfile;
  quotes: QuoteItem[];
}

export default function ProfileAnalytics({quotes}: ProfileAnalyticsProps) {
  const totalLikes = quotes.reduce((acc, q) => acc + (q.likes_count || 0), 0);
  const totalDislikes = quotes.reduce((acc, q) => acc + (q.dislikes_count || 0), 0);
  const totalComments = quotes.reduce((acc, q) => acc + (q.comments_count || 0), 0);

  const topQuote =
    quotes.length > 0 ? [...quotes].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))[0] : null;

  const avgCommentsPerQuote = quotes.length > 0 ? (totalComments / quotes.length).toFixed(1) : "0";

  // Category tally for chart
  const categoryCounts: Record<string, number> = {};
  quotes.forEach((q) => {
    const name = q.category?.name || "Lainnya";
    categoryCounts[name] = (categoryCounts[name] || 0) + 1;
  });

  const categoryEntries = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  const topCategory = categoryEntries[0];

  // Colors for charts
  const CHART_COLORS = ["#6366f1", "#10b981", "#f43f5e", "#4f46e5", "#059669", "#e11d48"];

  // Prepare quote engagement bars (top 6 quotes)
  const sortedQuotesForChart = [...quotes]
    .sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
    .slice(0, 6);

  const maxLikesInChart = Math.max(...sortedQuotesForChart.map((q) => q.likes_count || 0), 1);

  return (
    <div className="space-y-6">
      {/* Analytics Overview Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Analitik & Insight Publikasi</h3>
        </div>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono">
          Berdasarkan {quotes.length} Kutipan
        </span>
      </div>

      {/* Grid Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Likes Card */}
        <div className="relative overflow-hidden p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 group hover:border-rose-300 transition-all">
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Suka</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Heart className="w-4 h-4 fill-rose-500" />
            </div>
          </div>
          <p className="relative z-10 text-2xl font-extrabold text-slate-900 dark:text-white">{totalLikes}</p>
          <p className="relative z-10 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            Apresiasi Komunitas
          </p>

          <div className="absolute inset-x-0 bottom-0 h-9 pointer-events-none opacity-25 group-hover:opacity-50 transition-opacity">
            <svg className="w-full h-full" viewBox="0 0 100 35" preserveAspectRatio="none">
              <defs>
                <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M0 25 C20 15, 40 22, 60 10 C80 18, 90 12, 100 16 L100 35 L0 35 Z"
                fill="url(#roseGradient)"
              />
              <path
                d="M0 25 C20 15, 40 22, 60 10 C80 18, 90 12, 100 16"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Total Dislikes Card */}
        <div className="relative overflow-hidden p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 group hover:border-slate-400 transition-all">
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sanggahan</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <ThumbsDown className="w-4 h-4" />
            </div>
          </div>
          <p className="relative z-10 text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalDislikes}
          </p>
          <p className="relative z-10 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            Ulasan Komunitas
          </p>

          <div className="absolute inset-x-0 bottom-0 h-9 pointer-events-none opacity-25 group-hover:opacity-50 transition-opacity">
            <svg className="w-full h-full" viewBox="0 0 100 35" preserveAspectRatio="none">
              <defs>
                <linearGradient id="slateGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#64748b" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#64748b" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M0 18 C25 28, 50 16, 75 22, 90 14, 100 20 L100 35 L0 35 Z"
                fill="url(#slateGradient)"
              />
              <path
                d="M0 18 C25 28, 50 16, 75 22, 90 14, 100 20"
                fill="none"
                stroke="#64748b"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Total Comments Card */}
        <div className="relative overflow-hidden p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 group hover:border-indigo-300 transition-all">
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Diskusi</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <MessageCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="relative z-10 text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalComments}
          </p>
          <p className="relative z-10 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            ~{avgCommentsPerQuote} Komentar/Kutipan
          </p>

          <div className="absolute inset-x-0 bottom-0 h-9 pointer-events-none opacity-25 group-hover:opacity-50 transition-opacity">
            <svg className="w-full h-full" viewBox="0 0 100 35" preserveAspectRatio="none">
              <defs>
                <linearGradient id="indigoGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M0 24 C20 12, 45 22, 65 14, 85 24, 100 10 L100 35 L0 35 Z"
                fill="url(#indigoGradient)"
              />
              <path
                d="M0 24 C20 12, 45 22, 65 14, 85 24, 100 10"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Top Category Card */}
        <div className="relative overflow-hidden p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 group hover:border-sky-300 transition-all">
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Kategori Utama</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <p className="relative z-10 text-base font-extrabold text-slate-900 dark:text-white truncate">
            {topCategory ? topCategory[0] : "-"}
          </p>
          <p className="relative z-10 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            {topCategory ? `${topCategory[1]} Kutipan` : "Belum Ada Data"}
          </p>

          <div className="absolute inset-x-0 bottom-0 h-9 pointer-events-none opacity-25 group-hover:opacity-50 transition-opacity">
            <svg className="w-full h-full" viewBox="0 0 100 35" preserveAspectRatio="none">
              <defs>
                <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M0 22 C20 28, 40 16, 60 22, 80 12, 100 18 L100 35 L0 35 Z"
                fill="url(#skyGradient)"
              />
              <path
                d="M0 22 C20 28, 40 16, 60 22, 80 12, 100 18"
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visual Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Performa Interaksi Kutipan</h4>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Terbanyak Disukai</span>
          </div>

          {sortedQuotesForChart.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">Belum ada data untuk ditampilkan</p>
          ) : (
            <div className="space-y-3 pt-2">
              {sortedQuotesForChart.map((q) => {
                const percentage = Math.round(((q.likes_count || 0) / maxLikesInChart) * 100);
                return (
                  <div key={q.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                      <span className="truncate max-w-[200px]" title={q.content}>
                        &quot;{q.content}&quot;
                      </span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                        {q.likes_count || 0} Suka
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                        style={{width: `${Math.max(percentage, 8)}%`}}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Visual Category Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Distribusi Tema Kategori</h4>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Top Kategori</span>
          </div>

          {categoryEntries.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">Belum ada data kategori</p>
          ) : (
            <div className="space-y-3.5 pt-2">
              {categoryEntries.slice(0, 5).map(([catName, count], idx) => {
                const percentage = Math.round((count / quotes.length) * 100);
                const color = CHART_COLORS[idx % CHART_COLORS.length];

                return (
                  <div key={catName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{backgroundColor: color}} />
                        <span className="font-bold text-slate-900 dark:text-white">{catName}</span>
                      </div>
                      <span className="font-mono text-slate-500 dark:text-slate-400">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Highlight Card */}
      {topQuote && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-200 uppercase tracking-wider">
              <Flame className="w-4 h-4" />
              <span>Kutipan Paling Populer</span>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-white/10 rounded-full border border-white/20">
              {topQuote.likes_count} Suka
            </span>
          </div>

          <blockquote className="text-base sm:text-lg font-medium italic leading-relaxed">
            &quot;{topQuote.content}&quot;
          </blockquote>

          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
            <span className="text-indigo-200 font-mono">
              {topQuote.category?.name ? `Kategori: ${topQuote.category.name}` : ""}
            </span>
            <Link href={`/quotes/${topQuote.id}`} className="text-white font-semibold hover:underline">
              Lihat Rincian →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
