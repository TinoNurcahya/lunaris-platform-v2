'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LegacyAdminDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin');
  }, [router]);

  return <div className="p-8 text-center text-xs text-slate-500">Mengarahkan ke Admin Control Center...</div>;
}
