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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}