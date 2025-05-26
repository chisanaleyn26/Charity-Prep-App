'use client'

import React from 'react'
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
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()

  const mainNavigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      description: 'Overview & metrics'
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
      name: 'Documents',
      href: '/documents',
      icon: FileText,
      badge: '2',
      badgeType: 'error' as const,
      description: 'Policies & certificates'
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: FileText,
      description: 'Annual returns & exports'
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
        'h-screen bg-gunmetal text-white flex flex-col transition-all duration-300',
        collapsed ? 'w-20' : 'w-[280px]'
      )}
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-white/10">
        <div className={cn(
          'transition-opacity duration-300',
          collapsed && 'opacity-0 w-0 overflow-hidden'
        )}>
          <Logo variant="white" size="sm" />
        </div>
        <button
          onClick={onToggle}
          className="p-2 hover:bg-white/10 rounded-md transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <Menu className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Organization Selector */}
      {!collapsed && (
        <div className="px-3 py-4 border-b border-white/10">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/10 transition-colors">
            <Building2 className="h-5 w-5 text-mist-300" />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">St. Mary&apos;s Trust</p>
              <p className="text-xs text-mist-400">Charity No. 1234567</p>
            </div>
            <ChevronLeft className="h-4 w-4 rotate-180 text-mist-400" />
          </button>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {mainNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md transition-all group relative',
                  isActive
                    ? 'bg-primary text-gunmetal font-medium'
                    : 'text-mist-300 hover:bg-white/10 hover:text-white'
                )}
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
                  <span className={cn(
                    'px-2 py-0.5 text-xs font-medium rounded-full',
                    badgeColors[item.badgeType || 'default']
                  )}>
                    {item.badge}
                  </span>
                )}
                
                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gunmetal text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
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

        {/* AI Features Section */}
        {!collapsed && (
          <div className="mt-6">
            <p className="px-3 text-xs font-medium text-mist-400 uppercase tracking-wider">
              AI Features
            </p>
            <div className="mt-2 space-y-1">
              {aiFeatures.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md text-mist-300 hover:bg-white/10 hover:text-white transition-all"
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
      <div className="border-t border-white/10 p-3">
        <div className="space-y-1 mb-4">
          {bottomNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-mist-300 hover:bg-white/10 hover:text-white transition-all group relative"
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
                <span className={cn(
                  'px-2 py-0.5 text-xs font-medium rounded-full',
                  badgeColors[item.badgeType || 'default']
                )}>
                  {item.badge}
                </span>
              )}
              
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gunmetal text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* User Menu */}
        <div className={cn(
          'border-t border-white/10 pt-4',
          collapsed && 'flex justify-center'
        )}>
          {collapsed ? (
            <button className="p-2 hover:bg-white/10 rounded-md transition-colors group relative">
              <Users className="h-5 w-5 text-mist-300" />
              <div className="absolute left-full ml-2 px-2 py-1 bg-gunmetal text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                Profile Menu
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-gunmetal font-semibold">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">John Doe</p>
                <p className="text-xs text-mist-400 truncate">Trustee</p>
              </div>
              <button 
                className="p-1 hover:bg-white/10 rounded transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4 text-mist-300" />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}