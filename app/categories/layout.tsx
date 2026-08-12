import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Kategori Kutipan, Quotes & Kata Kata Bijak',
  description:
    'Jelajahi kumpulan kutipan inspiratif, quotes cinta, kata kata bijak motivasi, hingga lirik lagu favorit di Lunarys.',
  alternates: { canonical: 'https://lunarys-platform.vercel.app/categories' },
  openGraph: {
    title: 'Kategori Kutipan, Quotes & Kata Kata Bijak | Lunarys',
    description:
      'Jelajahi kumpulan kutipan inspiratif, quotes cinta, kata kata bijak motivasi, hingga lirik lagu favorit di Lunarys.',
    url: 'https://lunarys-platform.vercel.app/categories',
    type: 'website',
  },
};


export default function CategoriesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
