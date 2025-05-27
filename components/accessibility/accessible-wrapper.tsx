'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import { FocusManager, KeyboardNavigation, announcer } from '@/lib/accessibility/utils'

interface AccessibleWrapperProps {
  children: React.ReactNode
  
  // Focus management
  autoFocus?: boolean
  restoreFocus?: boolean
  trapFocus?: boolean
  
  // Keyboard navigation
  enableRovingTabindex?: boolean
  keyboardShortcuts?: Record<string, () => void>
  
  // ARIA attributes
  role?: string
  ariaLabel?: string
  ariaLabelledBy?: string
  ariaDescribedBy?: string
  ariaLive?: 'polite' | 'assertive' | 'off'
  ariaAtomic?: boolean
  
  // Announcements
  announceOnMount?: string
  announceOnUnmount?: string
  
  // Skip link
  skipLink?: {
    href: string
    text: string
  }
  
  // Class names
  className?: string
}

export function AccessibleWrapper({
  children,
  autoFocus,
  restoreFocus,
  trapFocus,
  enableRovingTabindex,
  keyboardShortcuts,
  role,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  ariaLive,
  ariaAtomic,
  announceOnMount,
  announceOnUnmount,
  skipLink,
  className,
}: AccessibleWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cleanupFocusTrap = useRef<(() => void) | null>(null)

  // Handle focus management
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    if (autoFocus) {
      const firstFocusable = container.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement
      
      if (firstFocusable) {
        firstFocusable.focus()
      }
    }

    if (trapFocus) {
      const returnFocus = document.activeElement as HTMLElement
      cleanupFocusTrap.current = KeyboardNavigation.trapFocus(
        container,
        restoreFocus ? returnFocus : undefined
      )
    } else if (restoreFocus) {
      FocusManager.saveFocus()
    }

    if (enableRovingTabindex) {
      KeyboardNavigation.setupRovingTabindex(container)
    }

    return () => {
      if (cleanupFocusTrap.current) {
        cleanupFocusTrap.current()
      } else if (restoreFocus) {
        FocusManager.restoreFocus()
      }
    }
  }, [autoFocus, restoreFocus, trapFocus, enableRovingTabindex])

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!keyboardShortcuts) return

    const handleKeyDown = (event: KeyboardEvent) => {
      const shortcut = keyboardShortcuts[event.key]
      if (shortcut) {
        event.preventDefault()
        shortcut()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [keyboardShortcuts])

  // Handle announcements
  useEffect(() => {
    if (announceOnMount) {
      announcer.announce(announceOnMount)
    }

    return () => {
      if (announceOnUnmount) {
        announcer.announce(announceOnUnmount)
      }
    }
  }, [announceOnMount, announceOnUnmount])

  // Build ARIA attributes
  const ariaAttributes: Record<string, any> = {}
  
  if (role) ariaAttributes.role = role
  if (ariaLabel) ariaAttributes['aria-label'] = ariaLabel
  if (ariaLabelledBy) ariaAttributes['aria-labelledby'] = ariaLabelledBy
  if (ariaDescribedBy) ariaAttributes['aria-describedby'] = ariaDescribedBy
  if (ariaLive) ariaAttributes['aria-live'] = ariaLive
  if (ariaAtomic !== undefined) ariaAttributes['aria-atomic'] = ariaAtomic

  return (
    <>
      {/* Skip link */}
      {skipLink && (
        <a
          href={skipLink.href}
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-inchworm focus:text-gunmetal focus:rounded"
        >
          {skipLink.text}
        </a>
      )}
      
      <div
        ref={containerRef}
        className={className}
        {...ariaAttributes}
      >
        {children}
      </div>
    </>
  )
}

// Higher-order component for accessibility
export function withAccessibility<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  accessibilityProps?: Partial<AccessibleWrapperProps>
) {
  return function AccessibleComponent(props: T) {
    return (
      <AccessibleWrapper {...accessibilityProps}>
        <Component {...props} />
      </AccessibleWrapper>
    )
  }
}

// Accessible button component
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingText?: string
  variant?: 'primary' | 'secondary' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  announce?: boolean
}

export function AccessibleButton({
  children,
  loading,
  loadingText = 'Loading...',
  disabled,
  onClick,
  announce = true,
  className = '',
  ...props
}: AccessibleButtonProps) {
  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (announce) {
      const buttonText = typeof children === 'string' ? children : 'Button activated'
      announcer.announce(`${buttonText} ${loading ? 'loading' : 'activated'}`)
    }
    
    if (onClick && !loading && !disabled) {
      onClick(event)
    }
  }, [onClick, loading, disabled, children, announce])

  return (
    <button
      {...props}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      aria-label={loading ? loadingText : props['aria-label']}
      className={`
        inline-flex items-center justify-center rounded-md text-sm font-medium
        transition-colors focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 
        disabled:pointer-events-none ${className}
      `}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {loading ? loadingText : children}
    </button>
  )
}

// Accessible form field wrapper
interface AccessibleFieldProps {
  children: React.ReactNode
  label: string
  error?: string
  hint?: string
  required?: boolean
  id: string
}

export function AccessibleField({
  children,
  label,
  error,
  hint,
  required,
  id,
}: AccessibleFieldProps) {
  const labelId = `${id}-label`
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  
  const describedBy = [hintId, errorId].filter(Boolean).join(' ')

  return (
    <div className="space-y-2">
      <label
        id={labelId}
        htmlFor={id}
        className="block text-sm font-medium text-gunmetal"
      >
        {label}
        {required && (
          <span className="ml-1 text-red-500" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="sr-only">required</span>}
      </label>
      
      {hint && (
        <div id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </div>
      )}
      
      <div className="relative">
        {React.cloneElement(children as React.ReactElement, {
          id,
          'aria-labelledby': labelId,
          'aria-describedby': describedBy || undefined,
          'aria-invalid': error ? 'true' : undefined,
          'aria-required': required,
        })}
      </div>
      
      {error && (
        <div
          id={errorId}
          role="alert"
          className="text-sm text-red-600"
          aria-live="polite"
        >
          {error}
        </div>
      )}
    </div>
  )
}

// Accessible modal/dialog wrapper
interface AccessibleModalProps {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function AccessibleModal({
  children,
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
}: AccessibleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`
  const descId = description ? `modal-desc-${Math.random().toString(36).substr(2, 9)}` : undefined

  useEffect(() => {
    if (!isOpen) return

    const modal = modalRef.current
    if (!modal) return

    // Save focus and trap it in modal
    FocusManager.saveFocus()
    const cleanup = KeyboardNavigation.trapFocus(modal)

    // Handle escape key
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    
    // Announce modal opening
    announcer.announce(`Dialog opened: ${title}`)

    return () => {
      cleanup?.()
      document.removeEventListener('keydown', handleEscape)
      FocusManager.restoreFocus()
      announcer.announce('Dialog closed')
    }
  }, [isOpen, title, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <div
        ref={modalRef}
        className={`w-full ${sizeClasses[size]} bg-white rounded-lg shadow-xl`}
      >
        <div className="p-6">
          <h2 id={titleId} className="text-xl font-semibold text-gunmetal mb-2">
            {title}
          </h2>
          
          {description && (
            <p id={descId} className="text-muted-foreground mb-4">
              {description}
            </p>
          )}
          
          {children}
        </div>
      </div>
    </div>
  )
}

// Export all components
export {
  AccessibleWrapper,
  withAccessibility,
  AccessibleButton,
  AccessibleField,
  AccessibleModal,
}