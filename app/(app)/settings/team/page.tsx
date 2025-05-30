'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useOrganization } from '@/features/organizations/components/organization-provider'
import { 
  getTeamMembers, 
  getTeamStats, 
  updateMemberRole, 
  removeMember 
} from '@/features/teams/services/team-management.service'
import { listInvitations } from '@/features/teams/services/invitation.service'
import { getTeamMembersSimple, getInvitationsSimple } from '@/features/teams/services/team-management-simple.service'
import { InviteUserModal } from '@/features/teams/components/invite-user-modal'
import { TeamMembersList } from '@/features/teams/components/team-members-list'
import { PendingInvitations } from '@/features/teams/components/pending-invitations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Users, 
  UserPlus, 
  Shield, 
  Activity, 
  Mail,
  AlertCircle
} from 'lucide-react'

export default function TeamSettingsPage() {
  const { currentOrganization: activeOrg, isLoading: orgLoading } = useOrganization()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [members, setMembers] = useState<any[]>([])
  const [invitations, setInvitations] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'member' | 'viewer'>('viewer')
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [userLimit, setUserLimit] = useState<number | null>(null)

  useEffect(() => {
    loadTeamData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOrg])

  async function loadTeamData() {
    if (!activeOrg) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const supabase = createClient()
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        console.error('Error getting user:', userError)
        throw userError
      }
      setCurrentUser(user)

      // Get current user's role
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', activeOrg.id)
        .eq('user_id', user?.id)
        .single()
      
      if (memberError) {
        console.error('Error getting member role:', memberError)
        // Default to viewer if can't get role
        setCurrentUserRole('viewer')
      } else if (memberData) {
        setCurrentUserRole(memberData.role)
      }

      // Get user limit from database function
      const { data: userLimitFromDB, error: limitError } = await supabase
        .rpc('get_organization_user_limit', { org_id: activeOrg.id })
      
      if (limitError) {
        console.error('Error getting user limit:', limitError)
        // Fallback to checking subscription directly
        const { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .select('price_id, status, tier')
          .eq('organization_id', activeOrg.id)
          .eq('status', 'active')
          .single()

        if (subError) {
          console.log('No active subscription found:', subError)
          setUserLimit(1) // Default to free plan (1 user)
        } else {
          // Set user limit based on plan
          // Check both price_id and tier field
          const priceId = subscription?.price_id?.toLowerCase() || ''
          const tier = subscription?.tier?.toUpperCase() || ''
          
          // First check tier field directly
          if (tier === 'ESSENTIALS') {
            setUserLimit(10) // Essentials: 10 users
          } else if (tier === 'STANDARD') {
            setUserLimit(50) // Standard: 50 users
          } else if (tier === 'PREMIUM') {
            setUserLimit(null) // Premium: Unlimited
          }
          // Fallback to price_id patterns
          else if (priceId.includes('essentials') || priceId.includes('starter')) {
            setUserLimit(10) // Essentials: 10 users
          } else if (priceId.includes('standard') || priceId.includes('growth') || priceId.includes('professional')) {
            setUserLimit(50) // Standard: 50 users
          } else if (priceId.includes('premium') || priceId.includes('scale')) {
            setUserLimit(null) // Premium: Unlimited
          } else {
            console.log('Unknown subscription tier:', { tier, priceId })
            setUserLimit(1) // Free plan
          }
        }
      } else {
        // Use the limit from the database function
        setUserLimit(userLimitFromDB === -1 ? null : userLimitFromDB)
        console.log('User limit from database:', userLimitFromDB)
      }

      // Load team data using simple version for now
      try {
        // Use simple queries for now
        const membersData = await getTeamMembersSimple(activeOrg.id)
        const invitationsData = await getInvitationsSimple(activeOrg.id)
        
        // Calculate stats manually
        const statsData = {
          totalMembers: membersData.length,
          activeMembers: membersData.length, // Simplified for now
          pendingInvitations: invitationsData.filter(inv => !inv.accepted_at && new Date(inv.expires_at) > new Date()).length,
          membersByRole: {
            admin: membersData.filter(m => m.role === 'admin').length,
            member: membersData.filter(m => m.role === 'member').length,
            viewer: membersData.filter(m => m.role === 'viewer').length
          }
        }

        setMembers(membersData || [])
        setInvitations(invitationsData || [])
        setStats(statsData)
      } catch (teamError) {
        console.error('Error loading team data:', teamError)
        // Set default values on error
        setMembers([])
        setInvitations([])
        setStats({ totalMembers: 0, activeMembers: 0, pendingInvitations: 0, membersByRole: { admin: 0, member: 0, viewer: 0 } })
      }
    } catch (error) {
      console.error('Failed to load team data:', error)
      setError('Failed to load team data. Please try refreshing the page.')
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = currentUserRole === 'admin'
  const atUserLimit = userLimit !== null && stats && (stats.totalMembers + stats.pendingInvitations) >= userLimit

  if (loading || orgLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!activeOrg) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your organization&apos;s team members and permissions
          </p>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No organization selected. Please select an organization to manage team members.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section with Consistent Pattern */}
      <div className="bg-gradient-to-br from-[#B1FA63]/5 via-[#B1FA63]/3 to-transparent rounded-xl p-6 border border-[#B1FA63]/20 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className="h-12 w-12 bg-[#243837] rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="h-6 w-6 text-[#B1FA63]" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl font-light text-gray-900 leading-tight tracking-tight">Team Management</h1>
              <p className="text-base text-gray-700 leading-relaxed mt-2">
                Manage your organization&apos;s team members and permissions
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button 
              onClick={() => setInviteModalOpen(true)} 
              disabled={atUserLimit}
              className="bg-[#B1FA63] hover:bg-[#9FE851] text-[#243837] font-medium border-[#B1FA63] hover:border-[#9FE851]"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          )}
        </div>
      </div>

      {atUserLimit && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You&apos;ve reached your plan&apos;s user limit ({userLimit} {userLimit === 1 ? 'user' : 'users'}). 
            <a href="/settings/billing" className="underline ml-1">Upgrade your plan</a> to add more team members.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#B1FA63]/30 hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 bg-[#243837] rounded-lg flex items-center justify-center group-hover:scale-105 group-hover:bg-[#B1FA63] transition-all duration-200 flex-shrink-0">
              <Users className="h-5 w-5 text-[#B1FA63] group-hover:text-[#243837]" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-normal">
              Total Members
            </h3>
            <p className="text-3xl font-light text-gray-900 leading-none tracking-tight">
              {stats?.totalMembers || 0}
              {userLimit !== null && userLimit !== -1 && (
                <span className="text-sm text-gray-500 font-normal">/{userLimit}</span>
              )}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#B1FA63]/30 hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 bg-[#243837] rounded-lg flex items-center justify-center group-hover:scale-105 group-hover:bg-[#B1FA63] transition-all duration-200 flex-shrink-0">
              <Activity className="h-5 w-5 text-[#B1FA63] group-hover:text-[#243837]" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-normal">
              Active Members
            </h3>
            <p className="text-3xl font-light text-gray-900 leading-none tracking-tight">
              {stats?.activeMembers || 0}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#B1FA63]/30 hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 bg-[#243837] rounded-lg flex items-center justify-center group-hover:scale-105 group-hover:bg-[#B1FA63] transition-all duration-200 flex-shrink-0">
              <Mail className="h-5 w-5 text-[#B1FA63] group-hover:text-[#243837]" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-normal">
              Pending Invites
            </h3>
            <p className="text-3xl font-light text-gray-900 leading-none tracking-tight">
              {stats?.pendingInvitations || 0}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#B1FA63]/30 hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 bg-[#243837] rounded-lg flex items-center justify-center group-hover:scale-105 group-hover:bg-[#B1FA63] transition-all duration-200 flex-shrink-0">
              <Shield className="h-5 w-5 text-[#B1FA63] group-hover:text-[#243837]" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-normal">
              Admins
            </h3>
            <p className="text-3xl font-light text-gray-900 leading-none tracking-tight">
              {stats?.membersByRole.admin || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Team Tabs */}
      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">
            Members
            <Badge variant="secondary" className="ml-2">
              {stats?.totalMembers || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="invitations">
            Invitations
            {stats?.pendingInvitations > 0 && (
              <Badge variant="default" className="ml-2">
                {stats.pendingInvitations}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage your organization&apos;s team members and their roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeamMembersList
                members={members}
                currentUserId={currentUser?.id || ''}
                currentUserRole={currentUserRole}
                organizationId={activeOrg?.id || ''}
                onRoleChange={updateMemberRole}
                onRemoveMember={removeMember}
                onRefresh={loadTeamData}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invitations</CardTitle>
              <CardDescription>
                Manage pending invitations and resend if needed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PendingInvitations
                invitations={invitations}
                organizationId={activeOrg?.id || ''}
                organizationName={activeOrg?.name || ''}
                onRefresh={loadTeamData}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite Modal */}
      <InviteUserModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        organizationId={activeOrg?.id || ''}
        organizationName={activeOrg?.name || ''}
        onSuccess={loadTeamData}
      />
    </div>
  )
}