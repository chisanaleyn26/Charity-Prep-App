'use client'

import React, { useState, useEffect } from 'react'
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  UserCheck,
  Upload,
  Mail,
  Activity,
  Users,
  Shield,
  Globe,
  DollarSign
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRealtime } from '@/hooks/use-realtime'
import { formatDistanceToNow } from 'date-fns'

interface ActivityItem {
  id: string
  type: 'success' | 'warning' | 'info' | 'default'
  icon: React.ElementType
  title: string
  description: string
  time: Date
  user?: string
  table?: string
}

export function RealtimeActivityFeed({ organizationId }: { organizationId: string }) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLive, setIsLive] = useState(false)

  // Map table changes to activity items
  const mapToActivity = (table: string, data: any, eventType: string): ActivityItem => {
    const baseActivity = {
      id: `${table}-${data.id}-${Date.now()}`,
      time: new Date(data.created_at || data.updated_at),
      user: data.created_by || 'System',
      table
    }

    switch (table) {
      case 'notifications':
        return {
          ...baseActivity,
          type: data.type === 'warning' ? 'warning' : 'info',
          icon: AlertCircle,
          title: data.title || 'New Notification',
          description: data.message || 'Notification received'
        }

      case 'safeguarding_records':
        if (eventType === 'INSERT') {
          return {
            ...baseActivity,
            type: 'success',
            icon: Shield,
            title: 'DBS Check Added',
            description: `New DBS record for ${data.person_name || 'volunteer'}`
          }
        } else if (eventType === 'UPDATE') {
          if (data.status === 'verified') {
            return {
              ...baseActivity,
              type: 'success',
              icon: CheckCircle,
              title: 'DBS Check Verified',
              description: `${data.person_name || 'Volunteer'}'s DBS check has been verified`
            }
          } else if (data.status === 'expiring_soon') {
            return {
              ...baseActivity,
              type: 'warning',
              icon: AlertCircle,
              title: 'DBS Expiry Warning',
              description: `${data.person_name || 'Volunteer'}'s DBS check expires soon`
            }
          }
        }
        return {
          ...baseActivity,
          type: 'info',
          icon: Shield,
          title: 'Safeguarding Update',
          description: `Safeguarding record updated for ${data.person_name || 'volunteer'}`
        }

      case 'overseas_activities':
        return {
          ...baseActivity,
          type: eventType === 'DELETE' ? 'warning' : 'info',
          icon: Globe,
          title: eventType === 'INSERT' ? 'New Overseas Activity' : 
                 eventType === 'DELETE' ? 'Activity Removed' : 'Activity Updated',
          description: `${data.country || 'Overseas'} - ${data.activity_type || 'activity'}`
        }

      case 'income_records':
        return {
          ...baseActivity,
          type: 'success',
          icon: DollarSign,
          title: eventType === 'INSERT' ? 'Income Recorded' : 'Income Updated',
          description: `£${data.amount || 0} from ${data.source || 'donation'}`
        }

      default:
        return {
          ...baseActivity,
          type: 'default',
          icon: Activity,
          title: 'Activity Update',
          description: `${table} ${eventType.toLowerCase()}`
        }
    }
  }

  // Set up real-time subscriptions
  const { isConnected } = useRealtime({
    organizationId,
    onInsert: (payload) => {
      const activity = mapToActivity(payload.table, payload, 'INSERT')
      setActivities(prev => [activity, ...prev].slice(0, 50)) // Keep last 50
    },
    onUpdate: (payload) => {
      const activity = mapToActivity(payload.table, payload, 'UPDATE')
      setActivities(prev => [activity, ...prev].slice(0, 50))
    },
    onDelete: (payload) => {
      const activity = mapToActivity(payload.table, payload, 'DELETE')
      setActivities(prev => [activity, ...prev].slice(0, 50))
    }
  })

  useEffect(() => {
    setIsLive(isConnected)
  }, [isConnected])

  // Load initial activities
  useEffect(() => {
    const loadInitialActivities = async () => {
      try {
        const response = await fetch(`/api/v1/organizations/${organizationId}/activities`)
        if (response.ok) {
          const data = await response.json()
          const mapped = data.activities.map((item: any) => ({
            id: item.id,
            type: item.type || 'default',
            icon: getIconForType(item.activity_type),
            title: item.title,
            description: item.description,
            time: new Date(item.created_at),
            user: item.user_name || 'System'
          }))
          setActivities(mapped)
        }
      } catch (error) {
        console.error('Failed to load activities:', error)
      }
    }

    if (organizationId) {
      loadInitialActivities()
    }
  }, [organizationId])

  const getIconForType = (type: string) => {
    const iconMap: Record<string, React.ElementType> = {
      safeguarding: Shield,
      overseas: Globe,
      income: DollarSign,
      document: FileText,
      user: UserCheck,
      notification: AlertCircle,
      upload: Upload,
      email: Mail
    }
    return iconMap[type] || Activity
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 text-green-600 border border-green-100'
      case 'warning': return 'bg-red-50 text-red-600 border border-red-100'
      case 'info': return 'bg-gray-100 text-gray-600 border border-gray-200'
      default: return 'bg-gray-100 text-gray-600 border border-gray-200'
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-3xl flex flex-col hover:border-gray-300 transition-all duration-300 relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent opacity-20" />
      
      <div className="relative z-10">
        <div className="p-6 pb-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900 tracking-tight leading-tight">
                Live Activity
              </h3>
              <p className="text-gray-600 text-sm font-medium tracking-wide">
                Real-time updates
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(
                "rounded-xl px-3 py-2 border",
                isLive 
                  ? "bg-green-50 border-green-200" 
                  : "bg-gray-50 border-gray-200"
              )}>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    isLive 
                      ? "bg-green-500 animate-pulse" 
                      : "bg-gray-400"
                  )} />
                  <span className={cn(
                    "text-xs font-bold tracking-wider uppercase",
                    isLive ? "text-green-700" : "text-gray-600"
                  )}>
                    {isLive ? 'LIVE' : 'OFFLINE'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity list */}
        <div className="flex-1 p-6 space-y-3 max-h-[400px] overflow-y-auto">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No recent activities</p>
            </div>
          ) : (
            activities.slice(0, 10).map((activity, index) => (
              <div 
                key={activity.id} 
                className="flex gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-300 group cursor-pointer border border-transparent hover:border-gray-200"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animation: 'slideIn 0.3s ease-out forwards'
                }}
              >
                <div className={cn(
                  'h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm',
                  getActivityColor(activity.type)
                )}>
                  <activity.icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900 leading-tight tracking-wide">
                      {activity.title}
                    </h4>
                    <span className="text-xs text-gray-500 ml-2 font-medium tracking-wide">
                      {formatDistanceToNow(activity.time, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-1 font-normal">
                    {activity.description}
                  </p>
                  {activity.user && (
                    <p className="text-xs text-gray-500 mt-1">
                      by {activity.user}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {activities.length > 0 && (
          <div className="p-6 pt-5 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="bg-gray-100 rounded-xl px-3 py-2">
                <span className="text-xs text-gray-700 font-bold tracking-wider uppercase">
                  {activities.length} Activities
                </span>
              </div>
              <button className="group bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-800 transition-all duration-300 flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200">
                <span className="text-sm font-semibold tracking-wide">View all</span>
                <span className="transition-transform group-hover:translate-x-1 text-sm font-bold">→</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export function RealtimeActivityFeedSkeleton() {
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