'use client'

import React from 'react'
import Link from 'next/link'
import { Logo } from '@/components/common/logo'
import { EtherealButton } from '@/components/custom-ui/ethereal-button'
import { cn } from '@/lib/utils'

interface SiteHeaderProps {
  className?: string
  variant?: 'marketing' | 'app'
}

export function SiteHeader({ className, variant = 'marketing' }: SiteHeaderProps) {
  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#pricing', label: 'Pricing' },
  ]

  return (
    <header className={cn(
      'sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60',
      className
    )}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo size="sm" />
          </Link>

          {variant === 'marketing' && (
            <>
              <nav className="hidden md:flex items-center gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium text-gunmetal hover:text-ethereal transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-4">
                <EtherealButton variant="ghost" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </EtherealButton>
                <EtherealButton size="sm" asChild>
                  <Link href="/login">Start Free Trial</Link>
                </EtherealButton>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}