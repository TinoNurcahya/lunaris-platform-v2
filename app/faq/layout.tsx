import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'FAQ — Pertanyaan yang Sering Diajukan',
  description:
    'Temukan jawaban atas pertanyaan umum tentang Lunarys — cara bergabung, membuat kutipan, dan fitur-fitur platform.',
  alternates: { canonical: 'https://lunarys-platform.vercel.app/faq' },
  openGraph: {
    title: 'FAQ | Lunarys',
    description:
      'Temukan jawaban atas pertanyaan umum tentang Lunarys — cara bergabung, membuat kutipan, dan fitur-fitur platform.',
    url: 'https://lunarys-platform.vercel.app/faq',
    type: 'website',
  },
};

export default function FaqLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
