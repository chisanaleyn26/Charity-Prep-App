'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
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
  AlertCircle,
  Copy,
  Check,
  Loader2,
  Palette,
  Bot,
  Database,
  Clock,
  ExternalLink
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useOrganizationSettings } from '@/features/settings/hooks/use-organization-settings'
import { 
  updateOrganizationDetails,
  updateOrganizationSettings,
  generateOrganizationEmailAddress,
  inviteTeamMember,
  updateMemberRole,
  removeMember
} from '@/features/settings/actions/organization-settings'

// Form schemas
const organizationDetailsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  charity_number: z.string().regex(/^\d{6,8}(-\d{1,2})?$/, 'Invalid charity number format').optional().or(z.literal('')),
  primary_email: z.string().email('Invalid email address'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  phone: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  primary_color: z.string().optional()
})

const organizationSettingsSchema = z.object({
  email_forwarding_enabled: z.boolean(),
  auto_import_enabled: z.boolean(),
  smart_categorization: z.boolean(),
  require_approval_for_imports: z.boolean(),
  compliance_score_visibility: z.enum(['admin_only', 'all_members', 'public']),
  deadline_reminder_frequency: z.enum(['daily', 'weekly', 'monthly']),
  ai_features_enabled: z.boolean(),
  data_retention_months: z.number().min(12).max(120)
})

type OrganizationDetailsFormData = z.infer<typeof organizationDetailsSchema>
type OrganizationSettingsFormData = z.infer<typeof organizationSettingsSchema>

export default function OrganizationSettingsPage() {
  const router = useRouter()
  const {
    organization,
    members,
    userRole,
    isLoading,
    isAdmin,
    canEdit,
    refreshData,
    emailImportAddress
  } = useOrganizationSettings()

  const [activeTab, setActiveTab] = useState('details')
  const [isUpdating, setIsUpdating] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member')
  const [isInviting, setIsInviting] = useState(false)
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false)

  // Form for organization details
  const detailsForm = useForm<OrganizationDetailsFormData>({
    resolver: zodResolver(organizationDetailsSchema),
    defaultValues: organization ? {
      name: organization.name,
      charity_number: organization.charity_number || '',
      primary_email: organization.primary_email,
      website: organization.website || '',
      phone: organization.phone || '',
      address_line1: organization.address_line1 || '',
      address_line2: organization.address_line2 || '',
      city: organization.city || '',
      postcode: organization.postcode || '',
      primary_color: organization.primary_color || '#6366f1'
    } : undefined
  })

  // Form for organization settings
  const settingsForm = useForm<OrganizationSettingsFormData>({
    resolver: zodResolver(organizationSettingsSchema),
    defaultValues: organization?.settings
  })

  // Update forms when organization data loads
  React.useEffect(() => {
    if (organization) {
      detailsForm.reset({
        name: organization.name,
        charity_number: organization.charity_number || '',
        primary_email: organization.primary_email,
        website: organization.website || '',
        phone: organization.phone || '',
        address_line1: organization.address_line1 || '',
        address_line2: organization.address_line2 || '',
        city: organization.city || '',
        postcode: organization.postcode || '',
        primary_color: organization.primary_color || '#6366f1'
      })
      
      settingsForm.reset(organization.settings)
    }
  }, [organization, detailsForm, settingsForm])

  const handleDetailsSubmit = async (data: OrganizationDetailsFormData) => {
    if (!organization || !canEdit) return

    setIsUpdating(true)
    try {
      const result = await updateOrganizationDetails(organization.id, data)
      if (result.success) {
        await refreshData()
      } else {
        alert(result.error || 'Failed to update organization details')
      }
    } catch (error) {
      console.error('Error updating organization:', error)
      alert('Failed to update organization details')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSettingsSubmit = async (data: OrganizationSettingsFormData) => {
    if (!organization || !canEdit) return

    setIsUpdating(true)
    try {
      const result = await updateOrganizationSettings(organization.id, data)
      if (result.success) {
        await refreshData()
      } else {
        alert(result.error || 'Failed to update organization settings')
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      alert('Failed to update organization settings')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleGenerateEmailAddress = async () => {
    if (!organization || !canEdit) return

    setIsGeneratingEmail(true)
    try {
      const result = await generateOrganizationEmailAddress(organization.id)
      if (result.success) {
        await refreshData()
      } else {
        alert(result.error || 'Failed to generate email address')
      }
    } catch (error) {
      console.error('Error generating email:', error)
      alert('Failed to generate email address')
    } finally {
      setIsGeneratingEmail(false)
    }
  }

  const handleInviteMember = async () => {
    if (!organization || !canEdit || !inviteEmail) return

    setIsInviting(true)
    try {
      const result = await inviteTeamMember(organization.id, inviteEmail, inviteRole)
      if (result.success) {
        setInviteEmail('')
        setInviteRole('member')
        await refreshData()
      } else {
        alert(result.error || 'Failed to invite member')
      }
    } catch (error) {
      console.error('Error inviting member:', error)
      alert('Failed to invite member')
    } finally {
      setIsInviting(false)
    }
  }

  const handleCopyEmail = async () => {
    if (!emailImportAddress) return
    
    try {
      await navigator.clipboard.writeText(emailImportAddress)
      setCopiedEmail(true)
      setTimeout(() => setCopiedEmail(false), 2000)
    } catch (error) {
      console.error('Failed to copy email:', error)
    }
  }

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

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!organization) {
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
            ? 'Manage your organization details, team members, and system settings'
            : 'View your organization details and team members'
          }
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="team">Team Members</TabsTrigger>
          <TabsTrigger value="import">Smart Import</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
        </TabsList>

        {/* Organization Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <form onSubmit={detailsForm.handleSubmit(handleDetailsSubmit)} className="space-y-6">
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
                    <Label htmlFor="name">Organization Name *</Label>
                    <Input
                      id="name"
                      {...detailsForm.register('name')}
                      disabled={!canEdit}
                    />
                    {detailsForm.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {detailsForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="charity-number">Charity Number</Label>
                    <Input
                      id="charity-number"
                      placeholder="e.g., 1234567 or 1234567-1"
                      {...detailsForm.register('charity_number')}
                      disabled={!canEdit}
                    />
                    {detailsForm.formState.errors.charity_number && (
                      <p className="text-sm text-destructive">
                        {detailsForm.formState.errors.charity_number.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primary-email">Primary Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="primary-email"
                        type="email"
                        className="pl-9"
                        {...detailsForm.register('primary_email')}
                        disabled={!canEdit}
                      />
                    </div>
                    {detailsForm.formState.errors.primary_email && (
                      <p className="text-sm text-destructive">
                        {detailsForm.formState.errors.primary_email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        className="pl-9"
                        {...detailsForm.register('phone')}
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
                        placeholder="https://www.charity.org"
                        {...detailsForm.register('website')}
                        disabled={!canEdit}
                      />
                    </div>
                    {detailsForm.formState.errors.website && (
                      <p className="text-sm text-destructive">
                        {detailsForm.formState.errors.website.message}
                      </p>
                    )}
                  </div>
                </div>

                {canEdit && (
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Save className="mr-2 h-4 w-4" />
                      Save Details
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </form>

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
                  {...detailsForm.register('address_line1')}
                  disabled={!canEdit}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address2">Address Line 2</Label>
                <Input
                  id="address2"
                  {...detailsForm.register('address_line2')}
                  disabled={!canEdit}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...detailsForm.register('city')}
                    disabled={!canEdit}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input
                    id="postcode"
                    {...detailsForm.register('postcode')}
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Branding
              </CardTitle>
              <CardDescription>
                Customize your organization's appearance in reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="primary-color"
                    type="color"
                    className="w-20 h-10"
                    {...detailsForm.register('primary_color')}
                    disabled={!canEdit}
                  />
                  <Input
                    placeholder="#6366f1"
                    className="flex-1"
                    {...detailsForm.register('primary_color')}
                    disabled={!canEdit}
                  />
                </div>
              </div>
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
                    Team Members ({members.length})
                  </CardTitle>
                  <CardDescription>
                    Manage who has access to your organization
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Invite New Member */}
              {canEdit && (
                <div className="p-4 border rounded-lg space-y-4">
                  <h4 className="font-semibold">Invite New Member</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="invite-email">Email Address</Label>
                      <Input
                        id="invite-email"
                        type="email"
                        placeholder="user@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invite-role">Role</Label>
                      <Select value={inviteRole} onValueChange={(value: 'admin' | 'member' | 'viewer') => setInviteRole(value)}>
                        <SelectTrigger id="invite-role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button 
                        onClick={handleInviteMember}
                        disabled={isInviting || !inviteEmail}
                        className="w-full"
                      >
                        {isInviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <UserPlus className="mr-2 h-4 w-4" />
                        Invite
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Members List */}
              <div className="space-y-4">
                {members.map((member) => {
                  const RoleIcon = getRoleIcon(member.role)
                  
                  return (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                          <RoleIcon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{member.full_name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                          {member.last_seen_at && (
                            <p className="text-xs text-muted-foreground">
                              Last seen: {new Date(member.last_seen_at).toLocaleDateString()}
                            </p>
                          )}
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
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                if (confirm('Remove this member from the organization?')) {
                                  removeMember(organization.id, member.user_id)
                                    .then(() => refreshData())
                                }
                              }}
                            >
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

        {/* Smart Import Tab */}
        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Import Address
              </CardTitle>
              <CardDescription>
                Forward emails to this address for automatic data extraction
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {emailImportAddress ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                    <code className="flex-1 font-mono text-sm">{emailImportAddress}</code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyEmail}
                    >
                      {copiedEmail ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p><strong>How it works:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 ml-4">
                      <li>Forward any receipt or document to this email address</li>
                      <li>Our AI will extract relevant data automatically</li>
                      <li>Review and confirm the extracted data in your dashboard</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No email import address has been generated yet.
                  </p>
                  {canEdit && (
                    <Button onClick={handleGenerateEmailAddress} disabled={isGeneratingEmail}>
                      {isGeneratingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Generate Email Address
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <form onSubmit={settingsForm.handleSubmit(handleSettingsSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI & Automation Settings
                </CardTitle>
                <CardDescription>
                  Configure how AI features work in your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ai-features">AI Features</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable AI-powered document extraction and suggestions
                    </p>
                  </div>
                  <Switch
                    id="ai-features"
                    {...settingsForm.register('ai_features_enabled')}
                    disabled={!canEdit}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-import">Auto Import</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically process incoming emails and documents
                    </p>
                  </div>
                  <Switch
                    id="auto-import"
                    {...settingsForm.register('auto_import_enabled')}
                    disabled={!canEdit}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="smart-categorization">Smart Categorization</Label>
                    <p className="text-sm text-muted-foreground">
                      Let AI automatically categorize imported data
                    </p>
                  </div>
                  <Switch
                    id="smart-categorization"
                    {...settingsForm.register('smart_categorization')}
                    disabled={!canEdit}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="require-approval">Require Approval</Label>
                    <p className="text-sm text-muted-foreground">
                      Require manual approval before importing AI-extracted data
                    </p>
                  </div>
                  <Switch
                    id="require-approval"
                    {...settingsForm.register('require_approval_for_imports')}
                    disabled={!canEdit}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data & Privacy Settings
                </CardTitle>
                <CardDescription>
                  Control how your data is stored and who can access it
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="score-visibility">Compliance Score Visibility</Label>
                  <Select
                    value={settingsForm.watch('compliance_score_visibility')}
                    onValueChange={(value: 'admin_only' | 'all_members' | 'public') => 
                      settingsForm.setValue('compliance_score_visibility', value)
                    }
                    disabled={!canEdit}
                  >
                    <SelectTrigger id="score-visibility">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin_only">Admin Only</SelectItem>
                      <SelectItem value="all_members">All Members</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data-retention">Data Retention (Months)</Label>
                  <Input
                    id="data-retention"
                    type="number"
                    min={12}
                    max={120}
                    {...settingsForm.register('data_retention_months', { valueAsNumber: true })}
                    disabled={!canEdit}
                  />
                  <p className="text-xs text-muted-foreground">
                    How long to keep deleted records (minimum 12 months for compliance)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure organization-wide notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="reminder-frequency">Deadline Reminder Frequency</Label>
                  <Select
                    value={settingsForm.watch('deadline_reminder_frequency')}
                    onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                      settingsForm.setValue('deadline_reminder_frequency', value)
                    }
                    disabled={!canEdit}
                  >
                    <SelectTrigger id="reminder-frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {canEdit && (
              <div className="flex justify-end">
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </Button>
              </div>
            )}
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}