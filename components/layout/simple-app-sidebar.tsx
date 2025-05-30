'use client'

import * as React from "react"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Shield, 
  Globe, 
  Coins, 
  FileText, 
  BarChart3,
  Settings,
  Bell,
  Calendar,
  Search,
  Bot,
  Download,
  Sparkles,
  ChevronRight,
  PanelLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { OrganizationBadge } from './organization-badge'
import { UserSection } from './user-section'
import { useNotificationCount } from '@/hooks/use-notification-count'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

// Simple sidebar without complex shadcn provider
interface SimpleAppSidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function SimpleAppSidebar({ collapsed = false, onToggle }: SimpleAppSidebarProps) {
  const pathname = usePathname()
  const notificationCount = useNotificationCount()

  // Navigation data with descriptions
  const mainNavigation = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
      description: 'Overview & metrics'
    },
    {
      title: 'Search',
      url: '/search',
      icon: Search,
      description: 'Search all content'
    },
    {
      title: 'Documents',
      url: '/documents',
      icon: FileText,
      badge: '2',
      description: 'Policies & certificates'
    },
    {
      title: 'Calendar',
      url: '/calendar',
      icon: Calendar,
      description: 'Deadlines & reminders'
    },
  ]

  const complianceItems = [
    {
      title: 'Safeguarding',
      url: '/compliance/safeguarding',
      icon: Shield,
      badge: '3',
      description: 'DBS checks & policies'
    },
    {
      title: 'Overseas Activities',
      url: '/compliance/overseas-activities',
      icon: Globe,
      description: 'International activities'
    },
    {
      title: 'Fundraising',
      url: '/compliance/fundraising',
      icon: Coins,
      badge: '1',
      description: 'Campaigns & compliance'
    },
    {
      title: 'Compliance Score',
      url: '/compliance/score',
      icon: BarChart3,
      description: 'Overall compliance health'
    }
  ]

  const reportsItems = [
    {
      title: 'All Reports',
      url: '/reports',
      icon: FileText,
      description: 'Generate annual returns'
    },
    {
      title: 'AI Reports',
      url: '/reports/ai',
      icon: Sparkles,
      description: 'AI-powered insights'
    },
    {
      title: 'Export Data',
      url: '/reports/export',
      icon: Download,
      description: 'Export compliance data'
    }
  ]

  const aiFeatures = [
    {
      title: 'Compliance Chat',
      url: '/compliance/chat',
      icon: Bot,
      badge: 'NEW',
      description: 'AI compliance assistant'
    }
  ]

  // Calculate compliance badge total
  const getTotalComplianceBadges = () => {
    return complianceItems.reduce((sum, item) => {
      return sum + (item.badge ? parseInt(item.badge) : 0)
    }, 0)
  }

  // Check active states
  const isComplianceActive = complianceItems.some(item => pathname === item.url)
  const isReportsActive = reportsItems.some(item => pathname === item.url) || pathname === '/reports'

  return (
    <aside 
      className={cn(
        'h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
      suppressHydrationWarning
    >
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-100">
        <div className="p-4 flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#B1FA63] rounded-lg flex items-center justify-center">
                <span className="text-[#243837] font-bold text-lg">C</span>
              </div>
              <span className="text-[#243837] font-semibold text-lg tracking-tight">Charity Prep</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn("h-8 w-8", collapsed && "mx-auto")}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        </div>
        
        {!collapsed && (
          <div className="px-4 pb-4">
            <OrganizationBadge />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
        {/* Main Navigation */}
        <div className="space-y-1">
          {mainNavigation.map((item) => {
            const isActive = pathname === item.url
            return (
              <Link
                key={item.title}
                href={item.url}
                className={cn(
                  'flex items-center rounded-lg transition-all h-9',
                  collapsed ? 'justify-center px-2' : 'gap-3 px-3',
                  isActive
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                {collapsed ? (
                  <item.icon className="h-4 w-4" />
                ) : (
                  <>
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="text-sm font-medium">{item.title}</span>
                  </>
                )}
              </Link>
            )
          })}
        </div>

        {/* Compliance Section */}
        <div className="mt-4">
          <Collapsible defaultOpen={isComplianceActive}>
            <CollapsibleTrigger className={cn(
              'w-full flex items-center rounded-lg transition-all h-9',
              collapsed ? 'justify-center px-2' : 'gap-3 px-3',
              isComplianceActive
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}>
              {collapsed ? (
                <Shield className="h-4 w-4" />
              ) : (
                <>
                  <Shield className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-medium">Compliance</span>
                  <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
                </>
              )}
            </CollapsibleTrigger>
            {!collapsed && (
              <CollapsibleContent className="ml-6 mt-1 space-y-1">
                {complianceItems.map((item) => {
                  const isActive = pathname === item.url
                  return (
                    <Link
                      key={item.title}
                      href={item.url}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1 rounded-lg transition-all text-sm',
                        isActive
                          ? 'bg-gray-100 text-gray-900 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </Link>
                  )
                })}
              </CollapsibleContent>
            )}
          </Collapsible>
        </div>

        {/* Reports Section */}
        <div className="mt-1">
          <Collapsible defaultOpen={isReportsActive}>
            <CollapsibleTrigger className={cn(
              'w-full flex items-center rounded-lg transition-all h-9',
              collapsed ? 'justify-center px-2' : 'gap-3 px-3',
              isReportsActive
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}>
              {collapsed ? (
                <FileText className="h-4 w-4" />
              ) : (
                <>
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-medium">Reports</span>
                  <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
                </>
              )}
            </CollapsibleTrigger>
            {!collapsed && (
              <CollapsibleContent className="ml-6 mt-1 space-y-1">
                {reportsItems.map((item) => {
                  const isActive = pathname === item.url
                  return (
                    <Link
                      key={item.title}
                      href={item.url}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1 rounded-lg transition-all text-sm',
                        isActive
                          ? 'bg-gray-100 text-gray-900 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </Link>
                  )
                })}
              </CollapsibleContent>
            )}
          </Collapsible>
        </div>

        {/* AI Features */}
        <div className="mt-4">
          {!collapsed && (
            <p className="px-3 text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              AI Features
            </p>
          )}
          <div className="space-y-1">
            {aiFeatures.map((item) => {
              const isActive = pathname === item.url
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  className={cn(
                    'flex items-center rounded-lg transition-all h-9',
                    collapsed ? 'justify-center px-2' : 'gap-3 px-3',
                    isActive
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  {collapsed ? (
                    <item.icon className="h-4 w-4" />
                  ) : (
                    <>
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="text-sm font-medium text-left">{item.title}</span>
                    </>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-gray-100 p-4">
        {/* Bottom Navigation */}
        <div className="space-y-1 mb-4">
          <Link
            href="/notifications"
            className={cn(
              'flex items-center rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all h-9',
              collapsed ? 'justify-center px-2' : 'gap-3 px-3'
            )}
          >
            {collapsed ? (
              <Bell className="h-4 w-4" />
            ) : (
              <>
                <Bell className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">Notifications</span>
              </>
            )}
          </Link>
          <Link
            href="/settings"
            className={cn(
              'flex items-center rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all h-9',
              collapsed ? 'justify-center px-2' : 'gap-3 px-3'
            )}
          >
            {collapsed ? (
              <Settings className="h-4 w-4" />
            ) : (
              <>
                <Settings className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">Settings</span>
              </>
            )}
          </Link>
        </div>

        {/* User Section */}
        <UserSection collapsed={collapsed} />
      </div>
    </aside>
  )
}