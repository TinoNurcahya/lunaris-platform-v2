'use client';

import { useEffect, useState } from 'react';
import { fetchLeaderboard } from '@/services/profile';
import { UserProfile } from '@/types';
import { Trophy, Award, Crown, Zap } from 'lucide-react';
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

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      
      {/* Header */}
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

      {/* Leaderboard Table / Cards */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : leaders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <p className="text-xs text-slate-500">Belum ada data peringkat pengguna saat ini.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {leaders.map((user, idx) => {
            const rank = idx + 1;
            const isTop1 = rank === 1;
            const isTop2 = rank === 2;
            const isTop3 = rank === 3;

            return (
              <Link
                key={user.id}
                href={`/profile/${user.username}`}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                  isTop1
                    ? 'bg-amber-50/80 border-amber-200 shadow-sm'
                    : isTop2
                    ? 'bg-slate-50 border-slate-200'
                    : isTop3
                    ? 'bg-orange-50/60 border-orange-200'
                    : 'bg-white border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Rank Badge */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs">
                    {isTop1 ? (
                      <Crown className="w-5 h-5 text-amber-500 fill-amber-500" />
                    ) : isTop2 ? (
                      <Award className="w-5 h-5 text-slate-500" />
                    ) : isTop3 ? (
                      <Award className="w-5 h-5 text-orange-500" />
                    ) : (
                      <span className="text-slate-400 font-mono">#{rank}</span>
                    )}
                  </div>

                  {/* User Info */}
                  <img
                    src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                    alt={user.name}
                    className="w-9 h-9 rounded-full bg-slate-200 object-cover ring-2 ring-indigo-500/20 shrink-0"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                      {user.role === 'admin' && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold text-amber-700 bg-amber-100 rounded-full border border-amber-200">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-mono truncate">@{user.username}</p>
                  </div>
                </div>

                {/* Level & XP */}
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 justify-end text-xs font-bold text-indigo-600 font-mono">
                    <Zap className="w-3.5 h-3.5 fill-indigo-600" />
                    <span>{user.xp} XP</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono font-medium">Level {user.level}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

    </div>
  );
}
