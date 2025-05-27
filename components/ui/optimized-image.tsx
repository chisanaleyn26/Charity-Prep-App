'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
  quality?: number
}

// Generate a simple blur data URL for placeholder
function generateBlurDataURL(width: number = 40, height: number = 40): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='
  }
  
  // Create a simple gradient blur effect
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#f3f4f6')
  gradient.addColorStop(1, '#e5e7eb')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  
  return canvas.toDataURL('image/jpeg', 0.1)
}

// Simple server-side blur data URL (fallback)
const defaultBlurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  sizes,
  quality = 90,
  ...props
}: OptimizedImageProps) {
  const blurDataURL = typeof window !== 'undefined' && width && height 
    ? generateBlurDataURL(Math.min(width, 40), Math.min(height, 40))
    : defaultBlurDataURL

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      className={cn('object-cover transition-opacity duration-300', className)}
      loading={priority ? 'eager' : 'lazy'}
      priority={priority}
      placeholder="blur"
      blurDataURL={blurDataURL}
      sizes={sizes}
      quality={quality}
      {...props}
    />
  )
}

// Specialized components for common use cases
export function OptimizedAvatar({
  src,
  alt,
  size = 40,
  className,
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height'> & { size?: number }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn('rounded-full', className)}
      sizes={`${size}px`}
      {...props}
    />
  )
}

export function OptimizedLogo({
  src,
  alt,
  width = 120,
  height = 40,
  className,
  priority = true,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn('object-contain', className)}
      priority={priority}
      quality={95}
      {...props}
    />
  )
}

export function OptimizedHeroImage({
  src,
  alt,
  className,
  priority = true,
  ...props
}: Omit<OptimizedImageProps, 'fill'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      className={cn('object-cover', className)}
      priority={priority}
      sizes="100vw"
      quality={85}
      {...props}
    />
  )
}