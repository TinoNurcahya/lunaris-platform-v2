'use client';

import { Toaster } from 'sonner';

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      theme="light"
      richColors
      closeButton
    />
  );
}
