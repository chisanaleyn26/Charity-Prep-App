'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Mail, MoreHorizontal, RefreshCw, X, Clock, CheckCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDistanceToNow } from 'date-fns'
import { cancelInvitation, resendInvitation } from '../services/invitation.service'
import { sendInvitationReminderEmail } from '@/lib/email/invitation'

interface Invitation {
  id: string
  email: string
  role: 'admin' | 'member' | 'viewer'
  created_at: string
  expires_at: string
  accepted_at: string | null
  inviter: {
    email: string
    full_name: string | null
  }
}

interface PendingInvitationsProps {
  invitations: Invitation[]
  organizationId: string
  organizationName: string
  onRefresh: () => void
}

export function PendingInvitations({
  invitations,
  organizationId,
  organizationName,
  onRefresh
}: PendingInvitationsProps) {
  const [cancelingId, setCancelingId] = useState<string | null>(null)
  const [resendingId, setResendingId] = useState<string | null>(null)

  const pendingInvitations = invitations.filter(inv => !inv.accepted_at)
  const acceptedInvitations = invitations.filter(inv => inv.accepted_at)

  async function handleCancel() {
    if (!cancelingId) return
    
    try {
      await cancelInvitation(cancelingId)
      setCancelingId(null)
      onRefresh()
    } catch (error) {
      console.error('Failed to cancel invitation:', error)
    }
  }

  async function handleResend(invitation: Invitation) {
    setResendingId(invitation.id)
    
    try {
      const updated = await resendInvitation(invitation.id)
      
      // Calculate days remaining
      const daysRemaining = Math.ceil((new Date(updated.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      
      // Send new email
      await sendInvitationReminderEmail({
        to: invitation.email,
        inviterName: invitation.inviter.full_name || invitation.inviter.email,
        organizationName,
        invitationToken: updated.invitation_token,
        role: invitation.role,
        daysRemaining
      })
      
      onRefresh()
    } catch (error) {
      console.error('Failed to resend invitation:', error)
    } finally {
      setResendingId(null)
    }
  }

  function isExpiringSoon(expiresAt: string) {
    const daysUntilExpiry = (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    return daysUntilExpiry < 2
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No invitations sent yet
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {pendingInvitations.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3">Pending Invitations</h3>
          <div className="space-y-2">
            {pendingInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{invitation.email}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>Invited {formatDistanceToNow(new Date(invitation.created_at))} ago</span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Expires {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="capitalize">
                    {invitation.role}
                  </Badge>
                  
                  {isExpiringSoon(invitation.expires_at) && (
                    <Badge variant="destructive" className="text-xs">
                      Expiring Soon
                    </Badge>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        disabled={resendingId === invitation.id}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleResend(invitation)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Resend Invitation
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setCancelingId(invitation.id)}
                        className="text-destructive"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel Invitation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {acceptedInvitations.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3">Recently Accepted</h3>
          <div className="space-y-2">
            {acceptedInvitations.slice(0, 5).map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-4 border rounded-lg opacity-60"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{invitation.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Accepted {formatDistanceToNow(new Date(invitation.accepted_at!))} ago
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {invitation.role}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      <AlertDialog open={!!cancelingId} onOpenChange={() => setCancelingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this invitation? The invitation link will 
              no longer be valid.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Invitation</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-destructive">
              Cancel Invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}