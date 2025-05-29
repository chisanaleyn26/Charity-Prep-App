'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getInvitationByToken, acceptInvitation } from '@/features/teams/services/invitation.service'
import { sendWelcomeEmail } from '@/lib/email/invitation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

function AcceptInvitationPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invitation, setInvitation] = useState<any>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkInvitation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  useEffect(() => {
    // Check if returning from login with pending invitation
    const pendingToken = sessionStorage.getItem('pending_invitation')
    if (pendingToken && !token) {
      sessionStorage.removeItem('pending_invitation')
      router.push(`/invitations/accept?token=${pendingToken}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function checkInvitation() {
    if (!token) {
      setError('Invalid invitation link')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const inviteData = await getInvitationByToken(token)
      if (!inviteData) {
        setError('Invalid or expired invitation')
      } else {
        setInvitation(inviteData)
      }
    } catch (err) {
      console.error('Error checking invitation:', err)
      setError('Failed to load invitation')
    } finally {
      setLoading(false)
    }
  }

  async function handleAccept() {
    if (!invitation || !user) return
    
    setAccepting(true)
    setError(null)

    try {
      await acceptInvitation(token!, user.id)
      
      // Send welcome email
      await sendWelcomeEmail({
        to: user.email!,
        userName: user.user_metadata?.full_name || user.email!,
        organizationName: invitation.organization.name,
        role: invitation.role
      })
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      console.error('Error accepting invitation:', err)
      setError(err.message || 'Failed to accept invitation')
      setAccepting(false)
    }
  }

  async function handleLogin() {
    // Store token in session storage to resume after login
    sessionStorage.setItem('pending_invitation', token!)
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Invalid Invitation</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => router.push('/')} variant="outline">
              Return to Home
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">
            You&apos;re invited to join {invitation.organization.name}
          </h1>
          <p className="text-muted-foreground">
            {invitation.inviter.full_name || invitation.inviter.email} has invited you 
            to join as a {invitation.role}
          </p>
        </div>

        {user ? (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">
                Logged in as: <strong>{user.email}</strong>
              </p>
            </div>
            
            {error && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <Button 
              onClick={handleAccept} 
              disabled={accepting}
              className="w-full"
            >
              {accepting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                'Accept Invitation'
              )}
            </Button>
            
            <Button 
              onClick={() => router.push('/')} 
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Please log in to accept this invitation
            </p>
            <Button onClick={handleLogin} className="w-full">
              Log In to Continue
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <AcceptInvitationPageContent />
    </Suspense>
  )
}