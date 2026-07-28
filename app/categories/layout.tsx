import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Kategori Kutipan',
  description:
    'Jelajahi semua kategori kutipan di Lunarys — dari inspirasi, motivasi, cinta, hingga lirik lagu favorit.',
  alternates: { canonical: 'https://lunarys-platform.vercel.app/categories' },
  openGraph: {
    title: 'Kategori Kutipan | Lunarys',
    description:
      'Jelajahi semua kategori kutipan di Lunarys — dari inspirasi, motivasi, cinta, hingga lirik lagu favorit.',
    url: 'https://lunarys-platform.vercel.app/categories',
    type: 'website',
  },
};

export default function CategoriesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
