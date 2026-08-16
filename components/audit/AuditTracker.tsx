'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function AuditTracker() {
  const pathname = usePathname();
  const lastLoggedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname === lastLoggedPath.current) return;
    lastLoggedPath.current = pathname;

    // Send async page access audit log without blocking main thread
    try {
      fetch('/api/audit-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: pathname.startsWith('/admin') ? 'ADMIN_PAGE_ACCESS' : 'PAGE_ACCESS',
          path: pathname,
          method: 'GET',
          details: {
            referrer: typeof document !== 'undefined' ? document.referrer : '',
            screen: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
          },
        }),
      }).catch(() => {
        // Silent catch for dev/unmigrated table
      });
    } catch {
      // Ignore background tracking failure
    }
  }, [pathname]);

  return null;
}
