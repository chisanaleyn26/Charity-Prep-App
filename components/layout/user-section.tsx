'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  LogOut, 
  User, 
  CreditCard, 
  Settings, 
  AlertTriangle,
  Crown,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Building2
} from 'lucide-react'
import { cn } from '@/lib/utils'
// Remove server action import - will handle signout client-side
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { useUserProfile } from '@/features/user/hooks/use-user-profile'
import { useSubscriptionStatus } from '@/features/subscription/hooks/use-subscription-status'
import { useOrganization } from '@/features/organizations/components/organization-provider'

interface UserSectionProps {
  collapsed?: boolean
}

export function UserSection({ collapsed = false }: UserSectionProps) {
  const { profile, isLoading: profileLoading, completionStatus } = useUserProfile()
  const { subscription, isLoading: subscriptionLoading, needsAttention, warningLevel } = useSubscriptionStatus()
  const { currentOrganization } = useOrganization()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  // Get user initials for avatar
  const getInitials = (name?: string, email?: string) => {
    if (name && name.trim()) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    if (email) {
      return email.slice(0, 2).toUpperCase()
    }
    return 'U'
  }

  // Get display name
  const getDisplayName = () => {
    if (profile?.full_name && profile.full_name.trim()) {
      return profile.full_name
    }
    if (profile?.email) {
      return profile.email.split('@')[0]
    }
    return 'User'
  }

  // Get user role in current organization
  const getUserRole = () => {
    if (profile?.job_title && profile.job_title.trim()) {
      return profile.job_title
    }
    return 'Member'
  }

  // Get subscription status badge
  const getSubscriptionBadge = () => {
    if (subscriptionLoading || !subscription) return null

    const getBadgeColor = () => {
      switch (warningLevel) {
        case 'critical': return 'destructive'
        case 'warning': return 'outline'
        case 'info': return 'secondary'
        default: return 'outline'
      }
    }

    const getBadgeText = () => {
      if (subscription.isTrialing) {
        const days = subscription.daysUntilExpiry
        return days !== null ? `Trial: ${days}d` : 'Trial'
      }
      if (subscription.tier) {
        return subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)
      }
      return 'Free'
    }

    return (
      <Badge variant={getBadgeColor()} className="text-xs">
        {getBadgeText()}
      </Badge>
    )
  }

  // Get warning icon
  const getWarningIcon = () => {
    if (needsAttention) {
      return (
        <AlertTriangle className={cn(
          "h-4 w-4",
          warningLevel === 'critical' ? "text-red-500" : "text-yellow-500"
        )} />
      )
    }
    return null
  }

  // Profile completion component
  const ProfileCompletion = () => {
    if (completionStatus.isComplete || collapsed) return null

    return (
      <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-blue-800">Profile</span>
          <span className="text-xs text-blue-600">{completionStatus.percentage}%</span>
        </div>
        <Progress value={completionStatus.percentage} className="h-1.5" />
        <p className="text-xs text-blue-600 mt-1">
          Complete your profile
        </p>
      </div>
    )
  }

  // Always render the structure, just change content based on loading state
  const userContent = profileLoading ? (
    <div className="animate-pulse">
      <div className={cn(
        collapsed ? "" : "flex items-center gap-3"
      )}>
        <div className="h-8 w-8 bg-gray-200 rounded-full" />
        <div className={cn(
          "space-y-1",
          collapsed ? "hidden" : "flex-1"
        )}>
          <div className="h-3 bg-gray-200 rounded w-20" />
          <div className="h-2 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  ) : null

  if (profileLoading) {
    return (
      <div className={cn(
        'border-t border-gray-100 p-6',
        collapsed && 'flex justify-center'
      )}>
        {userContent}
      </div>
    )
  }

  if (collapsed) {
    return (
      <div className="border-t border-gray-100 p-6 flex justify-center">
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative p-2 h-auto group">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(profile?.full_name, profile?.email)}
                </AvatarFallback>
              </Avatar>
              {(needsAttention || !completionStatus.isComplete) && (
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-400 rounded-full border border-white" />
              )}
              
              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {getDisplayName()}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {profile?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Profile Completion Status */}
            {!completionStatus.isComplete && (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/settings/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Complete Profile</span>
                    <Badge variant="outline" className="ml-auto">
                      {completionStatus.percentage}%
                    </Badge>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            {/* Menu Items */}
            <DropdownMenuItem asChild>
              <Link href="/settings/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link href="/settings/billing" className="flex items-center">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
                {getSubscriptionBadge()}
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={async () => {
                if (isSigningOut) return
                
                try {
                  setIsSigningOut(true)
                  const response = await fetch('/api/auth/signout', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    }
                  })
                  
                  if (response.ok) {
                    window.location.href = '/login'
                  } else {
                    console.error('Failed to sign out')
                    setIsSigningOut(false)
                  }
                } catch (error) {
                  console.error('Sign out error:', error)
                  setIsSigningOut(false)
                }
              }}
              className="cursor-pointer"
              disabled={isSigningOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <div className="border-t border-gray-100 p-6 space-y-4">
      {/* Profile Completion Banner */}
      <ProfileCompletion />

      {/* User Info */}
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full p-0 h-auto justify-start group">
            <div className="flex items-center gap-3 w-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="text-sm">
                  {getInitials(profile?.full_name, profile?.email)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {getDisplayName()}
                  </p>
                  {getWarningIcon()}
                </div>
                
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500 truncate">
                    {getUserRole()}
                  </p>
                  {getSubscriptionBadge()}
                </div>
              </div>
              
              <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuLabel>
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback>
                  {getInitials(profile?.full_name, profile?.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {profile?.email}
                </p>
                {currentOrganization && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Building2 className="h-3 w-3" />
                    <span className="truncate">{currentOrganization.name}</span>
                  </div>
                )}
              </div>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          {/* Subscription Status */}
          {subscription && (
            <>
              <div className="px-2 py-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Subscription</span>
                  {subscription.isTrialing ? (
                    <div className="flex items-center gap-1 text-blue-600">
                      <Clock className="h-3 w-3" />
                      <span>
                        {subscription.daysUntilExpiry !== null 
                          ? `${subscription.daysUntilExpiry} days left`
                          : 'Trial active'
                        }
                      </span>
                    </div>
                  ) : subscription.isActive ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      <span>Issue</span>
                    </div>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator />
            </>
          )}
          
          {/* Profile Completion Status */}
          {!completionStatus.isComplete && (
            <>
              <DropdownMenuItem asChild>
                <Link href="/settings/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span>Complete Profile</span>
                      <Badge variant="outline">{completionStatus.percentage}%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {completionStatus.missingFields.length} fields missing
                    </p>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {/* Menu Items */}
          <DropdownMenuItem asChild>
            <Link href="/settings/profile" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>Profile & Preferences</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/settings/billing" className="flex items-center">
              <CreditCard className="mr-2 h-4 w-4" />
              <div className="flex-1 flex items-center justify-between">
                <span>Billing & Subscription</span>
                {getSubscriptionBadge()}
              </div>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={async () => {
              if (isSigningOut) return
              
              try {
                setIsSigningOut(true)
                const response = await fetch('/api/auth/signout', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  }
                })
                
                if (response.ok) {
                  window.location.href = '/login'
                } else {
                  console.error('Failed to sign out')
                  setIsSigningOut(false)
                }
              } catch (error) {
                console.error('Sign out error:', error)
                setIsSigningOut(false)
              }
            }}
            className="cursor-pointer text-red-600 hover:text-red-700"
            disabled={isSigningOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}