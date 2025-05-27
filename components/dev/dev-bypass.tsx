'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Zap, AlertTriangle } from 'lucide-react'
import { devLogin } from '@/lib/dev/dev-auth'

/**
 * DEVELOPER BYPASS COMPONENT
 * 
 * This component provides a quick login bypass for testing.
 * Uses server actions to create a proper cookie-based session that works
 * with both server and client components.
 * 
 * TO DISABLE FOR PRODUCTION:
 * Set showDevBypass={false} in the login page component
 * or remove the DevBypass component from LoginForm
 */

interface MockUser {
  id: string
  email: string
  role: string
  orgName: string
  description: string
}

const MOCK_USERS: MockUser[] = [
  {
    id: 'dev-admin-001',
    email: 'admin@charitytest.org',
    role: 'admin',
    orgName: 'Test Charity Foundation',
    description: 'Full admin access to all features'
  },
  {
    id: 'dev-member-001', 
    email: 'member@charitytest.org',
    role: 'member',
    orgName: 'Test Charity Foundation',
    description: 'Standard member access'
  },
  {
    id: 'dev-viewer-001',
    email: 'viewer@charitytest.org', 
    role: 'viewer',
    orgName: 'Test Charity Foundation',
    description: 'Read-only access'
  }
]

export function DevBypass() {
  const [isPending, startTransition] = useTransition()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleDevLogin = (mockUser: MockUser) => {
    setLoadingId(mockUser.id)
    
    startTransition(async () => {
      try {
        await devLogin(mockUser.id)
        console.log(`Logged in as ${mockUser.role}`)
      } catch (error) {
        console.error('Dev login error:', error)
        console.error('Failed to create dev session')
        setLoadingId(null)
      }
    })
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-orange-600" />
          <CardTitle className="text-orange-800 text-lg">Developer Bypass</CardTitle>
          <Badge variant="outline" className="text-orange-700 border-orange-300">
            DEV ONLY
          </Badge>
        </div>
        <CardDescription className="text-orange-700">
          Quick login for testing dashboard features
        </CardDescription>
        <div className="flex items-center gap-1 text-sm text-orange-600 bg-orange-100 p-2 rounded">
          <AlertTriangle className="h-4 w-4" />
          <span>Testing bypass - disable for production</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {MOCK_USERS.map((user) => (
          <Button
            key={user.id}
            variant="outline"
            className="w-full justify-start h-auto p-4 border-orange-200 hover:bg-orange-100"
            onClick={() => handleDevLogin(user)}
            disabled={isPending || loadingId !== null}
          >
            <div className="flex items-center gap-3 w-full">
              <User className="h-5 w-5 text-orange-600" />
              <div className="text-left flex-1">
                <div className="font-medium text-orange-800">{user.email}</div>
                <div className="text-sm text-orange-600">
                  {user.role.toUpperCase()} • {user.orgName}
                </div>
                <div className="text-xs text-orange-500">{user.description}</div>
              </div>
              {loadingId === user.id && (
                <div className="animate-spin h-4 w-4 border-2 border-orange-600 border-t-transparent rounded-full" />
              )}
            </div>
          </Button>
        ))}
        
        <div className="text-xs text-orange-600 bg-orange-100 p-2 rounded mt-4">
          <strong>Usage:</strong> Click any user to instantly login and test dashboard features.
          Session persists across page refreshes. 
          <br />
          <strong>Note:</strong> This bypass is always visible for testing purposes.
        </div>
      </CardContent>
    </Card>
  )
}

export default DevBypass