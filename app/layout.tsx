import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/providers/toast-provider'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'Fyrspit - The Social Diary for Flying',
  description: 'Log flights. Tell your story. Discover the culture of flying.',
  keywords: ['flights', 'aviation', 'travel', 'social', 'diary'],
  authors: [{ name: 'Fyrspit' }],
  openGraph: {
    title: 'Fyrspit - The Social Diary for Flying',
    description: 'Log flights. Tell your story. Discover the culture of flying.',
    url: 'https://fyrspit.com',
    siteName: 'Fyrspit',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fyrspit - The Social Diary for Flying',
    description: 'Log flights. Tell your story. Discover the culture of flying.',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Fyrspit" />
      </head>
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen`}>
        {children}
        <ToastProvider />
        <PWAInstallPrompt />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (!('serviceWorker' in navigator)) return;
                // In development or on localhost, ensure no SW is controlling the page
                var isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
                if (isLocal) {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    registrations.forEach(function(reg) { reg.unregister(); });
                  });
                  if ('caches' in window) {
                    caches.keys().then(function(keys) { keys.forEach(function(k){ caches.delete(k); }); });
                  }
                  return; // Do not register SW in dev
                }
                // In production, register the SW
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .catch(function(err){ console.log('SW registration failed:', err); });
                });
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}