import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Papan Peringkat',
  description:
    'Lihat pengguna Lunarys paling aktif dan berprestasi di papan peringkat berdasarkan XP dan kontribusi kutipan.',
  alternates: { canonical: 'https://lunarys-platform.vercel.app/leaderboard' },
  openGraph: {
    title: 'Papan Peringkat | Lunarys',
    description:
      'Lihat pengguna Lunarys paling aktif dan berprestasi di papan peringkat berdasarkan XP dan kontribusi kutipan.',
    url: 'https://lunarys-platform.vercel.app/leaderboard',
    type: 'website',
  },
};

export default function LeaderboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
