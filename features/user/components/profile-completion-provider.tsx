'use client'

import React, { useState, useEffect } from 'react'
import { ProfileCompletionModal } from './profile-completion-modal'
import { useUserProfile } from '../hooks/use-user-profile'
import { useAuthStore } from '@/stores/auth-store'

interface ProfileCompletionProviderProps {
  children: React.ReactNode
}

export function ProfileCompletionProvider({ children }: ProfileCompletionProviderProps) {
  const { isAuthenticated } = useAuthStore()
  const { profile, completionStatus, isLoading } = useUserProfile()
  const [showModal, setShowModal] = useState(false)
  const [hasShownModal, setHasShownModal] = useState(false)

  // Show modal for incomplete profiles (but only once per session)
  useEffect(() => {
    if (
      isAuthenticated && 
      !isLoading && 
      profile && 
      completionStatus.criticalMissing && 
      !hasShownModal
    ) {
      // Only show if user has been authenticated for more than 2 seconds
      // This prevents showing immediately after login
      const timer = setTimeout(() => {
        setShowModal(true)
        setHasShownModal(true)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, isLoading, profile, completionStatus.criticalMissing, hasShownModal])

  // Reset when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setHasShownModal(false)
      setShowModal(false)
    }
  }, [isAuthenticated])

  const handleComplete = () => {
    setShowModal(false)
    // Could trigger a celebration or redirect here
  }

  const handleClose = () => {
    setShowModal(false)
    // Mark as dismissed for this session
    setHasShownModal(true)
  }

  return (
    <>
      {children}
      {showModal && (
        <ProfileCompletionModal
          isOpen={showModal}
          onClose={handleClose}
          onComplete={handleComplete}
          autoShow={true}
        />
      )}
    </>
  )
}