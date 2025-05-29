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
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 text-green-600 border border-green-100'
      case 'warning': return 'bg-red-50 text-red-600 border border-red-100'
      case 'info': return 'bg-gray-100 text-gray-600 border border-gray-200'
      default: return 'bg-gray-100 text-gray-600 border border-gray-200'
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl flex flex-col hover:border-gray-300 hover:shadow-md transition-all duration-300 relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent opacity-20" />
      
      <div className="relative z-10">
        <div className="p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-medium text-gray-900 leading-normal">Live Activity</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Real-time updates</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-green-50 rounded-lg px-2 py-1 border border-green-200">
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-700 font-medium uppercase">LIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compressed activity list - only 3 items */}
        <div className="flex-1 p-6 space-y-2">
          {activities.slice(0, 3).map((activity, index) => (
            <div 
              key={activity.id} 
              className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-300 group cursor-pointer border border-transparent hover:border-gray-200"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={cn(
                'h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-300 shadow-sm',
                getActivityColor(activity.type)
              )}>
                <activity.icon className="h-4 w-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="text-sm font-medium text-gray-900 leading-normal">
                    {activity.title}
                  </h4>
                  <span className="text-xs text-gray-500 ml-2 font-medium">
                    {activity.time}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-1">
                  {activity.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Minimalistic footer */}
        <div className="p-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="bg-gray-100 rounded-lg px-3 py-1">
              <span className="text-xs text-gray-700 font-medium">
                {activities.length} Activities
              </span>
            </div>
            <button className="group bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-800 transition-all duration-300 flex items-center gap-2 px-3 py-1 rounded-lg border border-gray-200">
              <span className="text-sm font-medium">View all</span>
              <span className="transition-transform group-hover:translate-x-1 text-sm">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ActivityFeedSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 h-full flex flex-col">
      <div className="p-6 pb-4 border-b border-gray-100">
        <div className="space-y-1">
          <div className="w-24 h-5 bg-gray-100 rounded animate-pulse" />
          <div className="w-32 h-4 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
      <div className="flex-1 p-6 space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 p-3 rounded-lg bg-gray-50">
            <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse" />
            <div className="flex-1 space-y-1">
              <div className="w-24 h-4 bg-gray-100 rounded animate-pulse" />
              <div className="w-full h-3 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      <div className="p-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="w-20 h-6 bg-gray-100 rounded animate-pulse" />
          <div className="w-16 h-6 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}