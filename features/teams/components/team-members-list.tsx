'use client'

import { useState } from 'react'
import { TeamMember } from '../services/team-management.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { MoreHorizontal, Shield, User, Eye, UserX, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface TeamMembersListProps {
  members: TeamMember[]
  currentUserId: string
  currentUserRole: 'admin' | 'member' | 'viewer'
  organizationId: string
  onRoleChange: (userId: string, newRole: 'admin' | 'member' | 'viewer') => Promise<void>
  onRemoveMember: (userId: string) => Promise<void>
  onRefresh: () => void
}

export function TeamMembersList({
  members,
  currentUserId,
  currentUserRole,
  organizationId,
  onRoleChange,
  onRemoveMember,
  onRefresh
}: TeamMembersListProps) {
  const [removingUserId, setRemovingUserId] = useState<string | null>(null)
  const [changingRole, setChangingRole] = useState<string | null>(null)

  const roleIcons = {
    admin: Shield,
    member: User,
    viewer: Eye
  }

  const roleColors = {
    admin: 'destructive',
    member: 'default',
    viewer: 'secondary'
  } as const

  async function handleRoleChange(userId: string, newRole: 'admin' | 'member' | 'viewer') {
    setChangingRole(userId)
    try {
      await onRoleChange(userId, newRole)
      onRefresh()
    } catch (error) {
      console.error('Failed to change role:', error)
    } finally {
      setChangingRole(null)
    }
  }

  async function handleRemove() {
    if (!removingUserId) return
    
    try {
      await onRemoveMember(removingUserId)
      setRemovingUserId(null)
      onRefresh()
    } catch (error) {
      console.error('Failed to remove member:', error)
    }
  }

  function getInitials(name: string | null, email: string) {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <div className="space-y-4">
      {members.map((member) => {
        const Icon = roleIcons[member.role]
        const isCurrentUser = member.user_id === currentUserId
        const canManage = currentUserRole === 'admin' && !isCurrentUser

        return (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={member.user.avatar_url || undefined} />
                <AvatarFallback>
                  {getInitials(member.user.full_name, member.user.email)}
                </AvatarFallback>
              </Avatar>

              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium">
                    {member.user.full_name || member.user.email}
                  </h4>
                  {isCurrentUser && (
                    <Badge variant="outline" className="text-xs">You</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{member.user.email}</p>
                <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                  <span>Joined {formatDistanceToNow(new Date(member.accepted_at || member.invited_at))} ago</span>
                  {member.last_active_at && (
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Active {formatDistanceToNow(new Date(member.last_active_at))} ago
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant={roleColors[member.role]} className="capitalize">
                <Icon className="h-3 w-3 mr-1" />
                {member.role}
              </Badge>

              {canManage && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" disabled={changingRole === member.user_id}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleRoleChange(member.user_id, 'admin')}
                      disabled={member.role === 'admin'}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Make Admin
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleRoleChange(member.user_id, 'member')}
                      disabled={member.role === 'member'}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Make Member
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleRoleChange(member.user_id, 'viewer')}
                      disabled={member.role === 'viewer'}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Make Viewer
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setRemovingUserId(member.user_id)}
                      className="text-destructive"
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Remove from Organization
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        )
      })}

      <AlertDialog open={!!removingUserId} onOpenChange={() => setRemovingUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member from the organization? 
              They will lose access to all organization resources.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} className="bg-destructive">
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}