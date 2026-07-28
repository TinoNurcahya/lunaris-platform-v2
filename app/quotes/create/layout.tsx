import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Buat Kutipan Baru',
  description: 'Bagikan kutipan inspiratif, lirik lagu, atau kata-kata favoritmu di komunitas Lunarys.',
  robots: { index: false, follow: false },
};

export default function CreateQuoteLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
