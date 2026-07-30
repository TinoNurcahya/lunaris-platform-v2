'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { UserProfile } from '@/types';
import { fetchFollowers, fetchFollowing } from '@/services/profile';
import { X, Users } from 'lucide-react';
import Link from 'next/link';

interface FollowsModalProps {
  userId: string;
  initialTab?: 'followers' | 'following';
  isOpen: boolean;
  onClose: () => void;
}

export default function FollowsModal({ userId, initialTab = 'followers', isOpen, onClose }: FollowsModalProps) {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  if (initialTab !== prevInitialTab) {
    setPrevInitialTab(initialTab);
    setActiveTab(initialTab);
  }

  useEffect(() => {
    if (!isOpen) return;

    async function loadData() {
      setLoading(true);
      const [followersData, followingData] = await Promise.all([
        fetchFollowers(userId),
        fetchFollowing(userId)
      ]);
      setFollowers(followersData);
      setFollowing(followingData);
      setLoading(false);
    }
    loadData();
  }, [userId, isOpen]);

  if (!isOpen) return null;

  const currentList = activeTab === 'followers' ? followers : following;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden cursor-default animate-in fade-in zoom-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Jaringan Pengguna</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Header */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('followers')}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'followers'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/50'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pengikut ({followers.length})
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'following'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/50'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Mengikuti ({following.length})
          </button>
        </div>

        {/* List Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : currentList.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              {activeTab === 'followers' ? 'Belum ada pengikut.' : 'Belum mengikuti siapa pun.'}
            </div>
          ) : (
            currentList.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.username}`}
                onClick={onClose}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Image
                    src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                    alt={user.name}
                    width={40}
                    height={40}
                    unoptimized
                    className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 object-cover shrink-0 ring-2 ring-indigo-500/10 group-hover:ring-indigo-500/30"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">@{user.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-800 shrink-0">
                  <span>Lihat Profil</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
