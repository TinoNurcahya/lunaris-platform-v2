import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Pengaturan Akun',
  description: 'Kelola pengaturan akun Lunarys kamu.',
  robots: { index: false, follow: false },
};

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
