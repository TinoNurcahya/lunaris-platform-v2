'use client';

import { useState } from 'react';
import Image from 'next/image';
import { UserProfile } from '@/types';
import { updateUserProfile, uploadAvatar } from '@/services/profile';
import { X, User, Sparkles, RefreshCw, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EditProfileModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: (updated: UserProfile) => void;
}

export default function EditProfileModal({
  profile,
  isOpen,
  onClose,
  onProfileUpdated
}: EditProfileModalProps) {
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  if (!isOpen) return null;

  const handleGenerateRandomAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${randomSeed}`;
    setAvatarUrl(newAvatar);
    toast.success('Avatar acak berhasil dibuat!');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const publicUrl = await uploadAvatar(profile.id, file);
      setAvatarUrl(publicUrl);
      toast.success('Foto profil berhasil diunggah!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal mengunggah gambar';
      toast.error(message);
    } finally {
      setUploadingAvatar(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Nama tampilan tidak boleh kosong');
      return;
    }

    setSubmitting(true);
    try {
      await updateUserProfile(profile.id, {
        name: name.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl.trim()
      });

      toast.success('Profil berhasil diperbarui!');
      onProfileUpdated({
        ...profile,
        name: name.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl.trim()
      });
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memperbarui profil';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Profil</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Perbarui informasi diri dan tampilan avatar Anda.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar Preview & Randomizer */}
        <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <Image
            src={avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`}
            alt="Preview Avatar"
            width={80}
            height={80}
            unoptimized
            className="w-20 h-20 rounded-full bg-white dark:bg-slate-900 object-cover ring-4 ring-indigo-500/20 shadow-md"
          />
          <div className="flex flex-wrap items-center justify-center gap-2">
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full transition-all cursor-pointer shadow-xs">
              {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              <span>{uploadingAvatar ? 'Mengunggah...' : 'Unggah Foto'}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileUpload}
                disabled={uploadingAvatar}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={handleGenerateRandomAvatar}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 rounded-full transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Acak Avatar</span>
            </button>
          </div>

        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nama Tampilan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama tampilan..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 transition-all"
              required
            />
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Bio Singkat</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tuliskan sedikit tentang diri Anda..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 transition-all resize-none"
            />
          </div>

          {/* Avatar URL (Custom) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tautan Gambar Avatar (Opsional)</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{submitting ? 'Simpan...' : 'Simpan Perubahan Profil'}</span>
          </button>
        </form>

      </div>
    </div>
  );
}
