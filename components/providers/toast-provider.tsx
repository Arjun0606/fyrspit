'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1F2937',
          color: '#F9FAFB',
          border: '1px solid #374151',
        },
        success: {
          iconTheme: {
            primary: '#10B981',
            secondary: '#F9FAFB',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: '#F9FAFB',
          },
        },
      }}
    />
  );
}
