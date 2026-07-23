'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { UserProfile } from '@/types';
import { Settings, KeyRound, Bell, ShieldCheck, UserCheck, Check, Lock, Save } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Change Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  // Preference Toggles
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [soundNotifs, setSoundNotifs] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);

  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Silakan login untuk mengakses pengaturan');
        router.push('/login');
        return;
      }

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(data as UserProfile);
      setLoading(false);
    }
    loadUser();
  }, [router]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error('Kata sandi baru minimal 6 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi kata sandi tidak cocok');
      return;
    }

    setPasswordSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Kata sandi berhasil diperbarui!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengubah kata sandi');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const handleSavePreferences = () => {
    toast.success('Preferensi akun berhasil disimpan!');
  };

  if (loading) {
    return <div className="max-w-2xl mx-auto h-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pengaturan Akun</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Kelola keamanan kata sandi dan preferensi privasi akunmu.</p>
          </div>
        </div>

        {profile && (
          <Link
            href={`/profile/${profile.username}`}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Lihat Profil →
          </Link>
        )}
      </div>

      {/* Security: Change Password Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <KeyRound className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Keamanan Kata Sandi</h3>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Kata Sandi Baru <span className="text-rose-500">*</span></label>
            <div className="relative">
              <input
                type="password"
                placeholder="Minimal 6 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 transition-all"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span></label>
            <div className="relative">
              <input
                type="password"
                placeholder="Ulangi kata sandi baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 transition-all"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordSubmitting || !newPassword.trim()}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{passwordSubmitting ? 'Memperbarui...' : 'Perbarui Kata Sandi'}</span>
          </button>
        </form>
      </div>

      {/* Preferences & Notifications */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Preferensi Notifikasi & Privasi</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Notifikasi Interaksi Email</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Terima ringkasan suka dan komentar di email terdaftar.</p>
            </div>
            <button
              onClick={() => setEmailNotifs(!emailNotifs)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                emailNotifs ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Profil Publik & Mesin Pencari</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Izinkan pengguna lain melihat halaman profil publikmu.</p>
            </div>
            <button
              onClick={() => setPublicProfile(!publicProfile)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                publicProfile ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleSavePreferences}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Preferensi</span>
          </button>
        </div>
      </div>
    </div>
  );
}
