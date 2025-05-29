'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Send, Info } from 'lucide-react'

interface InviteUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
  organizationName: string
  onSuccess?: () => void
}

export function InviteUserModal({
  open,
  onOpenChange,
  organizationId,
  organizationName,
  onSuccess
}: InviteUserModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'member' | 'viewer'>('member')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSending(true)

    try {
      const response = await fetch(`/api/organizations/${organizationId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation')
      }

      setSuccess(true)
      setTimeout(() => {
        onOpenChange(false)
        setEmail('')
        setRole('member')
        setSuccess(false)
        onSuccess?.()
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join {organizationName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={sending || success}
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              value={role}
              onValueChange={(value: any) => setRole(value)}
              disabled={sending || success}
            >
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <div>
                    <div className="font-medium">Admin</div>
                    <div className="text-xs text-muted-foreground">
                      Full access to all features and settings
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="member">
                  <div>
                    <div className="font-medium">Member</div>
                    <div className="text-xs text-muted-foreground">
                      Can view and edit most resources
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="viewer">
                  <div>
                    <div className="font-medium">Viewer</div>
                    <div className="text-xs text-muted-foreground">
                      Read-only access to resources
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              The invitation will be valid for 7 days. The recipient will need to
              create an account or log in to accept.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                Invitation sent successfully!
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={sending || success || !email}>
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}