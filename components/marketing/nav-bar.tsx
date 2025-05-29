'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/common/logo'
import { DynamicNavButton } from '@/components/marketing/dynamic-nav-button'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function NavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navLinks: { href: string; label: string }[] = []

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#E0E0E0] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Logo size="sm" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-12">
            <div className="flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-[#243837] hover:text-[#B1FA63] transition-colors duration-200 tracking-tight"
                  style={{ letterSpacing: '-0.06em' }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <DynamicNavButton variant="ghost" size="sm" type="login" />
              <DynamicNavButton size="sm" type="cta" />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-[#243837] hover:bg-[#F8F8F8] rounded-lg transition-colors duration-200"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
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
        <div className="container mx-auto px-6 py-6 max-w-7xl">
          <div className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-medium text-[#243837] hover:text-[#B1FA63] transition-colors duration-200 py-2 tracking-tight"
                style={{ letterSpacing: '-0.06em' }}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-[#E0E0E0] pt-6 flex flex-col gap-3">
              <DynamicNavButton variant="ghost" className="w-full justify-center" type="login" />
              <DynamicNavButton className="w-full justify-center" type="cta" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}