'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  BellOff, 
  Check, 
  X, 
  Clock, 
  AlertTriangle,
  Info,
  Calendar,
  Mail,
  Filter,
  MoreHorizontal,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useOrganization } from '@/features/organizations/components/organization-provider'
import { 
  getNotifications, 
  markNotificationRead, 
  markAllNotificationsRead,
  dismissNotification 
} from '@/lib/api/notifications'
import { createClient } from '@/lib/supabase/client'

interface Notification {
  id: string
  organization_id: string
  user_id?: string | null
  type: string
  title: string
  message: string
  severity: 'info' | 'warning' | 'error' | 'success'
  link?: string | null
  read_at?: string | null
  dismissed_at?: string | null
  created_at: string
  scheduled_for?: string | null
  sent_at?: string | null
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentOrganization } = useOrganization()

  const unreadCount = notifications.filter(n => !n.read_at && !n.dismissed_at).length
  
  const filteredNotifications = notifications.filter(notification => {
    if (notification.dismissed_at) return false // Don't show dismissed
    if (filter === 'unread') return !notification.read_at
    if (filter === 'read') return !!notification.read_at
    return true
  })

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (!currentOrganization?.id) {
      console.log('No organization ID, skipping notification load')
      return
    }

    console.log('Loading notifications for org:', currentOrganization.id)
    console.log('Current organization full object:', currentOrganization)
    setLoading(true)
    setError(null)
    
    try {
      const result = await getNotifications(currentOrganization.id, {
        page: 1,
        pageSize: 50
      })
      
      console.log('Notifications result:', result)
      console.log('Result data:', result.data)
      console.log('Result error:', result.error)
      console.log('Data is array:', Array.isArray(result.data))
      console.log('Data length:', result.data?.length)
      
      // Also do a direct query to see what's happening
      const supabase = createClient()
      const { data: directQuery, error: directError } = await supabase
        .from('notifications')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .limit(5)
      
      console.log('Direct query result:', { data: directQuery, error: directError })
      
      if (result.error) {
        setError(result.error)
        toast.error('Failed to load notifications')
      } else if (result.data) {
        setNotifications(result.data)
        console.log('Loaded notifications:', result.data.length)
      }
    } catch (err) {
      console.error('Error loading notifications:', err)
      setError('Failed to load notifications')
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [currentOrganization?.id])

  // Load notifications on mount and when organization changes
  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  // Set up real-time subscription
  useEffect(() => {
    if (!currentOrganization?.id) return

    const supabase = createClient()
    
    // Subscribe to new notifications
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `organization_id=eq.${currentOrganization.id}`
        },
        (payload) => {
          // Add new notification to the list
          const newNotification = payload.new as Notification
          setNotifications(prev => [newNotification, ...prev])
          
          // Show toast for new notification
          toast(newNotification.title, {
            description: newNotification.message,
            action: newNotification.link ? {
              label: 'View',
              onClick: () => window.location.href = newNotification.link!
            } : undefined
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `organization_id=eq.${currentOrganization.id}`
        },
        (payload) => {
          // Update notification in the list
          const updatedNotification = payload.new as Notification
          setNotifications(prev => 
            prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          // Remove notification from the list
          const deletedId = payload.old.id
          setNotifications(prev => prev.filter(n => n.id !== deletedId))
        }
      )
      .subscribe()

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [currentOrganization?.id])

  const markAsRead = async (id: string) => {
    // Optimistically update UI
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
    )

    const result = await markNotificationRead(id)
    
    if (result.error) {
      // Revert on error
      loadNotifications()
      toast.error('Failed to mark as read')
    }
  }

  const markAllAsRead = async () => {
    if (!currentOrganization?.id) return

    // Optimistically update UI
    setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })))
    
    const result = await markAllNotificationsRead(currentOrganization.id)
    
    if (result.error) {
      // Revert on error
      loadNotifications()
      toast.error('Failed to mark all as read')
    } else {
      toast.success('All notifications marked as read')
    }
  }

  const deleteNotification = async (id: string) => {
    // Optimistically update UI
    setNotifications(prev => prev.filter(n => n.id !== id))
    
    const result = await dismissNotification(id)
    
    if (result.error) {
      // Revert on error
      loadNotifications()
      toast.error('Failed to delete notification')
    } else {
      toast.success('Notification deleted')
    }
  }

  const getNotificationIcon = (severity: string) => {
    switch (severity) {
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'error': return <X className="h-4 w-4" />
      case 'success': return <Check className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const getNotificationColor = (severity: string) => {
    switch (severity) {
      case 'warning': return 'border-warning bg-warning/5 text-warning-foreground'
      case 'error': return 'border-destructive bg-destructive/5 text-destructive-foreground'
      case 'success': return 'border-success bg-success/5 text-success-foreground'
      default: return 'border-primary bg-primary/5 text-primary-foreground'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // Show loading state if no organization
  if (!currentOrganization) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <h1 className="text-5xl font-extralight text-foreground tracking-tight leading-none flex items-center gap-4">
              <Bell className="h-12 w-12 text-muted-foreground" />
              Notifications
            </h1>
            <p className="text-lg text-muted-foreground font-normal leading-relaxed tracking-wide">
              Stay updated with important alerts and deadlines.
            </p>
          </div>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading organization...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <h1 className="text-5xl font-extralight text-foreground tracking-tight leading-none flex items-center gap-4">
            <Bell className="h-12 w-12 text-muted-foreground" />
            Notifications
          </h1>
          <p className="text-lg text-muted-foreground font-normal leading-relaxed tracking-wide">
            Stay updated with important alerts and deadlines.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm">
            {unreadCount} unread
          </Badge>
          {!loading && (
            <Button onClick={loadNotifications} variant="outline" size="sm">
              <Loader2 className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>
          )}
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline" size="sm" disabled={loading}>
              <Check className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          )}
          {/* Test button for development */}
          {process.env.NODE_ENV === 'development' && currentOrganization?.id && (
            <Button
              onClick={async () => {
                try {
                  const res = await fetch('/api/test-notifications', { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ organizationId: currentOrganization.id })
                  })
                  const data = await res.json()
                  if (data.success) {
                    toast.success(data.message)
                    loadNotifications()
                  } else {
                    toast.error(data.error || 'Failed to create test notifications')
                  }
                } catch (error) {
                  toast.error('Failed to create test notifications')
                }
              }}
              variant="outline"
              size="sm"
            >
              Create Test Notification
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1">
              {(['all', 'unread', 'read'] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter(f)}
                  className="capitalize"
                  disabled={loading}
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {loading ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Loading notifications...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Error loading notifications</h3>
                  <p className="text-muted-foreground text-center mb-4">{error}</p>
                  <Button onClick={loadNotifications} variant="outline">
                    Try again
                  </Button>
                </CardContent>
              </Card>
            ) : filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BellOff className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                  <p className="text-muted-foreground text-center">
                    {filter === 'unread' ? 'No unread notifications' : 'All caught up!'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card 
                  key={notification.id}
                  className={cn(
                    'transition-all hover:shadow-md',
                    !notification.read_at && 'ring-2 ring-primary/20 bg-primary/5'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={cn(
                        'p-2 rounded-full',
                        getNotificationColor(notification.severity)
                      )}>
                        {getNotificationIcon(notification.severity)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <h3 className={cn(
                              'font-semibold',
                              !notification.read_at && 'text-foreground'
                            )}>
                              {notification.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatTimestamp(notification.created_at)}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {!notification.read_at && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Action Button */}
                        {notification.link && (
                          <div className="mt-3">
                            <Button variant="outline" size="sm" asChild>
                              <a href={notification.link}>
                                View
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
      </div>
    </div>
  )
}