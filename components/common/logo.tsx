import React from 'react'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  variant?: 'default' | 'white'
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className, variant = 'default', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12'
  }

  // Use explicit color to avoid hydration issues
  const textColor = variant === 'white' ? 'text-white' : 'text-[#243837]'

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Logo Icon - Using a simple charity-themed icon */}
      <svg
        className={cn(sizeClasses[size], 'w-auto')}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="20" cy="20" r="20" fill="#B1FA63" />
        <path
          d="M20 12C20 12 14 16 14 21C14 24.3137 16.6863 27 20 27C23.3137 27 26 24.3137 26 21C26 16 20 12 20 12Z"
          fill="#243837"
        />
        <path
          d="M20 18V24M17 21H23"
          stroke="#B1FA63"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span className={cn(
        'font-semibold tracking-tight',
        textColor,
        size === 'sm' && 'text-lg',
        size === 'md' && 'text-xl',
        size === 'lg' && 'text-2xl'
      )}>
        Charity Prep
      </span>
    </div>
  )
}