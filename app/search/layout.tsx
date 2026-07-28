import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Cari Kutipan',
  description:
    'Cari kutipan, lirik lagu, dan pengguna di Lunarys. Temukan inspirasi yang kamu butuhkan.',
  alternates: { canonical: 'https://lunarys-platform.vercel.app/search' },
  openGraph: {
    title: 'Cari Kutipan | Lunarys',
    description:
      'Cari kutipan, lirik lagu, dan pengguna di Lunarys. Temukan inspirasi yang kamu butuhkan.',
    url: 'https://lunarys-platform.vercel.app/search',
    type: 'website',
  },
};

export default function SearchLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
