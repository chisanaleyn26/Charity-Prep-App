import React from 'react'
import Link from 'next/link'
import { Logo } from '@/components/common/logo'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Simple header with logo */}
      <header className="p-6">
        <Link href="/" className="inline-block">
          <Logo size="md" />
        </Link>
      </header>

      {/* Centered content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Simple footer */}
      <footer className="p-6 text-center">
        <p className="text-sm text-gray-700">
          © {new Date().getFullYear()} Charity Prep. All rights reserved.
        </p>
      </footer>
    </div>
  )
}