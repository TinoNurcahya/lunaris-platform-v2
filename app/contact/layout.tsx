import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Hubungi Kami',
  description:
    'Ada pertanyaan, saran, atau laporan? Hubungi tim Lunarys dan kami akan segera merespons.',
  alternates: { canonical: 'https://lunarys-platform.vercel.app/contact' },
  openGraph: {
    title: 'Hubungi Kami | Lunarys',
    description:
      'Ada pertanyaan, saran, atau laporan? Hubungi tim Lunarys dan kami akan segera merespons.',
    url: 'https://lunarys-platform.vercel.app/contact',
    type: 'website',
  },
};

export default function ContactLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
