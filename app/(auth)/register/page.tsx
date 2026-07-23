'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Sparkles, UserPlus, Lock, Mail, User, AtSign } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            username: username.toLowerCase().trim(),
            avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`
          }
        }
      });

      if (error) throw error;

      toast.success('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi atau langsung login.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.message || 'Gagal mendaftar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto shadow-md shadow-indigo-600/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Buat Akun Baru</h2>
          <p className="text-xs text-slate-500">Bergabunglah dengan komunitas penulis Lunarys.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Nama Lengkap</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Nama Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Username</label>
            <div className="relative">
              <AtSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Alamat Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Kata Sandi</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all"
                minLength={6}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Mendaftarkan...' : 'Daftar Akun Baru'}</span>
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
            Masuk Sekarang
          </Link>
        </p>

      </div>
    </div>
  );
}
