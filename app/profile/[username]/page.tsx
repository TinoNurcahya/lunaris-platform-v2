'use client';

import { use, useEffect, useState } from 'react';
import { fetchProfileByUsername, toggleFollow } from '@/services/profile';
import { fetchQuotes } from '@/services/quotes';
import QuoteCard from '@/components/quote/QuoteCard';
import { UserProfile, QuoteItem } from '@/types';
import { Zap, Quote, Calendar, UserPlus, UserCheck, Users } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      const userProfile = await fetchProfileByUsername(username);
      setProfile(userProfile);

      if (userProfile) {
        setIsFollowing(!!userProfile.is_following);
        setFollowersCount(userProfile.followers_count || 0);

        const userQuotes = await fetchQuotes({ userId: userProfile.id });
        setQuotes(userQuotes);
      }
      setLoading(false);
    }
    loadProfile();
  }, [username]);

  const handleFollowToggle = async () => {
    if (!profile) return;
    try {
      const following = await toggleFollow(profile.id);
      setIsFollowing(following);
      setFollowersCount((prev) => (following ? prev + 1 : Math.max(0, prev - 1)));
      toast.success(following ? `Mengikuti @${profile.username}` : `Berhenti mengikuti @${profile.username}`);
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengubah status mengikuti');
    }
  };

  if (loading) {
    return <div className="h-64 rounded-2xl bg-white border border-slate-200 animate-pulse" />;
  }

  if (!profile) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <h3 className="text-base font-bold text-slate-800">Profil Tidak Ditemukan</h3>
        <p className="text-xs text-slate-500 mt-1">Pengguna dengan nama @{username} tidak terdaftar.</p>
      </div>
    );
  }

  const isSelf = currentUserId === profile.id;

  return (
    <div className="space-y-8 pb-12">
      
      {/* Profile Banner / Header */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={profile.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`}
            alt={profile.name}
            className="w-24 h-24 rounded-full bg-slate-100 object-cover ring-4 ring-indigo-500/20 shrink-0"
          />

          <div className="space-y-3 text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-2xl font-bold text-slate-900">{profile.name}</h2>
                  {profile.role === 'admin' && (
                    <span className="px-2.5 py-0.5 text-xs font-semibold text-amber-700 bg-amber-50 rounded-full border border-amber-200">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-sm text-indigo-600 font-mono font-medium">@{profile.username}</p>
              </div>

              {!isSelf && (
                <button
                  onClick={handleFollowToggle}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full shadow-sm transition-all ${
                    isFollowing
                      ? 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      <span>Mengikuti</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Ikuti</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {profile.bio && (
              <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                {profile.bio}
              </p>
            )}

            {/* Stats Row */}
            <div className="flex items-center justify-center sm:justify-start gap-6 pt-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Quote className="w-4 h-4 text-indigo-600" />
                <span>{profile.quotes_count || 0} Kutipan</span>
              </div>

              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>{followersCount} Pengikut</span>
              </div>

              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{profile.xp} XP (Lvl {profile.level})</span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-500">
                <Calendar className="w-4 h-4" />
                <span>Bergabung {new Date(profile.created_at).toLocaleDateString('id-ID')}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* User Quotes Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Quote className="w-5 h-5 text-indigo-600" />
          <span>Kutipan Oleh {profile.name}</span>
        </h3>

        {quotes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <p className="text-xs text-slate-500">Pengguna ini belum mempublikasikan kutipan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {quotes.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} currentUserId={currentUserId} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
