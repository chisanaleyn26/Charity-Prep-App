'use client'

import { useState } from 'react'
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
// import { toast } from 'sonner'
import { 
  User, Mail, Phone, Building, MapPin, Globe, 
  Camera, Shield, Bell, Palette, Download, Trash2,
  CheckCircle2, AlertCircle, Loader2
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { appConfig } from '@/lib/config'
import { useUserProfile } from '@/features/user/hooks/use-user-profile'
import { useOrganization } from '@/features/organizations/components/organization-provider'

// Validation schema
const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  job_title: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

// Mock user data
const mockUserData = {
  id: 'user-123',
  full_name: 'Sarah Thompson',
  email: 'sarah@charityexample.org',
  phone: '+44 20 1234 5678',
  job_title: 'Compliance Officer',
  bio: 'Passionate about helping charities maintain compliance and achieve their missions.',
  avatar_url: null,
  created_at: '2024-01-15T10:00:00Z',
  organization: {
    id: 'org-123',
    name: 'Example Charity Foundation',
    role: 'admin'
  },
  preferences: {
    email_notifications: true,
    sms_notifications: false,
    marketing_emails: false,
    theme: 'light',
    language: 'en'
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  
  // Use real user data
  const { profile, updateProfile, isLoading: profileLoading, completionStatus } = useUserProfile()
  const { currentOrganization } = useOrganization()

  // Fallback to mock data if profile is not loaded
  const userData = profile ? {
    id: profile.id,
    full_name: profile.full_name || '',
    email: profile.email,
    phone: profile.phone || '',
    job_title: profile.job_title || '',
    bio: profile.bio || '',
    avatar_url: profile.avatar_url || null,
    created_at: profile.created_at,
    organization: {
      id: currentOrganization?.id || '',
      name: currentOrganization?.name || 'Unknown Organization',
      role: 'member' // This would come from membership data
    },
    preferences: {
      email_notifications: true,
      sms_notifications: false,
      marketing_emails: false,
      theme: 'light',
      language: 'en'
    }
  } : (appConfig.features.mockMode ? mockUserData : mockUserData)

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: userData.full_name,
      email: userData.email,
      phone: userData.phone || '',
      job_title: userData.job_title || '',
      bio: userData.bio || ''
    }
  })

  const handleProfileSubmit = async (data: ProfileFormData) => {
    if (!updateProfile) return
    
    try {
      const success = await updateProfile(data)
      if (success) {
        console.log('Profile updated successfully')
        // Could show success toast here
      } else {
        console.error('Failed to update profile')
        // Could show error toast here
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
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

  return (
      <div className="container max-w-4xl py-6 space-y-6">
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
                  <AvatarImage src={userData.avatar_url || undefined} />
                  <AvatarFallback>
                    {userData.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
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
                <form onSubmit={form.handleSubmit(handleProfileSubmit)} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="full_name"
                          className="pl-9"
                          {...form.register('full_name')}
                        />
                      </div>
                      {form.formState.errors.full_name && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.full_name.message}
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
                          {...form.register('email')}
                        />
                      </div>
                      {form.formState.errors.email && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.email.message}
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
                          {...form.register('phone')}
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
                          {...form.register('job_title')}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      rows={4}
                      placeholder="Tell us about yourself..."
                      {...form.register('bio')}
                    />
                    <p className="text-xs text-muted-foreground">
                      {form.watch('bio')?.length || 0}/500 characters
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={profileLoading}>
                      {profileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
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
                    <p className="font-medium">{userData.organization.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Member since {new Date(userData.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {userData.organization.role}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Choose how you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    defaultChecked={userData.preferences.email_notifications}
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
                    defaultChecked={userData.preferences.sms_notifications}
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
                    defaultChecked={userData.preferences.marketing_emails}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how Charity Prep looks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select defaultValue={userData.preferences.theme}>
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
                  <Select defaultValue={userData.preferences.language}>
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
              </CardContent>
            </Card>
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