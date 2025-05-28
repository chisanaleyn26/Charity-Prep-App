'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseOTPTimerOptions {
  initialTime?: number // in seconds
  onTimerEnd?: () => void
}

interface UseOTPTimerReturn {
  timeLeft: number
  isActive: boolean
  canResend: boolean
  startTimer: () => void
  resetTimer: () => void
  formatTime: (seconds: number) => string
}

/**
 * Custom hook for managing OTP resend cooldown timer
 * Handles countdown logic and provides formatted time display
 */
export function useOTPTimer({
  initialTime = 60, // 60 seconds default cooldown
  onTimerEnd
}: UseOTPTimerOptions = {}): UseOTPTimerReturn {
  const [timeLeft, setTimeLeft] = useState(0)
  const [isActive, setIsActive] = useState(false)

  // Start the timer
  const startTimer = useCallback(() => {
    setTimeLeft(initialTime)
    setIsActive(true)
  }, [initialTime])

  // Reset the timer
  const resetTimer = useCallback(() => {
    setTimeLeft(0)
    setIsActive(false)
  }, [])

  // Format seconds to MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Timer countdown effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1
          
          // Timer ended
          if (newTime === 0) {
            setIsActive(false)
            onTimerEnd?.()
          }
          
          return newTime
        })
      }, 1000)
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false)
    }

    // Cleanup interval on unmount or when dependencies change
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isActive, timeLeft, onTimerEnd])

  return {
    timeLeft,
    isActive,
    canResend: !isActive && timeLeft === 0,
    startTimer,
    resetTimer,
    formatTime
  }
}

/**
 * Hook for managing multiple OTP attempts with increasing cooldown
 */
export function useOTPAttempts() {
  const [attemptCount, setAttemptCount] = useState(0)
  const [lastAttemptTime, setLastAttemptTime] = useState<Date | null>(null)

  // Calculate cooldown based on attempt count
  const getCooldownDuration = useCallback((attempts: number): number => {
    // Progressive cooldown: 60s, 120s, 300s, 600s
    const cooldowns = [60, 120, 300, 600]
    return cooldowns[Math.min(attempts - 1, cooldowns.length - 1)] || 60
  }, [])

  // Check if user can request new OTP
  const canRequestOTP = useCallback((): boolean => {
    if (!lastAttemptTime) return true
    
    const cooldownDuration = getCooldownDuration(attemptCount)
    const timeSinceLastAttempt = Date.now() - lastAttemptTime.getTime()
    
    return timeSinceLastAttempt >= cooldownDuration * 1000
  }, [attemptCount, lastAttemptTime, getCooldownDuration])

  // Record new attempt
  const recordAttempt = useCallback(() => {
    setAttemptCount((prev) => prev + 1)
    setLastAttemptTime(new Date())
  }, [])

  // Reset attempts (e.g., after successful login)
  const resetAttempts = useCallback(() => {
    setAttemptCount(0)
    setLastAttemptTime(null)
  }, [])

  // Get remaining cooldown time
  const getRemainingCooldown = useCallback((): number => {
    if (!lastAttemptTime || canRequestOTP()) return 0
    
    const cooldownDuration = getCooldownDuration(attemptCount)
    const timeSinceLastAttempt = Math.floor((Date.now() - lastAttemptTime.getTime()) / 1000)
    
    return Math.max(0, cooldownDuration - timeSinceLastAttempt)
  }, [attemptCount, lastAttemptTime, canRequestOTP, getCooldownDuration])

  return {
    attemptCount,
    canRequestOTP,
    recordAttempt,
    resetAttempts,
    getRemainingCooldown,
    getCooldownDuration
  }
}