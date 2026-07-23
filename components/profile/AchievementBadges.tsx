'use client';

import { UserProfile } from '@/types';
import { Award, Feather, ShieldCheck, Sparkles, Star, Zap } from 'lucide-react';

interface AchievementBadgesProps {
  profile: UserProfile;
}

export default function AchievementBadges({ profile }: AchievementBadgesProps) {
  const quotesCount = profile.quotes_count || 0;
  const xp = profile.xp || 0;
  const level = profile.level || 1;

  const badges = [
    {
      id: 'beginner',
      title: 'Pemula Inspirasi',
      description: 'Memulai perjalanan berbagi kata di Lunarys',
      icon: Sparkles,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 border-indigo-200 dark:border-indigo-800',
      unlocked: true
    },
    {
      id: 'writer',
      title: 'Pena Emas',
      description: 'Memiliki 3 atau lebih kutipan terpublikasi',
      icon: Feather,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800',
      unlocked: quotesCount >= 3
    },
    {
      id: 'star',
      title: 'Bintang Komunitas',
      description: 'Mencapai 50+ XP dari aktivitas kutipan',
      icon: Star,
      color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/80 border-yellow-200 dark:border-yellow-800',
      unlocked: xp >= 50
    },
    {
      id: 'master',
      title: 'Master Kata',
      description: 'Mencapai Level 3 atau lebih tinggi',
      icon: Zap,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/80 border-purple-200 dark:border-purple-800',
      unlocked: level >= 3
    },
    {
      id: 'admin',
      title: 'Moderator Utama',
      description: 'Tim pengelola dan penjaga kualitas platform',
      icon: ShieldCheck,
      color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800',
      unlocked: profile.role === 'admin'
    }
  ];

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Lencana Pencapaian</h3>
        </div>
        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-800 px-3 py-1 rounded-full">
          {unlockedCount} / {badges.length} Terbuka
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {badges.map((badge) => {
          const Icon = badge.icon;
          return (
            <div
              key={badge.id}
              className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                badge.unlocked
                  ? `${badge.color} shadow-sm`
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-50 grayscale'
              }`}
            >
              <div className={`p-2 rounded-lg ${badge.unlocked ? 'bg-white dark:bg-slate-900 shadow-xs' : 'bg-slate-200 dark:bg-slate-800'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{badge.title}</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight mt-0.5 line-clamp-2">
                  {badge.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
