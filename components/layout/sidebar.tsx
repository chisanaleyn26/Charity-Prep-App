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
import { signOutAction } from '@/lib/actions/auth'
import { Tables } from '@/lib/types/database.types'
import { OrgSwitcher } from '@/features/organizations/components/org-switcher'

type Organization = Tables<'organizations'>

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
  organization?: Organization
}

export function Sidebar({ collapsed = false, onToggle, organization }: SidebarProps) {
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
      name: 'Compliance Chat',
      href: '/compliance/chat',
      icon: Bot,
      description: 'AI compliance assistant'
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
      badgeType: 'error' as const,
      description: 'Policies & certificates'
    },
  ]

  const aiFeatures = [
    {
      name: 'AI Assistant',
      href: '/ai-assistant',
      icon: Sparkles,
      description: 'Smart compliance help'
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
      name: 'Help & Support',
      href: '/help',
      icon: HelpCircle,
      description: 'Get assistance'
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
        collapsed ? 'w-20' : 'w-[280px]'
      )}
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-gray-100">
        <div className={cn(
          'transition-opacity duration-300',
          collapsed && 'opacity-0 w-0 overflow-hidden'
        )}>
          <Logo size="sm" />
        </div>
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <Menu className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Organization Switcher */}
      {!collapsed && (
        <div className="px-6 py-4 border-b border-gray-100">
          <OrgSwitcher />
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 px-6 py-6">
        <div className="space-y-2">
          {mainNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative',
                  isActive
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon className={cn(
                  'shrink-0',
                  collapsed ? 'h-6 w-6' : 'h-5 w-5',
                  isActive ? 'text-primary' : ''
                )} />
                <span className={cn(
                  'flex-1 transition-opacity duration-300',
                  collapsed && 'opacity-0 w-0 overflow-hidden'
                )}>
                  {item.name}
                </span>
                {item.badge && !collapsed && (
                  <span className={cn(
                    'px-2 py-0.5 text-xs font-medium rounded-full',
                    'bg-red-100 text-red-600'
                  )}>
                    {item.badge}
                  </span>
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

        {/* Reports Section */}
        <div className="mt-4">
          {/* Reports Main Item */}
          <button
            onClick={() => setReportsExpanded(!reportsExpanded)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative',
              (pathname?.startsWith('/reports') || pathname === '/reports/ai')
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <FileText className={cn(
              'shrink-0',
              collapsed ? 'h-6 w-6' : 'h-5 w-5',
              (pathname?.startsWith('/reports') || pathname === '/reports/ai') ? 'text-primary' : ''
            )} />
            <span className={cn(
              'flex-1 text-left transition-opacity duration-300',
              collapsed && 'opacity-0 w-0 overflow-hidden'
            )}>
              Reports
            </span>
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
            <div className="ml-8 mt-1 space-y-1">
              <Link
                href="/reports"
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm',
                  pathname === '/reports'
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <FileText className="h-4 w-4" />
                <span>Annual Returns</span>
              </Link>
              <Link
                href="/reports/ai"
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm',
                  pathname === '/reports/ai'
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Sparkles className="h-4 w-4" />
                <span>AI Reports</span>
              </Link>
              <Link
                href="/reports/export"
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm',
                  pathname === '/reports/export'
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Download className="h-4 w-4" />
                <span>Export Data</span>
              </Link>
            </div>
          )}
        </div>

        {/* AI Features Section */}
        {!collapsed && (
          <div className="mt-8">
            <p className="px-3 text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
              AI Features
            </p>
            <div className="space-y-1">
              {aiFeatures.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-100 p-6">
        <div className="space-y-1 mb-6">
          {bottomNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all group relative"
            >
              <item.icon className={cn(
                'shrink-0',
                collapsed ? 'h-6 w-6' : 'h-5 w-5'
              )} />
              <span className={cn(
                'flex-1 transition-opacity duration-300',
                collapsed && 'opacity-0 w-0 overflow-hidden'
              )}>
                {item.name}
              </span>
              {item.badge && !collapsed && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-600">
                  {item.badge}
                </span>
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

        {/* User Menu */}
        <div className={cn(
          'border-t border-gray-100 pt-4',
          collapsed && 'flex justify-center'
        )}>
          {collapsed ? (
            <button className="p-2 hover:bg-gray-100 rounded-md transition-colors group relative">
              <Users className="h-5 w-5 text-gray-600" />
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                Profile Menu
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
                <p className="text-xs text-gray-500 truncate">Trustee</p>
              </div>
              <form action={signOutAction}>
                <button 
                  type="submit"
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4 text-gray-500" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}