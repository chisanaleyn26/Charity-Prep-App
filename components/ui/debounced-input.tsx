'use client'

import { useEffect, useState } from 'react'
import { Input, type InputProps } from '@/components/ui/input'
import { Loader2, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface DebouncedInputProps extends Omit<InputProps, 'onChange' | 'value'> {
  value: string
  onChange: (value: string) => void
  debounceMs?: number
  onDebounceStart?: () => void
  onDebounceEnd?: () => void
  showClear?: boolean
  showSearchIcon?: boolean
  loading?: boolean
}

export function DebouncedInput({
  value: initialValue,
  onChange,
  debounceMs = 500,
  onDebounceStart,
  onDebounceEnd,
  showClear = true,
  showSearchIcon = true,
  loading = false,
  className,
  ...props
}: DebouncedInputProps) {
  const [value, setValue] = useState(initialValue)
  const [debouncing, setDebouncing] = useState(false)

  // Update local value when prop changes
  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  // Debounce the onChange callback
  useEffect(() => {
    if (value === initialValue) return

    setDebouncing(true)
    onDebounceStart?.()

    const timeout = setTimeout(() => {
      onChange(value)
      setDebouncing(false)
      onDebounceEnd?.()
    }, debounceMs)

    return () => {
      clearTimeout(timeout)
      setDebouncing(false)
    }
  }, [value, debounceMs, onChange, onDebounceStart, onDebounceEnd, initialValue])

  const handleClear = () => {
    setValue('')
    onChange('')
  }

  return (
    <div className="relative">
      {showSearchIcon && (
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      )}
      
      <Input
        {...props}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={cn(
          showSearchIcon && "pl-9",
          (showClear || loading || debouncing) && "pr-9",
          className
        )}
      />
      
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {(loading || debouncing) && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
        
        {showClear && value && !loading && !debouncing && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0"
            onClick={handleClear}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  )
}

// Hook for debounced values
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

// Hook for debounced callback
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): [T, boolean] {
  const [isPending, setIsPending] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      setIsPending(true)
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args)
        setIsPending(false)
      }, delay)
    },
    [callback, delay]
  ) as T

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return [debouncedCallback, isPending]
}

// Throttled input for high-frequency updates
export function useThrottle<T>(value: T, delay: number = 500): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastRan = useRef(Date.now())

  useEffect(() => {
    const now = Date.now()
    
    if (now - lastRan.current >= delay) {
      lastRan.current = now
      setThrottledValue(value)
    } else {
      const timer = setTimeout(() => {
        lastRan.current = Date.now()
        setThrottledValue(value)
      }, delay - (now - lastRan.current))

      return () => clearTimeout(timer)
    }
  }, [value, delay])

  return throttledValue
}

// Optimized search input with suggestions
import { useRef, useCallback } from 'react'

interface SearchInputProps extends DebouncedInputProps {
  suggestions?: string[]
  onSelectSuggestion?: (suggestion: string) => void
  maxSuggestions?: number
}

export function SearchInput({
  suggestions = [],
  onSelectSuggestion,
  maxSuggestions = 5,
  ...props
}: SearchInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const filteredSuggestions = suggestions
    .filter(s => s.toLowerCase().includes(props.value.toLowerCase()))
    .slice(0, maxSuggestions)

  const handleSelectSuggestion = (suggestion: string) => {
    props.onChange(suggestion)
    onSelectSuggestion?.(suggestion)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  return (
    <div className="relative">
      <DebouncedInput
        {...props}
        ref={inputRef}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />
      
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              className="w-full px-3 py-2 text-left hover:bg-muted focus:bg-muted focus:outline-none"
              onClick={() => handleSelectSuggestion(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}