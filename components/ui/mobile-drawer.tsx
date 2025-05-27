'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface MobileDrawerProps {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
  title?: string
  position?: 'left' | 'right' | 'bottom'
  size?: 'sm' | 'md' | 'lg' | 'full'
  className?: string
  overlayClassName?: string
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
}

export function MobileDrawer({
  children,
  isOpen,
  onClose,
  title,
  position = 'left',
  size = 'md',
  className,
  overlayClassName,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
}: MobileDrawerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!closeOnEscape) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, closeOnEscape, onClose])

  if (!mounted) return null

  const getDrawerClasses = () => {
    const baseClasses = "fixed bg-white shadow-xl z-50 transition-transform duration-300 ease-in-out"
    
    const positionClasses = {
      left: "top-0 left-0 h-full",
      right: "top-0 right-0 h-full", 
      bottom: "bottom-0 left-0 right-0"
    }
    
    const sizeClasses = {
      left: {
        sm: "w-64",
        md: "w-80", 
        lg: "w-96",
        full: "w-full"
      },
      right: {
        sm: "w-64",
        md: "w-80",
        lg: "w-96", 
        full: "w-full"
      },
      bottom: {
        sm: "h-1/3",
        md: "h-1/2",
        lg: "h-2/3",
        full: "h-full"
      }
    }
    
    const transformClasses = {
      left: isOpen ? "translate-x-0" : "-translate-x-full",
      right: isOpen ? "translate-x-0" : "translate-x-full",
      bottom: isOpen ? "translate-y-0" : "translate-y-full"
    }
    
    return cn(
      baseClasses,
      positionClasses[position],
      sizeClasses[position][size],
      transformClasses[position],
      className
    )
  }

  const drawer = (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
          overlayClassName
        )}
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      
      {/* Drawer */}
      <div className={getDrawerClasses()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {title && (
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          )}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  )

  return createPortal(drawer, document.body)
}

// Hook for managing drawer state
export function useMobileDrawer(defaultOpen = false) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  const toggle = () => setIsOpen(!isOpen)

  return {
    isOpen,
    open,
    close,
    toggle,
  }
}

// Bottom sheet component (specialized drawer for mobile)
interface MobileBottomSheetProps extends Omit<MobileDrawerProps, 'position' | 'size'> {
  snapPoints?: number[]
  initialSnap?: number
  onSnapChange?: (snapIndex: number) => void
}

export function MobileBottomSheet({
  children,
  isOpen,
  onClose,
  title,
  className,
  snapPoints = [0.3, 0.6, 0.9],
  initialSnap = 1,
  onSnapChange,
  ...props
}: MobileBottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(initialSnap)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const handleSnapChange = (snapIndex: number) => {
    setCurrentSnap(snapIndex)
    onSnapChange?.(snapIndex)
  }

  const getCurrentHeight = () => {
    if (isDragging) {
      const baseHeight = snapPoints[currentSnap] * window.innerHeight
      return Math.max(snapPoints[0] * window.innerHeight, baseHeight - dragY)
    }
    return snapPoints[currentSnap] * window.innerHeight
  }

  return (
    <MobileDrawer
      isOpen={isOpen}
      onClose={onClose}
      position="bottom"
      size="full"
      className={cn(
        "rounded-t-2xl",
        className
      )}
      style={{
        height: getCurrentHeight(),
        maxHeight: '90vh'
      }}
      {...props}
    >
      {/* Drag handle */}
      <div className="flex justify-center py-2">
        <div className="w-12 h-1 bg-gray-300 rounded-full" />
      </div>
      
      {title && (
        <div className="px-4 pb-2">
          <h3 className="text-lg font-semibold text-center">{title}</h3>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {children}
      </div>
    </MobileDrawer>
  )
}

// Mobile action sheet component
interface MobileActionSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  actions: Array<{
    label: string
    onClick: () => void
    variant?: 'default' | 'destructive'
    disabled?: boolean
    icon?: React.ReactNode
  }>
  cancelLabel?: string
}

export function MobileActionSheet({
  isOpen,
  onClose,
  title,
  actions,
  cancelLabel = 'Cancel'
}: MobileActionSheetProps) {
  return (
    <MobileBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className="p-0"
      closeOnOverlayClick={true}
    >
      <div className="space-y-1">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => {
              action.onClick()
              onClose()
            }}
            disabled={action.disabled}
            className={cn(
              "w-full flex items-center justify-center gap-3 px-4 py-4 text-left transition-colors min-h-[56px]",
              "hover:bg-gray-50 active:bg-gray-100",
              action.variant === 'destructive' 
                ? "text-red-600 hover:bg-red-50" 
                : "text-gray-900",
              action.disabled && "text-gray-400 cursor-not-allowed"
            )}
          >
            {action.icon && <span className="text-xl">{action.icon}</span>}
            <span className="font-medium">{action.label}</span>
          </button>
        ))}
        
        <div className="h-2 bg-gray-100" />
        
        <button
          onClick={onClose}
          className="w-full px-4 py-4 text-center font-medium text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-[56px]"
        >
          {cancelLabel}
        </button>
      </div>
    </MobileBottomSheet>
  )
}

// Mobile-optimized button component
interface MobileTouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  fullWidth?: boolean
  touchOptimized?: boolean
}

export function MobileTouchButton({
  children,
  size = 'md',
  variant = 'primary',
  fullWidth = false,
  touchOptimized = true,
  className,
  ...props
}: MobileTouchButtonProps) {
  const baseClasses = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
  
  const sizeClasses = {
    sm: touchOptimized ? "min-h-[40px] px-3 text-sm" : "h-8 px-3 text-sm",
    md: touchOptimized ? "min-h-[44px] px-4 text-base" : "h-10 px-4 text-sm", 
    lg: touchOptimized ? "min-h-[48px] px-6 text-lg" : "h-12 px-6 text-base"
  }
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
  }
  
  return (
    <button
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && "w-full",
        touchOptimized && "touch-manipulation",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}