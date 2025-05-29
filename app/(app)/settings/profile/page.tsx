'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  User, Mail, Phone, Building, MapPin, Globe, 
  Camera, Shield, Bell, Palette, Download, Trash2,
  CheckCircle2, AlertCircle, Loader2, Save, ChevronLeft,
  Settings, Clock, MessageSquare, Smartphone, Slack
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useUserSettings } from '@/features/settings/hooks/use-user-settings'
import { useOrganization } from '@/features/organizations/components/organization-provider'
import { 
  updateUserProfile,
  updateUserPreferences,
  updateNotificationChannels,
  updateComplianceNotifications
} from '@/features/settings/actions/user-settings'
import { toast } from 'sonner'

// Validation schemas
const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  job_title: z.string().optional(),
  department: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  expertise_areas: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  linkedin_url: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  years_in_charity_sector: z.number().min(0).max(50).optional()
})

const preferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  language: z.string(),
  timezone: z.string(),
  date_format: z.string(),
  currency: z.string(),
  email_notifications: z.boolean(),
  sms_notifications: z.boolean(),
  weekly_digest: z.boolean(),
  marketing_emails: z.boolean(),
  product_updates: z.boolean(),
  ai_suggestions_enabled: z.boolean(),
  show_compliance_score: z.boolean(),
  dashboard_layout: z.enum(['standard', 'compact', 'detailed'])
})

const notificationChannelsSchema = z.object({
  sms: z.object({
    number: z.string().optional(),
    enabled: z.boolean()
  }),
  slack: z.object({
    channel: z.string().optional(),
    enabled: z.boolean(),
    webhook_url: z.string().optional()
  }),
  email: z.object({
    enabled: z.boolean()
  })
})

type ProfileFormData = z.infer<typeof profileSchema>
type PreferencesFormData = z.infer<typeof preferencesSchema>
type NotificationChannelsFormData = z.infer<typeof notificationChannelsSchema>

export default function ProfilePage() {
  const router = useRouter()
  const { currentOrganization } = useOrganization()
  const { userSettings, complianceNotifications, isLoading, refreshData } = useUserSettings()
  
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [isUpdating, setIsUpdating] = useState(false)

  // Forms
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: userSettings ? {
      full_name: userSettings.full_name || '',
      phone: userSettings.phone || '',
      job_title: userSettings.job_title || '',
      department: userSettings.department || '',
      bio: userSettings.bio || '',
      expertise_areas: userSettings.expertise_areas || [],
      certifications: userSettings.certifications || [],
      linkedin_url: userSettings.linkedin_url || '',
      years_in_charity_sector: userSettings.years_in_charity_sector || undefined
    } : undefined
  })

  const preferencesForm = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: userSettings?.preferences
  })

  const notificationForm = useForm<NotificationChannelsFormData>({
    resolver: zodResolver(notificationChannelsSchema),
    defaultValues: userSettings ? {
      sms: {
        number: userSettings.notification_channels.sms.number || '',
        enabled: userSettings.notification_channels.sms.enabled
      },
      slack: {
        channel: userSettings.notification_channels.slack.channel || '',
        enabled: userSettings.notification_channels.slack.enabled,
        webhook_url: userSettings.notification_channels.slack.webhook_url || ''
      },
      email: {
        enabled: userSettings.notification_channels.email.enabled
      }
    } : undefined
  })

  // Update forms when user settings load
  React.useEffect(() => {
    if (userSettings) {
      profileForm.reset({
        full_name: userSettings.full_name || '',
        phone: userSettings.phone || '',
        job_title: userSettings.job_title || '',
        department: userSettings.department || '',
        bio: userSettings.bio || '',
        expertise_areas: userSettings.expertise_areas || [],
        certifications: userSettings.certifications || [],
        linkedin_url: userSettings.linkedin_url || '',
        years_in_charity_sector: userSettings.years_in_charity_sector || undefined
      })

      preferencesForm.reset(userSettings.preferences)

      notificationForm.reset({
        sms: {
          number: userSettings.notification_channels.sms.number || '',
          enabled: userSettings.notification_channels.sms.enabled
        },
        slack: {
          channel: userSettings.notification_channels.slack.channel || '',
          enabled: userSettings.notification_channels.slack.enabled,
          webhook_url: userSettings.notification_channels.slack.webhook_url || ''
        },
        email: {
          enabled: userSettings.notification_channels.email.enabled
        }
      })
    }
  }, [userSettings, profileForm, preferencesForm, notificationForm])

  const handleProfileSubmit = async (data: ProfileFormData) => {
    if (!userSettings) return
    
    setIsUpdating(true)
    try {
      const result = await updateUserProfile(data)
      if (result.success) {
        await refreshData()
        toast.success('Profile updated successfully', {
          description: 'Your profile information has been saved.'
        })
        
        // Log the response for debugging
        console.log('Profile update response:', JSON.stringify(result, null, 2))
      } else {
        toast.error('Failed to update profile', {
          description: result.error || 'An unexpected error occurred'
        })
        console.error('Profile update error:', result)
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Failed to update profile', {
        description: 'An unexpected error occurred. Please try again.'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePreferencesSubmit = async (data: PreferencesFormData) => {
    if (!userSettings) return
    
    setIsUpdating(true)
    try {
      const result = await updateUserPreferences(data)
      if (result.success) {
        await refreshData()
        toast.success('Preferences updated successfully', {
          description: 'Your preferences have been saved.'
        })
        
        // Log the response for debugging
        console.log('Preferences update response:', JSON.stringify(result, null, 2))
      } else {
        toast.error('Failed to update preferences', {
          description: result.error || 'An unexpected error occurred'
        })
        console.error('Preferences update error:', result)
      }
    } catch (error) {
      console.error('Failed to update preferences:', error)
      toast.error('Failed to update preferences', {
        description: 'An unexpected error occurred. Please try again.'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleNotificationChannelsSubmit = async (data: NotificationChannelsFormData) => {
    if (!userSettings || !currentOrganization) return
    
    setIsUpdating(true)
    try {
      const result = await updateNotificationChannels(currentOrganization.id, {
        sms: {
          number: data.sms.number || null,
          enabled: data.sms.enabled,
          verified: false
        },
        slack: {
          channel: data.slack.channel || null,
          enabled: data.slack.enabled,
          webhook_url: data.slack.webhook_url || null
        },
        email: {
          address: userSettings.email,
          enabled: data.email.enabled,
          verified: userSettings.notification_channels.email.verified
        },
        teams: userSettings.notification_channels.teams,
        whatsapp: userSettings.notification_channels.whatsapp
      })
      if (result.success) {
        await refreshData()
        toast.success('Notification settings updated successfully', {
          description: 'Your notification preferences have been saved.'
        })
        
        // Log the response for debugging
        console.log('Notification channels update response:', JSON.stringify(result, null, 2))
      } else {
        toast.error('Failed to update notification settings', {
          description: result.error || 'An unexpected error occurred'
        })
        console.error('Notification channels update error:', result)
      }
    } catch (error) {
      console.error('Failed to update notification settings:', error)
      toast.error('Failed to update notification settings', {
        description: 'An unexpected error occurred. Please try again.'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      console.error('Please upload an image file')
      alert('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      console.error('Image must be less than 5MB')
      alert('Image must be less than 5MB')
      return
    }

    setUploadingAvatar(true)
    try {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Avatar updated successfully')
    } catch (error) {
      console.error('Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Account deletion requested. You will receive a confirmation email.')
      alert('Account deletion requested. You will receive a confirmation email.')
    } catch (error) {
      console.error('Failed to request account deletion')
    }
  }

  const handleExportData = async () => {
    try {
      // Simulate data export
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Your data export has been initiated. You will receive an email with the download link.')
      alert('Your data export has been initiated. You will receive an email with the download link.')
    } catch (error) {
      console.error('Failed to export data')
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

  if (!userSettings) {
    return (
      <div className="container max-w-4xl py-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load user settings. Please refresh the page or contact support.
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
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your personal information and preferences
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="data">Data & Privacy</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Avatar Section */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>
                  Upload a profile picture to personalize your account
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={userSettings.avatar_url || undefined} />
                  <AvatarFallback>
                    {(userSettings.full_name || userSettings.email).split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <Button 
                      variant="outline" 
                      disabled={uploadingAvatar}
                      asChild
                    >
                      <span>
                        {uploadingAvatar ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Camera className="h-4 w-4 mr-2" />
                        )}
                        {uploadingAvatar ? 'Uploading...' : 'Change Avatar'}
                      </span>
                    </Button>
                  </Label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                  />
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or GIF. Max size 5MB.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="full_name"
                          className="pl-9"
                          {...profileForm.register('full_name')}
                        />
                      </div>
                      {profileForm.formState.errors.full_name && (
                        <p className="text-sm text-destructive">
                          {profileForm.formState.errors.full_name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          className="pl-9"
                          value={userSettings.email}
                          disabled
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed. Contact support if you need to update your email.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          className="pl-9"
                          {...profileForm.register('phone')}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="job_title">Job Title</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="job_title"
                          className="pl-9"
                          {...profileForm.register('job_title')}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="department"
                        className="pl-9"
                        {...profileForm.register('department')}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="linkedin_url"
                        type="url"
                        className="pl-9"
                        placeholder="https://linkedin.com/in/yourprofile"
                        {...profileForm.register('linkedin_url')}
                      />
                    </div>
                    {profileForm.formState.errors.linkedin_url && (
                      <p className="text-sm text-destructive">
                        {profileForm.formState.errors.linkedin_url.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="years_in_charity_sector">Years in Charity Sector</Label>
                    <Input
                      id="years_in_charity_sector"
                      type="number"
                      min="0"
                      max="50"
                      {...profileForm.register('years_in_charity_sector', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      rows={4}
                      placeholder="Tell us about yourself..."
                      {...profileForm.register('bio')}
                    />
                    <p className="text-xs text-muted-foreground">
                      {profileForm.watch('bio')?.length || 0}/500 characters
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Save className="mr-2 h-4 w-4" />
                      Save Profile
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Organization Info */}
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
                <CardDescription>
                  Your organization membership
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{currentOrganization?.name || 'No Organization'}</p>
                    <p className="text-sm text-muted-foreground">
                      Member since {new Date(userSettings.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline">
                    Member
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <form onSubmit={preferencesForm.handleSubmit(handlePreferencesSubmit)}>
              {/* Notification Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                  </CardTitle>
                  <CardDescription>
                    Choose how you want to be notified
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      {...preferencesForm.register('email_notifications')}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sms-notifications">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive text messages for urgent updates
                      </p>
                    </div>
                    <Switch
                      id="sms-notifications"
                      {...preferencesForm.register('sms_notifications')}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="weekly-digest">Weekly Digest</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive a weekly summary of activity
                      </p>
                    </div>
                    <Switch
                      id="weekly-digest"
                      {...preferencesForm.register('weekly_digest')}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketing-emails">Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive product updates and newsletters
                      </p>
                    </div>
                    <Switch
                      id="marketing-emails"
                      {...preferencesForm.register('marketing_emails')}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="product-updates">Product Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Be notified about new features and improvements
                      </p>
                    </div>
                    <Switch
                      id="product-updates"
                      {...preferencesForm.register('product_updates')}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Appearance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Appearance
                  </CardTitle>
                  <CardDescription>
                    Customize how Charity Prep looks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select
                      value={preferencesForm.watch('theme')}
                      onValueChange={(value: 'light' | 'dark' | 'system') =>
                        preferencesForm.setValue('theme', value)
                      }
                    >
                      <SelectTrigger id="theme">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={preferencesForm.watch('language')}
                      onValueChange={(value) => preferencesForm.setValue('language', value)}
                    >
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={preferencesForm.watch('timezone')}
                      onValueChange={(value) => preferencesForm.setValue('timezone', value)}
                    >
                      <SelectTrigger id="timezone">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                        <SelectItem value="America/New_York">New York (EST)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Los Angeles (PST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dashboard-layout">Dashboard Layout</Label>
                    <Select
                      value={preferencesForm.watch('dashboard_layout')}
                      onValueChange={(value: 'standard' | 'compact' | 'detailed') =>
                        preferencesForm.setValue('dashboard_layout', value)
                      }
                    >
                      <SelectTrigger id="dashboard-layout">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Feature Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Features
                  </CardTitle>
                  <CardDescription>
                    Control which features are enabled
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="ai-suggestions">AI Suggestions</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable AI-powered suggestions and recommendations
                      </p>
                    </div>
                    <Switch
                      id="ai-suggestions"
                      {...preferencesForm.register('ai_suggestions_enabled')}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="compliance-score">Show Compliance Score</Label>
                      <p className="text-sm text-muted-foreground">
                        Display compliance score on dashboard
                      </p>
                    </div>
                    <Switch
                      id="compliance-score"
                      {...preferencesForm.register('show_compliance_score')}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </form>

            {/* Notification Channels */}
            <form onSubmit={notificationForm.handleSubmit(handleNotificationChannelsSubmit)}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Notification Channels
                  </CardTitle>
                  <CardDescription>
                    Configure how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>SMS Notifications</Label>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="+44 123 456 7890"
                            {...notificationForm.register('sms.number')}
                          />
                          <Switch {...notificationForm.register('sms.enabled')} />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Slack Integration</Label>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Slack className="h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="#compliance-alerts"
                            {...notificationForm.register('slack.channel')}
                          />
                          <Switch {...notificationForm.register('slack.enabled')} />
                        </div>
                        <Input
                          placeholder="Slack webhook URL"
                          {...notificationForm.register('slack.webhook_url')}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Channels
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Two-Factor Authentication</Label>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">2FA Enabled</p>
                        <p className="text-sm text-muted-foreground">
                          Your account is protected with 2FA
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Active Sessions</Label>
                  <Button variant="outline" className="w-full justify-start">
                    <Globe className="mr-2 h-4 w-4" />
                    View Active Sessions
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Login History */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Login Activity</CardTitle>
                <CardDescription>
                  Monitor access to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { location: 'London, UK', device: 'Chrome on Windows', time: '2 hours ago' },
                    { location: 'Manchester, UK', device: 'Safari on iPhone', time: '1 day ago' },
                    { location: 'Birmingham, UK', device: 'Chrome on MacOS', time: '3 days ago' }
                  ].map((login, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{login.location}</p>
                        <p className="text-xs text-muted-foreground">{login.device}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{login.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            {/* Data Export */}
            <Card>
              <CardHeader>
                <CardTitle>Export Your Data</CardTitle>
                <CardDescription>
                  Download a copy of your personal data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleExportData} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Request Data Export
                </Button>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control how your data is used
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="analytics">Usage Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Help improve Charity Prep by sharing usage data
                    </p>
                  </div>
                  <Switch id="analytics" defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="personalization">Personalization</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow AI to personalize your experience
                    </p>
                  </div>
                  <Switch id="personalization" defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Delete Account */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Delete Account</CardTitle>
                <CardDescription>
                  Permanently delete your account and all associated data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    This action cannot be undone. All your data will be permanently deleted.
                  </AlertDescription>
                </Alert>
                <Button
                  variant="destructive"
                  className="w-full mt-4"
                  onClick={handleDeleteAccount}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete My Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  )
}