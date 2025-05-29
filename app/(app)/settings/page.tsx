'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User, 
  CreditCard, 
  Shield, 
  Bell, 
  Palette, 
  Building2,
  Users,
  Key,
  Globe,
  Database,
  Settings2,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  Zap,
  Lock,
  Mail,
  Phone,
  Crown,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUserProfile } from '@/features/user/hooks/use-user-profile'
import { useSubscriptionStatus } from '@/features/subscription/hooks/use-subscription-status'
import { useOrganization } from '@/features/organizations/components/organization-provider'
import { useAuthStore } from '@/stores/auth-store'

interface SettingCard {
  id: string
  title: string
  description: string
  icon: React.ElementType
  href: string
  badge?: string
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
  status?: 'complete' | 'incomplete' | 'attention' | 'info'
  quickStats?: Array<{
    label: string
    value: string | number
    icon?: React.ElementType
  }>
}

export default function SettingsPage() {
  const router = useRouter()
  const { profile, completionStatus } = useUserProfile()
  const { subscription, warningLevel } = useSubscriptionStatus()
  const { currentOrganization, organizations } = useOrganization()
  const { getCurrentUserRole } = useAuthStore()
  
  const userRole = getCurrentUserRole()
  const isAdmin = userRole === 'admin'

  // Profile completion badge
  const getProfileBadge = () => {
    if (!completionStatus) return null
    if (completionStatus.isComplete) {
      return { text: 'Complete', variant: 'default' as const }
    }
    if (completionStatus.percentage >= 70) {
      return { text: `${completionStatus.percentage}%`, variant: 'secondary' as const }
    }
    return { text: `${completionStatus.percentage}%`, variant: 'destructive' as const }
  }

  // Subscription badge
  const getSubscriptionBadge = () => {
    if (!subscription) return null
    
    if (warningLevel === 'critical') {
      return { text: 'Action Required', variant: 'destructive' as const }
    }
    if (warningLevel === 'warning') {
      return { text: 'Attention', variant: 'outline' as const }
    }
    if (subscription.isTrialing) {
      return { 
        text: `Trial: ${subscription.daysUntilExpiry}d left`, 
        variant: 'secondary' as const 
      }
    }
    if (subscription.tier) {
      return { 
        text: subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1), 
        variant: 'default' as const 
      }
    }
    return { text: 'Free', variant: 'outline' as const }
  }

  const profileBadge = getProfileBadge()
  const subscriptionBadge = getSubscriptionBadge()

  const settingsSections: SettingCard[] = [
    {
      id: 'profile',
      title: 'Profile & Preferences',
      description: 'Manage your personal information, notifications, and app preferences',
      icon: User,
      href: '/settings/profile',
      badge: profileBadge?.text,
      badgeVariant: profileBadge?.variant,
      status: completionStatus?.isComplete ? 'complete' : 'incomplete',
      quickStats: [
        {
          label: 'Profile',
          value: completionStatus?.isComplete ? 'Complete' : `${completionStatus?.percentage || 0}% done`,
          icon: completionStatus?.isComplete ? CheckCircle : AlertCircle
        },
        {
          label: 'Notifications',
          value: 'Enabled',
          icon: Bell
        }
      ]
    },
    {
      id: 'billing',
      title: 'Billing & Subscription',
      description: 'Manage your subscription plan, payment methods, and invoices',
      icon: CreditCard,
      href: '/settings/billing',
      badge: subscriptionBadge?.text,
      badgeVariant: subscriptionBadge?.variant,
      status: warningLevel === 'critical' ? 'attention' : 'info',
      quickStats: [
        {
          label: 'Plan',
          value: subscription?.tier || 'Free',
          icon: Crown
        },
        {
          label: 'Status',
          value: subscription?.isActive ? 'Active' : subscription?.isTrialing ? 'Trial' : 'Inactive',
          icon: subscription?.isActive || subscription?.isTrialing ? CheckCircle : AlertCircle
        }
      ]
    },
    {
      id: 'organization',
      title: 'Organization Settings',
      description: 'Manage organization details, team members, and permissions',
      icon: Building2,
      href: '/settings/organization',
      badge: isAdmin ? 'Admin' : 'View Only',
      badgeVariant: isAdmin ? 'default' : 'secondary',
      status: 'info',
      quickStats: [
        {
          label: 'Organization',
          value: currentOrganization?.name || 'None',
          icon: Building2
        },
        {
          label: 'Your Role',
          value: userRole || 'Member',
          icon: Users
        }
      ]
    },
    {
      id: 'team',
      title: 'Team Management',
      description: 'Invite team members, manage roles, and track team activity',
      icon: Users,
      href: '/settings/team',
      badge: isAdmin ? 'Manage' : 'View',
      badgeVariant: isAdmin ? 'default' : 'secondary',
      status: 'info',
      quickStats: [
        {
          label: 'Team Size',
          value: organizations[0]?.member_count || 1,
          icon: Users
        },
        {
          label: 'Your Role',
          value: userRole || 'Member',
          icon: Shield
        }
      ]
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      description: 'Manage your account security, privacy settings, and data',
      icon: Shield,
      href: '/settings/security',
      status: 'complete',
      quickStats: [
        {
          label: 'Security',
          value: '2FA Active',
          icon: Lock
        },
        {
          label: 'Last Login',
          value: 'Today',
          icon: Clock
        }
      ]
    },
    {
      id: 'integrations',
      title: 'Integrations & API',
      description: 'Connect third-party services and manage API access',
      icon: Zap,
      href: '/settings/integrations',
      badge: 'Coming Soon',
      badgeVariant: 'secondary',
      status: 'info',
      quickStats: [
        {
          label: 'Connected',
          value: 0,
          icon: Globe
        },
        {
          label: 'API Keys',
          value: 0,
          icon: Key
        }
      ]
    },
    {
      id: 'data',
      title: 'Data Management',
      description: 'Export your data, manage backups, and control data retention',
      icon: Database,
      href: '/settings/data',
      status: 'info',
      quickStats: [
        {
          label: 'Storage Used',
          value: '125 MB',
          icon: Database
        },
        {
          label: 'Last Backup',
          value: 'Yesterday',
          icon: Clock
        }
      ]
    }
  ]

  // Filter sections based on user role
  const availableSections = settingsSections.filter(section => {
    // Non-admins can't access organization settings (write access)
    if (section.id === 'organization' && !isAdmin) {
      return false // Or modify to show read-only version
    }
    return true
  })

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'incomplete':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'attention':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getCardClassName = (status?: string) => {
    return cn(
      "group hover:shadow-lg transition-all duration-300 border-2",
      status === 'attention' && "border-red-200 hover:border-red-300",
      status === 'incomplete' && "border-yellow-200 hover:border-yellow-300",
      status === 'complete' && "border-gray-200 hover:border-green-300",
      (!status || status === 'info') && "border-gray-200 hover:border-primary/30"
    )
  }

  return (
    <div className="container max-w-6xl py-6 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account, organization, and app preferences
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {!completionStatus?.isComplete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/settings/profile')}
              className="gap-2"
            >
              <User className="h-4 w-4" />
              Complete Profile
              <Badge variant="secondary" className="ml-1">
                {completionStatus?.percentage || 0}%
              </Badge>
            </Button>
          )}
          
          {warningLevel === 'critical' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => router.push('/settings/billing')}
              className="gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Fix Billing Issue
            </Button>
          )}
        </div>
      </div>

      {/* Status Alerts */}
      {warningLevel === 'critical' && subscription && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {subscription.hasPaymentIssue 
              ? 'Your subscription has a payment issue. Please update your payment method.'
              : subscription.isTrialing && subscription.daysUntilExpiry !== null && subscription.daysUntilExpiry <= 2
              ? `Your trial expires in ${subscription.daysUntilExpiry} days. Upgrade to continue using premium features.`
              : 'Your subscription needs attention.'}
          </AlertDescription>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => router.push('/settings/billing')}
          >
            Resolve Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Alert>
      )}

      {/* Settings Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {availableSections.map((section) => {
          const SectionIcon = section.icon
          
          return (
            <Card
              key={section.id}
              className={getCardClassName(section.status)}
            >
              <Link href={section.href} className="block">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        section.status === 'attention' && "bg-red-100",
                        section.status === 'incomplete' && "bg-yellow-100",
                        section.status === 'complete' && "bg-green-100",
                        (!section.status || section.status === 'info') && "bg-gray-100"
                      )}>
                        <SectionIcon className={cn(
                          "h-5 w-5",
                          section.status === 'attention' && "text-red-600",
                          section.status === 'incomplete' && "text-yellow-600",
                          section.status === 'complete' && "text-green-600",
                          (!section.status || section.status === 'info') && "text-gray-600"
                        )} />
                      </div>
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {section.title}
                          {getStatusIcon(section.status)}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {section.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {section.badge && (
                        <Badge variant={section.badgeVariant}>
                          {section.badge}
                        </Badge>
                      )}
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                  </div>
                </CardHeader>
                
                {section.quickStats && (
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {section.quickStats.map((stat, index) => {
                        const StatIcon = stat.icon
                        return (
                          <div key={index} className="flex items-center gap-2">
                            {StatIcon && <StatIcon className="h-4 w-4 text-gray-500" />}
                            <div className="text-sm">
                              <span className="text-gray-500">{stat.label}:</span>{' '}
                              <span className="font-medium">{stat.value}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                )}
              </Link>
            </Card>
          )
        })}
      </div>

      {/* Account Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Account Overview
          </CardTitle>
          <CardDescription>
            Quick summary of your account status and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Profile Completion */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Profile Completion</span>
                <span className="text-sm text-muted-foreground">
                  {completionStatus?.percentage || 0}%
                </span>
              </div>
              <Progress value={completionStatus?.percentage || 0} className="h-2" />
              {completionStatus && !completionStatus.isComplete && (
                <p className="text-xs text-muted-foreground">
                  {completionStatus.missingFields.length} fields remaining
                </p>
              )}
            </div>

            {/* Organization Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Organization</span>
                {organizations.length > 1 && (
                  <Badge variant="secondary">{organizations.length} orgs</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {currentOrganization?.name || 'No organization'}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                Role: {userRole || 'Member'}
              </p>
            </div>

            {/* Account Created */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Account Status</span>
                <Badge variant="default">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Member since {profile?.created_at 
                  ? new Date(profile.created_at).toLocaleDateString('en-GB', {
                      month: 'long',
                      year: 'numeric'
                    })
                  : 'Unknown'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <div className="border rounded-lg p-6 bg-gray-50">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Star className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Need help with settings?</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Check out our settings guide or contact support for assistance.
            </p>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/help/settings-guide">
                  View Guide
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/help/contact">
                  Contact Support
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}