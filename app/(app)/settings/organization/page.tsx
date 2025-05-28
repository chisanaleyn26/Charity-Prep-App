'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Building2, 
  Users, 
  Mail, 
  Phone, 
  Globe, 
  MapPin,
  Shield,
  Settings,
  UserPlus,
  Crown,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  Save,
  AlertCircle
} from 'lucide-react'
import { useOrganization } from '@/features/organizations/components/organization-provider'
import { useAuthStore } from '@/stores/auth-store'

export default function OrganizationSettingsPage() {
  const router = useRouter()
  const { currentOrganization, organizations } = useOrganization()
  const { getCurrentUserRole } = useAuthStore()
  
  const userRole = getCurrentUserRole()
  const isAdmin = userRole === 'admin'
  const canEdit = isAdmin // Only admins can edit
  
  // Mock team members data
  const teamMembers = [
    { id: '1', name: 'Sarah Thompson', email: 'sarah@charity.org', role: 'admin', status: 'active' },
    { id: '2', name: 'John Davis', email: 'john@charity.org', role: 'member', status: 'active' },
    { id: '3', name: 'Emma Wilson', email: 'emma@charity.org', role: 'viewer', status: 'pending' },
  ]

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Crown
      case 'member': return Shield
      case 'viewer': return Eye
      default: return Users
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default' as const
      case 'member': return 'secondary' as const
      case 'viewer': return 'outline' as const
      default: return 'outline' as const
    }
  }

  if (!currentOrganization) {
    return (
      <div className="container max-w-4xl py-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No organization found. Please contact support if this issue persists.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/settings')}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Settings
          </Button>
        </div>
        {!canEdit && (
          <Badge variant="secondary">View Only</Badge>
        )}
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
        <p className="text-muted-foreground">
          {canEdit 
            ? 'Manage your organization details and team members'
            : 'View your organization details and team members'
          }
        </p>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="team">Team Members</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Organization Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Organization Information
              </CardTitle>
              <CardDescription>
                Basic information about your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    defaultValue={currentOrganization.name}
                    disabled={!canEdit}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="charity-number">Charity Number</Label>
                  <Input
                    id="charity-number"
                    defaultValue={currentOrganization.charity_number || ''}
                    placeholder="1234567"
                    disabled={!canEdit}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primary-email">Primary Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="primary-email"
                      type="email"
                      className="pl-9"
                      defaultValue={currentOrganization.primary_email}
                      disabled={!canEdit}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      className="pl-9"
                      defaultValue={currentOrganization.phone || ''}
                      disabled={!canEdit}
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      type="url"
                      className="pl-9"
                      defaultValue={currentOrganization.website || ''}
                      placeholder="https://www.charity.org"
                      disabled={!canEdit}
                    />
                  </div>
                </div>
              </div>

              {canEdit && (
                <div className="flex justify-end pt-4">
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address
              </CardTitle>
              <CardDescription>
                Your organization's registered address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  defaultValue={currentOrganization.address_line1 || ''}
                  disabled={!canEdit}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    defaultValue={currentOrganization.city || ''}
                    disabled={!canEdit}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input
                    id="postcode"
                    defaultValue={currentOrganization.postcode || ''}
                    disabled={!canEdit}
                  />
                </div>
              </div>

              {canEdit && (
                <div className="flex justify-end pt-4">
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Save Address
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Members Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Team Members
                  </CardTitle>
                  <CardDescription>
                    Manage who has access to your organization
                  </CardDescription>
                </div>
                {canEdit && (
                  <Button size="sm" className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Invite Member
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => {
                  const RoleIcon = getRoleIcon(member.role)
                  
                  return (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                          <RoleIcon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getRoleBadgeVariant(member.role)}>
                          {member.role}
                        </Badge>
                        {member.status === 'pending' && (
                          <Badge variant="outline">Pending</Badge>
                        )}
                        {canEdit && member.role !== 'admin' && (
                          <div className="flex items-center gap-1 ml-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>
                Configure organization-wide settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Organization settings will be available in a future update.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}