import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Kutipan Tersimpan',
  description: 'Koleksi kutipan yang telah kamu simpan di Lunarys.',
  robots: { index: false, follow: false },
};

export default function BookmarksLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
