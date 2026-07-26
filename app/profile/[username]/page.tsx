'use client';

import { use, useEffect, useState } from 'react';
import { fetchProfileByUsername, toggleFollow } from '@/services/profile';
import { fetchQuotes } from '@/services/quotes';
import QuoteCard from '@/components/quote/QuoteCard';
import EditProfileModal from '@/components/profile/EditProfileModal';
import AchievementBadges from '@/components/profile/AchievementBadges';
import ProfileAnalytics from '@/components/profile/ProfileAnalytics';
import FollowsModal from '@/components/profile/FollowsModal';
import { UserProfile, QuoteItem } from '@/types';
import { Zap, Quote, Calendar, UserPlus, UserCheck, Users, Edit3, Award, BarChart3, Clock, Flame, Music, Filter, Tag } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [followsModalOpen, setFollowsModalOpen] = useState(false);
  const [followsTab, setFollowsTab] = useState<'followers' | 'following'>('followers');
  const [activeTab, setActiveTab] = useState<'quotes' | 'badges' | 'analytics'>('quotes');
  const [quoteFilter, setQuoteFilter] = useState<'all' | 'popular' | 'has_song'>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all');
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

  const openFollowsModal = (tab: 'followers' | 'following') => {
    setFollowsTab(tab);
    setFollowsModalOpen(true);
  };

  if (loading) {
    return <div className="h-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />;
  }

  if (!profile) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Profil Tidak Ditemukan</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pengguna dengan nama @{username} tidak terdaftar.</p>
      </div>
    );
  }

  const isSelf = currentUserId === profile.id;

  // Extract unique categories from user's quotes
  const userCategories = Array.from(
    new Map(
      quotes
        .filter((q) => q.category?.id && q.category?.name)
        .map((q) => [q.category!.id, q.category!])
    ).values()
  );

  // Filter and sort quotes for profile (Pinned quotes first!)
  const filteredQuotes = [...quotes]
    .filter((q) => {
      if (selectedCategoryId !== 'all' && q.category_id !== selectedCategoryId) return false;
      if (quoteFilter === 'has_song') return !!q.song_title;
      return true;
    })
    .sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      if (quoteFilter === 'popular') return (b.likes_count || 0) - (a.likes_count || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Profile Banner / Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={profile.avatar_url?.trim() ? profile.avatar_url : `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`}
            alt={profile.name}
            className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 object-cover ring-4 ring-indigo-500/20 shrink-0"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`;
            }}
          />

          <div className="space-y-3 text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{profile.name}</h2>
                  {profile.role === 'admin' && (
                    <span className="px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 rounded-full border border-amber-200 dark:border-amber-800">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-mono font-medium">@{profile.username}</p>
              </div>

              {isSelf ? (
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-full transition-all cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Edit Profil</span>
                </button>
              ) : (
                <button
                  onClick={handleFollowToggle}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full shadow-sm transition-all cursor-pointer ${
                    isFollowing
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-900'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
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

            {profile.bio ? (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                {profile.bio}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">Belum ada bio singkat.</p>
            )}

            {/* Stats Row */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 pt-2 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <Quote className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{profile.quotes_count || 0} Kutipan</span>
              </div>

              <button
                onClick={() => openFollowsModal('followers')}
                className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              >
                <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{followersCount} Pengikut</span>
              </button>

              <button
                onClick={() => openFollowsModal('following')}
                className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              >
                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{profile.following_count || 0} Mengikuti</span>
              </button>

              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{profile.xp} XP (Lvl {profile.level})</span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>Bergabung {new Date(profile.created_at).toLocaleDateString('id-ID')}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('quotes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'quotes'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Quote className="w-4 h-4" />
          <span>Kutipan ({quotes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('badges')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'badges'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Lencana Pencapaian</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analitik & Insight</span>
        </button>
      </div>

      {/* Active Tab View */}
      {activeTab === 'quotes' && (
        <div className="space-y-4">
          {/* Sub-Filter for Quotes */}
          {quotes.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl">
              
              {/* Category Filter Dropdown */}
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 cursor-pointer"
                >
                  <option value="all">Semua Kategori ({quotes.length})</option>
                  {userCategories.map((c) => {
                    const catCount = quotes.filter((q) => q.category_id === c.id).length;
                    return (
                      <option key={c.id} value={c.id}>
                        {c.name} ({catCount})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Sort / Feature Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto">
                <button
                  onClick={() => setQuoteFilter('all')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    quoteFilter === 'all'
                      ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Terbaru</span>
                </button>

                <button
                  onClick={() => setQuoteFilter('popular')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    quoteFilter === 'popular'
                      ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Terpopuler</span>
                </button>

                <button
                  onClick={() => setQuoteFilter('has_song')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    quoteFilter === 'has_song'
                      ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Music className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Dengan Musik</span>
                </button>
              </div>
            </div>
          )}

          {filteredQuotes.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <p className="text-xs text-slate-500 dark:text-slate-400">Tidak ada kutipan yang sesuai dengan filter ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {filteredQuotes.map((quote) => (
                <QuoteCard key={quote.id} quote={quote} currentUserId={currentUserId} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'badges' && (
        <AchievementBadges profile={profile} />
      )}

      {activeTab === 'analytics' && (
        <ProfileAnalytics profile={profile} quotes={quotes} />
      )}

      {/* Edit Profile Modal */}
      {isSelf && (
        <EditProfileModal
          profile={profile}
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onProfileUpdated={(updatedProfile) => setProfile(updatedProfile)}
        />
      )}

      {/* Follows List Modal */}
      <FollowsModal
        userId={profile.id}
        initialTab={followsTab}
        isOpen={followsModalOpen}
        onClose={() => setFollowsModalOpen(false)}
      />

    </div>
  );
}
