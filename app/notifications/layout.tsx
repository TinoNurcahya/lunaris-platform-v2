import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Notifikasi',
  description: 'Lihat aktivitas dan notifikasi terbaru dari komunitas Lunarys.',
  robots: { index: false, follow: false },
};

export default function NotificationsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
