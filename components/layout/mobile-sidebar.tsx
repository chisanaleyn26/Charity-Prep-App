'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/common/logo'
import { MobileDrawer } from '@/components/ui/mobile-drawer'
import { 
  LayoutDashboard, 
  Shield, 
  Globe, 
  Coins, 
  FileText, 
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Users,
  Bell,
  Sparkles,
  Calendar,
  Search,
  ChevronDown,
  ChevronRight,
  Bot,
  Download,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOutAction } from '@/lib/actions/auth'
import { Tables } from '@/lib/types/database.types'
import { OrgSwitcher } from '@/features/organizations/components/org-switcher'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Organization = Tables<'organizations'>

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
  organization?: Organization
}

export function MobileSidebar({ isOpen, onClose, organization }: MobileSidebarProps) {
  const pathname = usePathname()
  const [reportsExpanded, setReportsExpanded] = useState(pathname?.startsWith('/reports') || false)

  const mainNavigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      description: 'Overview & metrics'
    },
    {
      name: 'Search',
      href: '/search',
      icon: Search,
      description: 'Search all content'
    },
    {
      name: 'Safeguarding',
      href: '/compliance/safeguarding',
      icon: Shield,
      badge: '3',
      badgeType: 'warning' as const,
      description: 'DBS checks & policies'
    },
    {
      name: 'Overseas',
      href: '/compliance/overseas-activities',
      icon: Globe,
      description: 'International activities'
    },
    {
      name: 'Fundraising',
      href: '/compliance/fundraising',
      icon: Coins,
      badge: '1',
      badgeType: 'warning' as const,
      description: 'Campaigns & compliance'
    },
    {
      name: 'Compliance Score',
      href: '/compliance/score',
      icon: BarChart3,
      description: 'Overall compliance health'
    },
    {
      name: 'Smart Import',
      href: '/import',
      icon: Sparkles,
      badge: 'AI',
      badgeType: 'default' as const,
      description: 'Email & document import'
    },
    {
      name: 'Documents',
      href: '/documents',
      icon: FileText,
      badge: '2',
      badgeType: 'destructive' as const,
      description: 'Policies & certificates'
    },
  ]

  const reportsSubItems = [
    {
      name: 'Annual Returns',
      href: '/reports',
      icon: FileText,
      description: 'Generate annual returns'
    },
    {
      name: 'AI Reports',
      href: '/reports/ai',
      icon: Sparkles,
      description: 'AI-powered insights'
    },
    {
      name: 'Export Data',
      href: '/reports/export',
      icon: Download,
      description: 'Export compliance data'
    }
  ]

  const aiFeatures = [
    {
      name: 'Compliance Chat',
      href: '/compliance/chat',
      icon: Bot,
      badge: 'NEW',
      badgeType: 'default' as const,
      description: 'AI compliance assistant'
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: Calendar,
      description: 'Deadlines & reminders'
    }
  ]

  const bottomNavigation = [
    {
      name: 'Notifications',
      href: '/notifications',
      icon: Bell,
      badge: '5',
      badgeType: 'default' as const,
      description: 'Alerts & updates'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      description: 'Account & preferences'
    },
    {
      name: 'FAQ',
      href: '/help',
      icon: HelpCircle,
      description: 'Frequently asked questions'
    },
  ]

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'warning': return 'secondary'
      case 'destructive': return 'destructive'
      default: return 'default'
    }
  }

  const handleNavClick = () => {
    // Close drawer after navigation on mobile
    setTimeout(() => onClose(), 150)
  }

  return (
    <MobileDrawer
      isOpen={isOpen}
      onClose={onClose}
      position="left"
      size="md"
      className="flex flex-col"
      closeOnOverlayClick={true}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <Logo size="sm" />
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Organization Switcher */}
      <div className="p-4 border-b border-gray-100">
        <OrgSwitcher />
      </div>

      {/* Navigation Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Main Navigation */}
        <nav className="p-4">
          <div className="space-y-1">
            {mainNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-lg transition-all min-h-[48px] touch-manipulation',
                    isActive
                      ? 'bg-blue-50 text-blue-900 font-medium border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                  )}
                >
                  <item.icon className={cn(
                    'h-5 w-5 shrink-0',
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-xs text-gray-500 truncate">{item.description}</div>
                  </div>
                  {item.badge && (
                    <Badge variant={getBadgeVariant(item.badgeType)} size="sm">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Reports Section */}
          <div className="mt-6">
            <button
              onClick={() => setReportsExpanded(!reportsExpanded)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all min-h-[48px] touch-manipulation',
                (pathname?.startsWith('/reports') || pathname === '/reports/ai')
                  ? 'bg-blue-50 text-blue-900 font-medium border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
              )}
            >
              <FileText className={cn(
                'h-5 w-5 shrink-0',
                (pathname?.startsWith('/reports') || pathname === '/reports/ai') ? 'text-blue-600' : 'text-gray-500'
              )} />
              <div className="flex-1 text-left min-w-0">
                <div className="font-medium text-sm">Reports</div>
                <div className="text-xs text-gray-500">Generate & export reports</div>
              </div>
              {reportsExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </button>

            {/* Reports Sub-items */}
            {reportsExpanded && (
              <div className="ml-6 mt-2 space-y-1 border-l border-gray-200 pl-4">
                {reportsSubItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={handleNavClick}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all min-h-[44px] touch-manipulation',
                        isActive
                          ? 'bg-blue-50 text-blue-900 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
                      )}
                    >
                      <item.icon className={cn(
                        'h-4 w-4 shrink-0',
                        isActive ? 'text-blue-600' : 'text-gray-400'
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-gray-500 truncate">{item.description}</div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* AI Features Section */}
          <div className="mt-8">
            <div className="px-3 mb-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                AI Features
              </p>
            </div>
            <div className="space-y-1">
              {aiFeatures.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={handleNavClick}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-lg transition-all min-h-[48px] touch-manipulation',
                      isActive
                        ? 'bg-blue-50 text-blue-900 font-medium border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
                    )}
                  >
                    <item.icon className={cn(
                      'h-5 w-5 shrink-0',
                      isActive ? 'text-blue-600' : 'text-gray-400'
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-gray-500 truncate">{item.description}</div>
                    </div>
                    {item.badge && (
                      <Badge variant={getBadgeVariant(item.badgeType)} size="sm">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </nav>
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-100 p-4">
        <div className="space-y-1 mb-4">
          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg transition-all min-h-[48px] touch-manipulation',
                  isActive
                    ? 'bg-blue-50 text-blue-900 font-medium border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
                )}
              >
                <item.icon className={cn(
                  'h-5 w-5 shrink-0',
                  isActive ? 'text-blue-600' : 'text-gray-500'
                )} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-gray-500 truncate">{item.description}</div>
                </div>
                {item.badge && (
                  <Badge variant={getBadgeVariant(item.badgeType)} size="sm">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            )
          })}
        </div>

        {/* User Menu */}
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center gap-3 px-3 py-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 truncate">John Doe</p>
              <p className="text-xs text-gray-500 truncate">Trustee • {organization?.name}</p>
            </div>
          </div>
          
          <form action={signOutAction}>
            <button 
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 active:bg-red-100 transition-all min-h-[48px] touch-manipulation"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium text-sm">Sign Out</span>
            </button>
          </form>
        </div>
      </div>
    </MobileDrawer>
  )
}

// Mobile header component with menu toggle
interface MobileHeaderProps {
  onMenuToggle: () => void
  organization?: Organization
}

export function MobileHeader({ onMenuToggle, organization }: MobileHeaderProps) {
  const pathname = usePathname()
  
  // Get page title based on current route
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard'
    if (pathname?.startsWith('/compliance/safeguarding')) return 'Safeguarding'
    if (pathname?.startsWith('/compliance/overseas')) return 'Overseas Activities'
    if (pathname?.startsWith('/compliance/fundraising')) return 'Fundraising'
    if (pathname?.startsWith('/compliance/score')) return 'Compliance Score'
    if (pathname?.startsWith('/compliance/chat')) return 'Compliance Chat'
    if (pathname?.startsWith('/reports')) return 'Reports'
    if (pathname?.startsWith('/documents')) return 'Documents'
    if (pathname?.startsWith('/import')) return 'Smart Import'
    if (pathname?.startsWith('/search')) return 'Search'
    if (pathname?.startsWith('/settings')) return 'Settings'
    if (pathname?.startsWith('/notifications')) return 'Notifications'
    return 'Charity Prep'
  }

  return (
    <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuToggle}
          className="h-8 w-8 p-0"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-semibold text-gray-900 text-base">{getPageTitle()}</h1>
          {organization && (
            <p className="text-xs text-gray-500 truncate max-w-[200px]">{organization.name}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
          <Link href="/search">
            <Search className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative" asChild>
          <Link href="/notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
              5
            </span>
          </Link>
        </Button>
      </div>
    </header>
  )
}