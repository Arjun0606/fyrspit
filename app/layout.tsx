import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/providers/toast-provider'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'

const inter = Inter({ subsets: ['latin'] })

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
  themeColor: '#0B0B0B',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
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
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}