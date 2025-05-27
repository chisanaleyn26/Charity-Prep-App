'use client'

import { useEffect, useState } from 'react'
import { Building2, AlertTriangle, CheckCircle, Clock, Users, Crown, Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useOrganization } from '@/features/organizations/components/organization-provider'
import { getAdvisedOrganizations, getOrganizationStats } from '@/features/organizations/services/org-service'
import { useAuthStore } from '@/stores/auth-store'
import type { OrganizationMember } from '@/lib/types/app.types'

interface OrgStats {
  organization: any
  memberCount: number
  safeguardingRecords: number
  overseasActivities: number
  complianceScore?: number
}

const roleIcons = {
  admin: Crown,
  member: Shield,
  viewer: Users,
}

const roleLabels = {
  admin: 'Admin',
  member: 'Member',
  viewer: 'Viewer',
}

export function MultiOrgDashboard() {
  const { user } = useAuthStore()
  const { switchOrganization } = useOrganization()
  const [advisedOrgs, setAdvisedOrgs] = useState<OrganizationMember[]>([])
  const [orgStats, setOrgStats] = useState<Record<string, OrgStats>>({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    async function loadAdvisorData() {
      if (!user) return

      setLoading(true)
      try {
        // Get organizations where user is advisor/admin
        const orgs = await getAdvisedOrganizations(user.id)
        setAdvisedOrgs(orgs)

        // Get stats for each organization
        const stats: Record<string, OrgStats> = {}
        await Promise.all(
          orgs.map(async (orgMember) => {
            const orgStats = await getOrganizationStats(orgMember.organization_id)
            if (orgStats) {
              // Mock compliance score calculation
              const complianceScore = Math.floor(
                ((orgStats.safeguardingRecords || 0) * 30 + (orgStats.overseasActivities || 0) * 25 + (orgStats.memberCount || 0) * 10) / 3
              )
              stats[orgMember.organization_id] = {
                ...orgStats,
                complianceScore: Math.min(100, Math.max(0, complianceScore))
              }
            }
          })
        )
        setOrgStats(stats)
      } catch (error) {
        console.error('Failed to load advisor data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAdvisorData()
  }, [user])

  const handleSwitchToOrg = async (organizationId: string) => {
    await switchOrganization(organizationId)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (advisedOrgs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            No Organizations
          </CardTitle>
          <CardDescription>
            You don't have advisor access to any organizations yet.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const totalOrgs = advisedOrgs.length
  const avgComplianceScore = Object.values(orgStats).reduce((sum, stats) => 
    sum + (stats.complianceScore || 0), 0
  ) / totalOrgs

  const urgentActions = advisedOrgs.filter(org => {
    const stats = orgStats[org.organization_id]
    return stats && (stats.complianceScore || 0) < 70
  })

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrgs}</div>
            <p className="text-xs text-muted-foreground">Under your advisory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Compliance Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgComplianceScore)}%</div>
            <Progress value={avgComplianceScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Actions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{urgentActions.length}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(orgStats).reduce((sum, stats) => sum + stats.memberCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all orgs</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Organization Overview</TabsTrigger>
          <TabsTrigger value="actions">Urgent Actions</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {advisedOrgs.map((orgMember) => {
              const stats = orgStats[orgMember.organization_id]
              const RoleIcon = roleIcons[orgMember.role as keyof typeof roleIcons]
              
              return (
                <Card key={orgMember.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {(orgMember as any).organization?.name || 'Unknown Organization'}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              <RoleIcon className="h-3 w-3 mr-1" />
                              {roleLabels[orgMember.role as keyof typeof roleLabels]}
                            </Badge>
                            {(orgMember as any).organization?.charity_number && (
                              <span className="text-xs text-muted-foreground">
                                #{(orgMember as any).organization.charity_number}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSwitchToOrg(orgMember.organization_id)}
                      >
                        Switch To
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {stats ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm font-medium">Compliance Score</p>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold">
                              {stats.complianceScore}%
                            </span>
                            <Progress value={stats.complianceScore} className="flex-1" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Members</p>
                          <p className="text-2xl font-bold">{stats.memberCount}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Safeguarding</p>
                          <p className="text-2xl font-bold">{stats.safeguardingRecords}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Overseas Activities</p>
                          <p className="text-2xl font-bold">{stats.overseasActivities}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Loading statistics...</p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Organizations Requiring Attention
              </CardTitle>
              <CardDescription>
                Organizations with compliance scores below 70% need immediate attention.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {urgentActions.length === 0 ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span>All organizations are in good standing!</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {urgentActions.map((orgMember) => {
                    const stats = orgStats[orgMember.organization_id]
                    return (
                      <div key={orgMember.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          <div>
                            <p className="font-medium">{(orgMember as any).organization?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Compliance Score: {stats?.complianceScore}%
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSwitchToOrg(orgMember.organization_id)}
                        >
                          Review
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Operations</CardTitle>
              <CardDescription>
                Perform actions across multiple organizations at once.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Clock className="h-6 w-6 mb-2" />
                  <span>Bulk Report Generation</span>
                  <span className="text-xs text-muted-foreground">Generate reports for all orgs</span>
                </Button>
                
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Building2 className="h-6 w-6 mb-2" />
                  <span>Cross-Org Analytics</span>
                  <span className="text-xs text-muted-foreground">Compare performance metrics</span>
                </Button>
                
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Users className="h-6 w-6 mb-2" />
                  <span>Unified Billing View</span>
                  <span className="text-xs text-muted-foreground">See all subscriptions</span>
                </Button>
                
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Shield className="h-6 w-6 mb-2" />
                  <span>Permission Management</span>
                  <span className="text-xs text-muted-foreground">Manage user access</span>
                </Button>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  Selected Organizations: {advisedOrgs.length} of {advisedOrgs.length}
                </p>
                <div className="flex gap-2">
                  <Button disabled>
                    Generate All Reports
                  </Button>
                  <Button variant="outline" disabled>
                    Export Combined Data
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Bulk operations are coming soon. Contact support for assistance.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}