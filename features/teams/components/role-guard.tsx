'use client'

import { ReactNode } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lock } from 'lucide-react'

interface RoleGuardProps {
  allowedRoles: Array<'admin' | 'member' | 'viewer'>
  children: ReactNode
  fallback?: ReactNode
  showAlert?: boolean
}

export function RoleGuard({ 
  allowedRoles, 
  children, 
  fallback,
  showAlert = true 
}: RoleGuardProps) {
  const { getCurrentUserRole } = useAuthStore()
  const userRole = getCurrentUserRole()
  
  const hasAccess = userRole && allowedRoles.includes(userRole)
  
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    if (showAlert) {
      return (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            You don&apos;t have permission to access this feature. 
            Contact your organization admin for access.
          </AlertDescription>
        </Alert>
      )
    }
    
    return null
  }
  
  return <>{children}</>
}

/**
 * Utility component for admin-only features
 */
export function AdminOnly({ children, fallback, showAlert }: Omit<RoleGuardProps, 'allowedRoles'>) {
  return (
    <RoleGuard allowedRoles={['admin']} fallback={fallback} showAlert={showAlert}>
      {children}
    </RoleGuard>
  )
}

/**
 * Utility component for features that viewers can't access
 */
export function EditorsOnly({ children, fallback, showAlert }: Omit<RoleGuardProps, 'allowedRoles'>) {
  return (
    <RoleGuard allowedRoles={['admin', 'member']} fallback={fallback} showAlert={showAlert}>
      {children}
    </RoleGuard>
  )
}