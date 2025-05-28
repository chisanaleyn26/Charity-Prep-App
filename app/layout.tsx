import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Charity Prep - Annual Return Stress? Sorted in minutes.',
  description: 'AI-powered compliance management for UK charities. Track DBS records, manage overseas activities, and generate annual returns effortlessly.',
  keywords: 'charity compliance, annual return, DBS records, UK charity, compliance management',
  authors: [{ name: 'Charity Prep' }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: [{
    media: '(prefers-color-scheme: light)',
    color: '#ffffff'
  }, {
    media: '(prefers-color-scheme: dark)', 
    color: '#000000'
  }],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Charity Prep'
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'Charity Prep - Annual Return Stress? Sorted in minutes.',
    description: 'AI-powered compliance management for UK charities.',
    url: 'https://charityprep.co.uk',
    siteName: 'Charity Prep',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Charity Prep - Annual Return Stress? Sorted in minutes.',
    description: 'AI-powered compliance management for UK charities.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className="font-sans antialiased touch-manipulation">
        {children}
      </body>
    </html>
  )
}