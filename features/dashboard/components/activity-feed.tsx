'use client'

import React from 'react'
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  UserCheck,
  Upload,
  Mail,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivityItem {
  id: string
  type: 'success' | 'warning' | 'info' | 'default'
  icon: React.ElementType
  title: string
  description: string
  time: string
  user?: string
}

const activities: ActivityItem[] = [
  {
    id: '1',
    type: 'success',
    icon: CheckCircle,
    title: 'DBS Check Completed',
    description: 'Sarah Johnson\'s enhanced DBS check has been verified',
    time: '5 minutes ago',
    user: 'System'
  },
  {
    id: '2',
    type: 'info',
    icon: Upload,
    title: 'Document Uploaded',
    description: 'Safeguarding Policy 2024 v2.1 has been uploaded',
    time: '1 hour ago',
    user: 'John Smith'
  },
  {
    id: '3',
    type: 'warning',
    icon: AlertCircle,
    title: 'Expiry Warning',
    description: '3 DBS checks will expire in the next 30 days',
    time: '2 hours ago',
    user: 'System'
  },
  {
    id: '4',
    type: 'default',
    icon: Mail,
    title: 'Email Processed',
    description: 'Donation receipt from British Heart Foundation imported',
    time: '3 hours ago',
    user: 'AI Assistant'
  },
  {
    id: '5',
    type: 'success',
    icon: UserCheck,
    title: 'Volunteer Onboarded',
    description: 'Michael Chen added to safeguarding register',
    time: '4 hours ago',
    user: 'Admin'
  },
  {
    id: '6',
    type: 'info',
    icon: FileText,
    title: 'Report Generated',
    description: 'Q3 2024 Compliance Report ready for download',
    time: '5 hours ago',
    user: 'System'
  },
  {
    id: '7',
    type: 'default',
    icon: Activity,
    title: 'Risk Assessment Updated',
    description: 'Kenya Water Project risk level changed to Medium',
    time: '6 hours ago',
    user: 'Sarah Williams'
  },
  {
    id: '8',
    type: 'success',
    icon: CheckCircle,
    title: 'Training Completed',
    description: '5 staff members completed safeguarding training',
    time: '1 day ago',
    user: 'System'
  }
]

const typeStyles = {
  success: {
    bg: 'bg-success/10',
    icon: 'text-success',
    border: 'border-success/20'
  },
  warning: {
    bg: 'bg-warning/10',
    icon: 'text-warning',
    border: 'border-warning/20'
  },
  info: {
    bg: 'bg-info/10',
    icon: 'text-info',
    border: 'border-info/20'
  },
  default: {
    bg: 'bg-mist-50',
    icon: 'text-mist-600',
    border: 'border-mist-200'
  }
}

export function ActivityFeed() {
  return (
    <div className="bg-white rounded-xl border border-mist-200 h-full flex flex-col">
      <div className="p-6 pb-4 border-b border-mist-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gunmetal">
              Recent Activity
            </h3>
            <p className="text-sm text-mist-700 mt-1">
              Latest updates and actions
            </p>
          </div>
          <Activity className="h-5 w-5 text-mist-500" />
        </div>
      </div>

      {/* Scrollable activity list */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 max-h-[400px]">
        {activities.map((activity) => {
          const style = typeStyles[activity.type]
          
          return (
            <div
              key={activity.id}
              className={cn(
                'flex gap-3 p-3 rounded-lg border transition-all hover:shadow-sm',
                style.bg,
                style.border
              )}
            >
              <div className={cn('p-2 rounded-lg h-fit', style.bg)}>
                <activity.icon className={cn('h-4 w-4', style.icon)} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gunmetal">
                  {activity.title}
                </h4>
                <p className="text-sm text-mist-700 mt-0.5 truncate">
                  {activity.description}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-mist-600">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {activity.time}
                  </span>
                  {activity.user && (
                    <span>by {activity.user}</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* View all link */}
      <div className="p-4 border-t border-mist-200">
        <button className="w-full text-sm font-medium text-primary hover:text-primary-600 transition-colors">
          View all activity →
        </button>
      </div>
    </div>
  )
}

export function ActivityFeedSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-mist-200 h-full flex flex-col">
      <div className="p-6 pb-4 border-b border-mist-200">
        <div className="space-y-2">
          <div className="w-32 h-6 bg-mist-100 rounded animate-pulse" />
          <div className="w-48 h-4 bg-mist-100 rounded animate-pulse" />
        </div>
      </div>
      <div className="flex-1 p-6 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-3 p-3 rounded-lg bg-mist-50">
            <div className="w-8 h-8 bg-mist-100 rounded-lg animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="w-32 h-4 bg-mist-100 rounded animate-pulse" />
              <div className="w-full h-4 bg-mist-100 rounded animate-pulse" />
              <div className="w-24 h-3 bg-mist-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}