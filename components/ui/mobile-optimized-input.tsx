'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'

export interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  showPasswordToggle?: boolean
  touchOptimized?: boolean
}

const MobileOptimizedInput = forwardRef<HTMLInputElement, MobileInputProps>(
  ({ 
    className, 
    type, 
    label, 
    error, 
    hint, 
    leftIcon, 
    rightIcon, 
    showPasswordToggle,
    touchOptimized = true,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)

    const inputType = type === 'password' && showPassword ? 'text' : type

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="text-gray-400 text-sm">{leftIcon}</div>
            </div>
          )}
          
          <input
            type={inputType}
            className={cn(
              // Base styles
              "w-full rounded-lg border border-gray-300 bg-white shadow-sm transition-all duration-200",
              
              // Touch optimizations
              touchOptimized && [
                "min-h-[44px] text-base", // Minimum touch target size and prevent zoom on iOS
                "touch-manipulation", // Optimize touch interactions
              ],
              
              // Padding adjustments for icons
              leftIcon ? "pl-10" : "pl-4",
              (rightIcon || showPasswordToggle) ? "pr-10" : "pr-4",
              "py-3",
              
              // Focus states
              isFocused && "border-blue-500 ring-2 ring-blue-200",
              
              // Error states
              error && "border-red-500 focus:border-red-500 focus:ring-red-200",
              
              // Disabled state
              props.disabled && "bg-gray-50 text-gray-500 cursor-not-allowed",
              
              className
            )}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            ref={ref}
            {...props}
          />
          
          {(rightIcon || showPasswordToggle) && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {showPasswordToggle ? (
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600 focus:outline-none min-w-[44px] min-h-[44px] flex items-center justify-center"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              ) : (
                <div className="text-gray-400 text-sm">{rightIcon}</div>
              )}
            </div>
          )}
        </div>
        
        {hint && !error && (
          <p className="mt-1 text-xs text-gray-500">{hint}</p>
        )}
        
        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

MobileOptimizedInput.displayName = "MobileOptimizedInput"

export { MobileOptimizedInput }

// Mobile-optimized textarea
export interface MobileTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  touchOptimized?: boolean
  autoResize?: boolean
}

export const MobileOptimizedTextarea = forwardRef<HTMLTextAreaElement, MobileTextareaProps>(
  ({ 
    className, 
    label, 
    error, 
    hint, 
    touchOptimized = true,
    autoResize = false,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)

    React.useImperativeHandle(ref, () => textareaRef.current!)

    React.useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current
        textarea.style.height = 'auto'
        textarea.style.height = textarea.scrollHeight + 'px'
      }
    }, [props.value, autoResize])

    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        const textarea = e.currentTarget
        textarea.style.height = 'auto'
        textarea.style.height = textarea.scrollHeight + 'px'
      }
      
      if (props.onInput) {
        props.onInput(e)
      }
    }

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <textarea
          className={cn(
            // Base styles
            "w-full rounded-lg border border-gray-300 bg-white shadow-sm transition-all duration-200 resize-y",
            
            // Touch optimizations
            touchOptimized && [
              "min-h-[88px] text-base", // Minimum height and prevent zoom on iOS
              "touch-manipulation",
            ],
            
            // Padding
            "px-4 py-3",
            
            // Focus states
            isFocused && "border-blue-500 ring-2 ring-blue-200",
            
            // Error states
            error && "border-red-500 focus:border-red-500 focus:ring-red-200",
            
            // Disabled state
            props.disabled && "bg-gray-50 text-gray-500 cursor-not-allowed",
            
            // Auto-resize
            autoResize && "resize-none overflow-hidden",
            
            className
          )}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          onInput={handleInput}
          ref={textareaRef}
          {...props}
        />
        
        {hint && !error && (
          <p className="mt-1 text-xs text-gray-500">{hint}</p>
        )}
        
        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

MobileOptimizedTextarea.displayName = "MobileOptimizedTextarea"

// Mobile-optimized select
export interface MobileSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  touchOptimized?: boolean
  options: Array<{ value: string; label: string; disabled?: boolean }>
  placeholder?: string
}

export const MobileOptimizedSelect = forwardRef<HTMLSelectElement, MobileSelectProps>(
  ({ 
    className, 
    label, 
    error, 
    hint, 
    touchOptimized = true,
    options,
    placeholder,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <select
            className={cn(
              // Base styles
              "w-full rounded-lg border border-gray-300 bg-white shadow-sm transition-all duration-200 appearance-none cursor-pointer",
              
              // Touch optimizations
              touchOptimized && [
                "min-h-[44px] text-base", // Minimum touch target size and prevent zoom on iOS
                "touch-manipulation",
              ],
              
              // Padding
              "px-4 py-3 pr-10",
              
              // Focus states
              isFocused && "border-blue-500 ring-2 ring-blue-200",
              
              // Error states
              error && "border-red-500 focus:border-red-500 focus:ring-red-200",
              
              // Disabled state
              props.disabled && "bg-gray-50 text-gray-500 cursor-not-allowed",
              
              className
            )}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            ref={ref}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg 
              className="w-5 h-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 9l-7 7-7-7" 
              />
            </svg>
          </div>
        </div>
        
        {hint && !error && (
          <p className="mt-1 text-xs text-gray-500">{hint}</p>
        )}
        
        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

MobileOptimizedSelect.displayName = "MobileOptimizedSelect"