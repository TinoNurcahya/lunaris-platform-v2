'use client';

import { useEffect, useState } from 'react';
import { fetchLeaderboard } from '@/services/profile';
import { UserProfile } from '@/types';
import { Trophy, Award, Crown, Zap, TrendingUp, BarChart2 } from 'lucide-react';
import Link from 'next/link';

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard().then((data) => {
      setLeaders(data);
      setLoading(false);
    });
  }, []);

  const maxXp = leaders.length > 0 ? Math.max(...leaders.map((u) => u.xp || 0), 1) : 1;

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 p-6 sm:p-8 shadow-md text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Leaderboard Pengguna</h2>
            <p className="text-xs text-amber-100 mt-0.5">
              Papan peringkat XP teratas dari para penulis & kontributor aktif Lunarys.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Chart: Perbandingan XP Top Kontributor */}
      {!loading && leaders.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Visualisasi XP Top 5 Kontributor</h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 font-mono">Real-time Leaderboard</span>
          </div>

          <div className="space-y-3 pt-2">
            {leaders.slice(0, 5).map((user, index) => {
              const percentage = Math.round(((user.xp || 0) / maxXp) * 100);
              return (
                <div key={user.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-slate-900 dark:text-white">
                      #{index + 1} {user.name} (@{user.username})
                    </span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                      {user.xp} XP
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 6)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Leaderboard Table List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {leaders.map((user, index) => {
            const isTop3 = index < 3;
            const rank = index + 1;

            return (
              <div
                key={user.id}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-200 shadow-xs ${
                  rank === 1
                    ? 'bg-gradient-to-r from-amber-500/10 via-white to-amber-500/5 dark:from-amber-950/40 dark:via-slate-900 dark:to-amber-950/20 border-amber-300 dark:border-amber-700/60 ring-1 ring-amber-400/30'
                    : rank === 2
                    ? 'bg-gradient-to-r from-slate-200/40 via-white to-slate-100/30 dark:from-slate-800/60 dark:via-slate-900 dark:to-slate-800/40 border-slate-300 dark:border-slate-700'
                    : rank === 3
                    ? 'bg-gradient-to-r from-amber-800/10 via-white to-amber-800/5 dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900 border-amber-800/30 dark:border-amber-900/60'
                    : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Rank Badge */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                    {rank === 1 ? (
                      <Crown className="w-6 h-6 text-amber-500 fill-amber-400" />
                    ) : rank === 2 ? (
                      <Award className="w-6 h-6 text-slate-400" />
                    ) : rank === 3 ? (
                      <Award className="w-6 h-6 text-amber-700" />
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 font-mono">#{rank}</span>
                    )}
                  </div>

                  {/* Profile Info */}
                  <Link href={`/profile/${user.username}`} className="flex items-center gap-3 min-w-0 group">
                    <img
                      src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                      alt={user.name}
                      className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 object-cover ring-2 ring-indigo-500/20 group-hover:ring-indigo-500 transition-all shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {user.name}
                      </h4>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono">@{user.username}</p>
                    </div>
                  </Link>
                </div>

                {/* XP & Level Badge */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1 justify-end">
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{user.xp} XP</span>
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Level {user.level}</p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
