'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  Shield, 
  Key, 
  Smartphone,
  Globe,
  Clock,
  CheckCircle2,
  AlertCircle,
  Lock,
  Unlock,
  ChevronLeft,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Info,
  LogOut
} from 'lucide-react'
import { toast } from 'sonner'

// Mock data for security settings
const mockSecurityData = {
  twoFactorEnabled: true,
  passwordLastChanged: '2024-01-15',
  sessions: [
    { id: '1', location: 'London, UK', device: 'Chrome on Windows', time: 'Active now', current: true },
    { id: '2', location: 'Manchester, UK', device: 'Safari on iPhone', time: '2 hours ago', current: false },
    { id: '3', location: 'Birmingham, UK', device: 'Chrome on MacOS', time: '1 day ago', current: false }
  ],
  loginHistory: [
    { id: '1', location: 'London, UK', device: 'Chrome on Windows', time: '2024-03-28 14:23', success: true },
    { id: '2', location: 'Unknown', device: 'Unknown', time: '2024-03-28 09:15', success: false },
    { id: '3', location: 'Manchester, UK', device: 'Safari on iPhone', time: '2024-03-27 18:45', success: true }
  ]
}

export default function SecuritySettingsPage() {
  const router = useRouter()
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handlePasswordChange = () => {
    toast.info('Password change functionality coming soon')
  }

  const handleEnable2FA = () => {
    toast.info('2FA setup functionality coming soon')
  }

  const handleDisable2FA = () => {
    if (confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      toast.success('Two-factor authentication disabled')
    }
  }

  const handleRevokeSession = (sessionId: string) => {
    toast.success('Session revoked successfully')
  }

  const handleRevokeAllSessions = () => {
    if (confirm('This will log you out of all devices except this one. Continue?')) {
      toast.success('All other sessions have been revoked')
    }
  }

  const handleDownloadRecoveryCodes = () => {
    toast.success('Recovery codes downloaded')
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
        <h1 className="text-3xl font-bold tracking-tight">Security & Privacy</h1>
        <p className="text-muted-foreground">
          Manage your account security and privacy settings
        </p>
      </div>

      <Tabs defaultValue="security" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          {/* Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Password
              </CardTitle>
              <CardDescription>
                Manage your account password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Current Password</p>
                  <p className="text-sm text-muted-foreground">
                    Last changed on {new Date(mockSecurityData.passwordLastChanged).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <Button variant="outline" onClick={handlePasswordChange}>
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockSecurityData.twoFactorEnabled ? (
                <>
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">2FA is enabled</p>
                        <p className="text-sm text-green-700">
                          Your account is protected with two-factor authentication
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Recovery Codes</p>
                        <p className="text-sm text-muted-foreground">
                          Use these codes to access your account if you lose your device
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowRecoveryCodes(!showRecoveryCodes)}
                      >
                        {showRecoveryCodes ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Hide Codes
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            View Codes
                          </>
                        )}
                      </Button>
                    </div>

                    {showRecoveryCodes && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Recovery Codes</AlertTitle>
                        <AlertDescription>
                          <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-sm">
                            <div>XXXX-XXXX-XXXX</div>
                            <div>YYYY-YYYY-YYYY</div>
                            <div>ZZZZ-ZZZZ-ZZZZ</div>
                            <div>AAAA-AAAA-AAAA</div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={handleDownloadRecoveryCodes}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download Codes
                          </Button>
                        </AlertDescription>
                      </Alert>
                    )}

                    <Separator />

                    <div className="flex justify-end">
                      <Button
                        variant="destructive"
                        onClick={handleDisable2FA}
                      >
                        Disable 2FA
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Two-factor authentication is not enabled</AlertTitle>
                    <AlertDescription>
                      Enable 2FA to add an extra layer of security to your account
                    </AlertDescription>
                  </Alert>
                  <Button onClick={handleEnable2FA}>
                    Enable Two-Factor Authentication
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          {/* Active Sessions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Active Sessions
                  </CardTitle>
                  <CardDescription>
                    Manage devices where you're currently logged in
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRevokeAllSessions}
                >
                  Revoke All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockSecurityData.sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                        <Globe className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {session.location}
                          {session.current && (
                            <Badge variant="default" className="text-xs">
                              This device
                            </Badge>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">{session.device}</p>
                        <p className="text-xs text-muted-foreground">{session.time}</p>
                      </div>
                    </div>
                    {!session.current && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeSession(session.id)}
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Login History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Login Activity
              </CardTitle>
              <CardDescription>
                Monitor access attempts to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockSecurityData.loginHistory.map((login) => (
                  <div key={login.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        login.success ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {login.success ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{login.location}</p>
                        <p className="text-sm text-muted-foreground">{login.device}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{login.time}</p>
                      <Badge variant={login.success ? 'default' : 'destructive'} className="text-xs">
                        {login.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Control how your data is used and shared
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="analytics">Usage Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Help improve Charity Prep by sharing anonymous usage data
                    </p>
                  </div>
                  <Switch id="analytics" defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="personalization">Personalization</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow AI to personalize your experience based on your usage
                    </p>
                  </div>
                  <Switch id="personalization" defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing">Marketing Communications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about new features and best practices
                    </p>
                  </div>
                  <Switch id="marketing" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Data Management
              </CardTitle>
              <CardDescription>
                Export or delete your personal data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">Export Your Data</p>
                  <p className="text-sm text-muted-foreground">
                    Download a copy of all your personal data
                  </p>
                </div>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
              </div>

              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Danger Zone</AlertTitle>
                <AlertDescription>
                  <p className="mb-4">
                    Deleting your account is permanent and cannot be undone. All your data will be lost.
                  </p>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}