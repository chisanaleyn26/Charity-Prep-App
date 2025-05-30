'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/common/logo'
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
  ChevronLeft,
  Menu,
  Users,
  Bell,
  Building2,
  Sparkles,
  Calendar,
  Search,
  ChevronDown,
  ChevronRight,
  Bot,
  Download
} from 'lucide-react'
import { cn } from '@/lib/utils'
// Remove server action import - will handle signout client-side
import { Tables } from '@/lib/types/database.types'
import { OrganizationBadge } from './organization-badge'
import { UserSection } from './user-section'
import { useNotificationCount } from '@/hooks/use-notification-count'

type Organization = Tables<'organizations'>

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
  organization?: Organization
}

export function Sidebar({ collapsed = false, onToggle, organization }: SidebarProps) {
  const pathname = usePathname()
  const [reportsExpanded, setReportsExpanded] = useState(pathname?.startsWith('/reports') || false)
  const [complianceExpanded, setComplianceExpanded] = useState(pathname?.startsWith('/compliance') || false)
  const notificationCount = useNotificationCount()

  // Compliance sub-items for consolidated navigation
  const complianceItems = [
    {
      name: 'Safeguarding',
      href: '/compliance/safeguarding',
      icon: Shield,
      badge: '3',
      badgeType: 'warning' as const,
      description: 'DBS checks & policies'
    },
    {
      name: 'Overseas Activities',
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
    }
  ]

  // Calculate total compliance badge count
  const getTotalComplianceBadges = () => {
    return complianceItems.reduce((sum, item) => {
      return sum + (item.badge ? parseInt(item.badge) : 0)
    }, 0)
  }

  // Check if any compliance route is active
  const isComplianceActive = complianceItems.some(item => pathname === item.href)

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
      name: 'Documents',
      href: '/documents',
      icon: FileText,
      badge: '2',
      badgeType: 'error' as const,
      description: 'Policies & certificates'
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: Calendar,
      description: 'Deadlines & reminders'
    },
  ]

  const aiFeatures = [
    {
      name: 'Compliance Chat',
      href: '/compliance/chat',
      icon: Bot,
      badge: 'NEW',
      badgeType: 'default' as const,
      description: 'AI compliance assistant'
    }
  ]

  const bottomNavigation = [
    {
      name: 'Notifications',
      href: '/notifications',
      icon: Bell,
      badge: notificationCount > 0 ? notificationCount.toString() : undefined,
      badgeType: 'default' as const,
      description: 'Alerts & updates'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      description: 'Account & preferences'
    },
  ]

  const badgeColors = {
    default: 'bg-mist-200 text-mist-700',
    warning: 'bg-warning/20 text-warning-dark',
    error: 'bg-error/20 text-error-dark'
  }

  return (
    <aside 
      className={cn(
        'h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Fixed Header */}
      <div className="flex-shrink-0">
        <div className="p-4 flex items-center justify-between border-b border-gray-100">
          {!collapsed && (
            <Logo size="sm" />
          )}
          <button
            onClick={onToggle}
            className={cn(
              'p-2 hover:bg-gray-100 rounded-md transition-colors',
              collapsed && 'mx-auto'
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <Menu className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>

        {/* Organization Badge */}
        {!collapsed && (
          <div className="px-4 py-3 border-b border-gray-100">
            <OrganizationBadge />
          </div>
        )}
      </div>

      {/* Scrollable Navigation Area - FIXED HEIGHT */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <nav className="p-4 space-y-1">
          <div className="space-y-2">
          {mainNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center rounded-lg transition-all group relative h-9',
                  collapsed 
                    ? 'justify-center px-2'
                    : 'gap-3 px-3',
                  isActive
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                {collapsed ? (
                  <item.icon className={cn(
                    'h-4 w-4',
                    isActive ? 'text-gray-900' : ''
                  )} />
                ) : (
                  <>
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      <item.icon className={cn(
                        'h-4 w-4',
                        isActive ? 'text-gray-900' : ''
                      )} />
                    </div>
                    <span className="flex-1 text-sm font-medium">
                      {item.name}
                    </span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-600">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                
                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.name}
                    {item.badge && (
                      <span className="ml-2 text-xs">({item.badge})</span>
                    )}
                  </div>
                )}
              </Link>
            )
          })}
        </div>

        {/* Compliance Section */}
        <div className="mt-1">
          {/* Compliance Main Item */}
          <button
            onClick={() => {
              if (!complianceExpanded) {
                setReportsExpanded(false) // Close reports when opening compliance
              }
              setComplianceExpanded(!complianceExpanded)
            }}
            className={cn(
              'w-full flex items-center rounded-lg transition-all group relative',
              collapsed 
                ? 'justify-center px-2 py-2'
                : 'gap-3 px-3 py-1.5',
              isComplianceActive
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            {collapsed ? (
              <Shield className={cn(
                'h-4 w-4',
                isComplianceActive ? 'text-gray-900' : ''
              )} />
            ) : (
              <>
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  <Shield className={cn(
                    'h-4 w-4',
                    isComplianceActive ? 'text-gray-900' : ''
                  )} />
                </div>
                <span className="flex-1 text-left text-sm font-medium">
                  Compliance
                </span>
              </>
            )}
            {!collapsed && (
              complianceExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )
            )}
            {/* Badge for total compliance issues */}
            {getTotalComplianceBadges() > 0 && (
              <span className={cn(
                'px-2 py-0.5 text-xs font-medium rounded-full',
                'bg-red-100 text-red-600',
                collapsed ? 'hidden' : 'inline-flex'
              )}>
                {getTotalComplianceBadges()}
              </span>
            )}
            
            {/* Tooltip for collapsed state */}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                Compliance
                {getTotalComplianceBadges() > 0 && (
                  <span className="ml-2 text-xs">({getTotalComplianceBadges()})</span>
                )}
              </div>
            )}
          </button>

          {/* Compliance Sub-items */}
          {complianceExpanded && !collapsed && (
            <div className="ml-6 mt-1 space-y-0.5">
              {complianceItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1 rounded-lg transition-all text-sm',
                      isActive
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="flex-1 text-sm font-medium">{item.name}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-600">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Reports Section */}
        <div className="mt-1">
          {/* Reports Main Item */}
          <button
            onClick={() => {
              if (!reportsExpanded) {
                setComplianceExpanded(false) // Close compliance when opening reports
              }
              setReportsExpanded(!reportsExpanded)
            }}
            className={cn(
              'w-full flex items-center rounded-lg transition-all group relative',
              collapsed 
                ? 'justify-center px-2 py-2'
                : 'gap-3 px-3 py-1.5',
              (pathname?.startsWith('/reports') || pathname === '/reports/ai')
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            {collapsed ? (
              <FileText className={cn(
                'h-4 w-4',
                (pathname?.startsWith('/reports') || pathname === '/reports/ai') ? 'text-gray-900' : ''
              )} />
            ) : (
              <>
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  <FileText className={cn(
                    'h-4 w-4',
                    (pathname?.startsWith('/reports') || pathname === '/reports/ai') ? 'text-gray-900' : ''
                  )} />
                </div>
                <span className="flex-1 text-left text-sm font-medium">
                  Reports
                </span>
              </>
            )}
            {!collapsed && (
              reportsExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )
            )}
            
            {/* Tooltip for collapsed state */}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                Reports
              </div>
            )}
          </button>

          {/* Reports Sub-items */}
          {reportsExpanded && !collapsed && (
            <div className="ml-6 mt-1 space-y-0.5">
              <Link
                href="/reports"
                className={cn(
                  'flex items-center gap-2 px-3 py-1 rounded-lg transition-all text-sm',
                  pathname === '/reports'
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">All Reports</span>
              </Link>
              <Link
                href="/reports/ai"
                className={cn(
                  'flex items-center gap-2 px-3 py-1 rounded-lg transition-all text-sm',
                  pathname === '/reports/ai'
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">AI Reports</span>
              </Link>
              <Link
                href="/reports/export"
                className={cn(
                  'flex items-center gap-2 px-3 py-1 rounded-lg transition-all text-sm',
                  pathname === '/reports/export'
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Download className="h-4 w-4" />
                <span className="text-sm font-medium">Export Data</span>
              </Link>
            </div>
          )}
        </div>

        {/* AI Features Section */}
        {aiFeatures.length > 0 && (
          <div className="mt-1">
            {!collapsed && (
              <p className="px-3 text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                AI Features
              </p>
            )}
            <div className="space-y-1">
              {aiFeatures.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center rounded-lg transition-all group relative h-9',
                      collapsed 
                        ? 'justify-center px-2'
                        : 'gap-3 px-3',
                      isActive
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    {collapsed ? (
                      <item.icon className={cn(
                        'h-4 w-4',
                        isActive ? 'text-gray-900' : ''
                      )} />
                    ) : (
                      <>
                        <div className="w-4 h-4 flex items-center justify-center shrink-0">
                          <item.icon className={cn(
                            'h-4 w-4',
                            isActive ? 'text-gray-900' : ''
                          )} />
                        </div>
                        <span className="flex-1 text-sm font-medium">{item.name}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-600">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    
                    {/* Tooltip for collapsed state */}
                    {collapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                        {item.name}
                        {item.badge && (
                          <span className="ml-2 text-xs">({item.badge})</span>
                        )}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
        </nav>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="flex-shrink-0 border-t border-gray-100 p-4">
        <div className="space-y-1 mb-4">
          {bottomNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all group relative h-9',
                collapsed 
                  ? 'justify-center px-2'
                  : 'gap-3 px-3'
              )}
            >
              {collapsed ? (
                <item.icon className="h-4 w-4" />
              ) : (
                <>
                  <div className="w-4 h-4 flex items-center justify-center shrink-0">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="flex-1 text-sm font-medium">
                    {item.name}
                  </span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-600">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Dynamic User Section */}
        <UserSection collapsed={collapsed} />
      </div>
    </aside>
  )
}