'use client'

import React, { useRef, useState, useEffect, useCallback, KeyboardEvent, ClipboardEvent, ChangeEvent } from 'react'
import { cn } from '@/lib/utils'

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  error?: boolean
  autoFocus?: boolean
  className?: string
  inputClassName?: string
}

/**
 * Advanced OTP input component with auto-advance, paste support, and keyboard navigation
 * Handles all edge cases including backspace, delete, arrow keys, and paste events
 */
export function OTPInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  autoFocus = true,
  className,
  inputClassName
}: OTPInputProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Convert string value to array for easier manipulation
  const valueArray = value.split('').slice(0, length)
  while (valueArray.length < length) {
    valueArray.push('')
  }

  // Focus on mount if autoFocus is true
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus])

  // Auto-focus next input when value changes
  useEffect(() => {
    const firstEmptyIndex = valueArray.findIndex(val => val === '')
    if (firstEmptyIndex !== -1 && inputRefs.current[firstEmptyIndex]) {
      inputRefs.current[firstEmptyIndex].focus()
      setActiveIndex(firstEmptyIndex)
    } else if (value.length === length && onComplete) {
      // All fields filled, trigger onComplete
      onComplete(value)
    }
  }, [value, length, onComplete, valueArray])

  // Handle single character input
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>, index: number) => {
    const inputValue = e.target.value
    const lastChar = inputValue[inputValue.length - 1] || ''
    
    // Only allow digits
    if (lastChar && !/^\d$/.test(lastChar)) {
      return
    }

    const newValueArray = [...valueArray]
    newValueArray[index] = lastChar
    const newValue = newValueArray.join('')
    
    onChange(newValue)

    // Auto-advance to next input
    if (lastChar && index < length - 1) {
      const nextInput = inputRefs.current[index + 1]
      if (nextInput) {
        nextInput.focus()
        nextInput.select()
        setActiveIndex(index + 1)
      }
    }
  }, [valueArray, onChange, length])

  // Handle paste event
  const handlePaste = useCallback((e: ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '') // Remove non-digits
    
    if (!pastedData) return

    const newValueArray = [...valueArray]
    const pastedArray = pastedData.split('').slice(0, length - index)
    
    pastedArray.forEach((char, i) => {
      if (index + i < length) {
        newValueArray[index + i] = char
      }
    })

    const newValue = newValueArray.join('')
    onChange(newValue)

    // Focus on next empty field or last field
    const nextEmptyIndex = newValueArray.findIndex((val, i) => i >= index && val === '')
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : Math.min(index + pastedArray.length, length - 1)
    
    if (inputRefs.current[focusIndex]) {
      inputRefs.current[focusIndex].focus()
      setActiveIndex(focusIndex)
    }
  }, [valueArray, onChange, length])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>, index: number) => {
    switch (e.key) {
      case 'Backspace':
        e.preventDefault()
        if (valueArray[index]) {
          // Clear current field
          const newValueArray = [...valueArray]
          newValueArray[index] = ''
          onChange(newValueArray.join(''))
        } else if (index > 0) {
          // Move to previous field and clear it
          const prevInput = inputRefs.current[index - 1]
          if (prevInput) {
            prevInput.focus()
            setActiveIndex(index - 1)
            const newValueArray = [...valueArray]
            newValueArray[index - 1] = ''
            onChange(newValueArray.join(''))
          }
        }
        break

      case 'Delete':
        e.preventDefault()
        const newValueArray = [...valueArray]
        newValueArray[index] = ''
        onChange(newValueArray.join(''))
        break

      case 'ArrowLeft':
        e.preventDefault()
        if (index > 0) {
          const prevInput = inputRefs.current[index - 1]
          if (prevInput) {
            prevInput.focus()
            prevInput.select()
            setActiveIndex(index - 1)
          }
        }
        break

      case 'ArrowRight':
        e.preventDefault()
        if (index < length - 1) {
          const nextInput = inputRefs.current[index + 1]
          if (nextInput) {
            nextInput.focus()
            nextInput.select()
            setActiveIndex(index + 1)
          }
        }
        break

      case 'Home':
        e.preventDefault()
        const firstInput = inputRefs.current[0]
        if (firstInput) {
          firstInput.focus()
          firstInput.select()
          setActiveIndex(0)
        }
        break

      case 'End':
        e.preventDefault()
        const lastInput = inputRefs.current[length - 1]
        if (lastInput) {
          lastInput.focus()
          lastInput.select()
          setActiveIndex(length - 1)
        }
        break

      default:
        // Allow Tab to work normally for accessibility
        if (e.key === 'Tab') return
        
        // Prevent non-digit characters
        if (!/^\d$/.test(e.key)) {
          e.preventDefault()
        }
        break
    }
  }, [valueArray, onChange, length])

  // Handle focus event
  const handleFocus = useCallback((index: number) => {
    setActiveIndex(index)
    // Select content on focus for easier replacement
    const input = inputRefs.current[index]
    if (input) {
      input.select()
    }
  }, [])

  return (
    <div 
      className={cn(
        "flex gap-2 sm:gap-3",
        className
      )}
      role="group"
      aria-label="One-time password input"
    >
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          pattern="\d{1}"
          maxLength={1}
          value={valueArray[index]}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={(e) => handlePaste(e, index)}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          aria-label={`Digit ${index + 1} of ${length}`}
          aria-invalid={error}
          className={cn(
            "w-10 h-12 sm:w-12 sm:h-14",
            "text-center text-lg sm:text-xl font-semibold",
            "border-2 rounded-lg",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            // Default state
            "border-gray-300 bg-white text-[#243837]",
            // Focus state
            "focus:border-[#B1FA63] focus:ring-[#B1FA63]/20",
            // Active (has value) state
            valueArray[index] && "border-[#B1FA63] bg-[#B1FA63]/5",
            // Error state
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            // Disabled state
            disabled && "opacity-50 cursor-not-allowed bg-gray-50",
            // Active index highlight
            activeIndex === index && !error && "border-[#B1FA63] shadow-sm",
            inputClassName
          )}
        />
      ))}
    </div>
  )
}

/**
 * OTP Input with label and error message
 */
interface OTPInputFieldProps extends OTPInputProps {
  label?: string
  errorMessage?: string
  helperText?: string
}

export function OTPInputField({
  label,
  errorMessage,
  helperText,
  error: errorProp,
  ...props
}: OTPInputFieldProps) {
  const hasError = errorProp || !!errorMessage

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-[#243837]">
          {label}
        </label>
      )}
      
      <OTPInput {...props} error={hasError} />
      
      {(errorMessage || helperText) && (
        <p className={cn(
          "text-sm mt-1",
          hasError ? "text-red-500" : "text-gray-500"
        )}>
          {errorMessage || helperText}
        </p>
      )}
    </div>
  )
}