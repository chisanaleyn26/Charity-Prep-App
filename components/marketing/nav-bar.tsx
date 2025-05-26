'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/common/logo'
import { EtherealButton } from '@/components/custom-ui/ethereal-button'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function NavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#about', label: 'About' },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#E0E0E0] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Logo size="sm" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-[#243837] hover:text-[#B1FA63] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <EtherealButton variant="ghost" size="sm" asChild>
                <Link href="/login">Login</Link>
              </EtherealButton>
              <EtherealButton size="sm" asChild>
                <Link href="/login">Start Free Trial</Link>
              </EtherealButton>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-[#243837] hover:bg-[#F5F5F5] rounded-md transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          'md:hidden border-t border-[#E0E0E0] bg-white transition-all duration-300',
          isMobileMenuOpen ? 'max-h-96' : 'max-h-0 overflow-hidden'
        )}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-medium text-[#243837] hover:text-[#B1FA63] transition-colors py-2"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-[#E0E0E0] pt-4 flex flex-col gap-2">
              <EtherealButton variant="ghost" className="w-full" asChild>
                <Link href="/login">Login</Link>
              </EtherealButton>
              <EtherealButton className="w-full" asChild>
                <Link href="/login">Start Free Trial</Link>
              </EtherealButton>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}