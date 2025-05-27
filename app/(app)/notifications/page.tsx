'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Settings,
  Filter,
  MoreHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Notification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: Date
  read: boolean
  action?: {
    label: string
    url: string
  }
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'warning',
    title: 'DBS Checks Expiring Soon',
    message: '3 DBS checks will expire in the next 30 days. Please review and renew.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false,
    action: { label: 'View DBS Records', url: '/compliance/safeguarding' }
  },
  {
    id: '2',
    type: 'info',
    title: 'Annual Return Due',
    message: 'Your charity\'s annual return is due in 60 days. Start preparing now.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    action: { label: 'Generate Annual Return', url: '/reports/annual-return' }
  },
  {
    id: '3',
    type: 'success',
    title: 'Compliance Score Improved',
    message: 'Your compliance score has increased to 92% - well done!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    read: true
  },
  {
    id: '4',
    type: 'warning',
    title: 'Document Upload Required',
    message: 'Please upload your updated safeguarding policy.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    action: { label: 'Upload Document', url: '/documents' }
  },
  {
    id: '5',
    type: 'info',
    title: 'New Fundraising Guidelines',
    message: 'The Charity Commission has published updated fundraising guidelines.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    read: true,
    action: { label: 'View Guidelines', url: '/compliance/chat' }
  }
]

const mockPreferences = {
  email: true,
  push: true,
  sms: false,
  categories: {
    compliance_alerts: true,
    deadline_reminders: true,
    score_updates: true,
    system_updates: false
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [preferences, setPreferences] = useState(mockPreferences)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  const unreadCount = notifications.filter(n => !n.read).length
  
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read
    if (filter === 'read') return notification.read
    return true
  })

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast.success('All notifications marked as read')
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    toast.success('Notification deleted')
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'error': return <X className="h-4 w-4" />
      case 'success': return <Check className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-warning bg-warning/5 text-warning-foreground'
      case 'error': return 'border-destructive bg-destructive/5 text-destructive-foreground'
      case 'success': return 'border-success bg-success/5 text-success-foreground'
      default: return 'border-primary bg-primary/5 text-primary-foreground'
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - timestamp.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return timestamp.toLocaleDateString()
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
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline" size="sm">
              <Check className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
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
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
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
                    !notification.read && 'ring-2 ring-primary/20 bg-primary/5'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={cn(
                        'p-2 rounded-full',
                        getNotificationColor(notification.type)
                      )}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <h3 className={cn(
                              'font-semibold',
                              !notification.read && 'text-foreground'
                            )}>
                              {notification.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatTimestamp(notification.timestamp)}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {!notification.read && (
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
                        {notification.action && (
                          <div className="mt-3">
                            <Button variant="outline" size="sm" asChild>
                              <a href={notification.action.url}>
                                {notification.action.label}
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
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Delivery Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Delivery Methods
                </CardTitle>
                <CardDescription>
                  Choose how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Email Notifications</div>
                    <div className="text-xs text-muted-foreground">Receive notifications via email</div>
                  </div>
                  <Switch
                    checked={preferences.email}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, email: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Push Notifications</div>
                    <div className="text-xs text-muted-foreground">Browser push notifications</div>
                  </div>
                  <Switch
                    checked={preferences.push}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, push: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">SMS Notifications</div>
                    <div className="text-xs text-muted-foreground">Text message alerts</div>
                  </div>
                  <Switch
                    checked={preferences.sms}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, sms: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Categories
                </CardTitle>
                <CardDescription>
                  Select which types of notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Compliance Alerts</div>
                    <div className="text-xs text-muted-foreground">DBS expiry, policy updates</div>
                  </div>
                  <Switch
                    checked={preferences.categories.compliance_alerts}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ 
                        ...prev, 
                        categories: { ...prev.categories, compliance_alerts: checked }
                      }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Deadline Reminders</div>
                    <div className="text-xs text-muted-foreground">Annual returns, submissions</div>
                  </div>
                  <Switch
                    checked={preferences.categories.deadline_reminders}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ 
                        ...prev, 
                        categories: { ...prev.categories, deadline_reminders: checked }
                      }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Score Updates</div>
                    <div className="text-xs text-muted-foreground">Compliance score changes</div>
                  </div>
                  <Switch
                    checked={preferences.categories.score_updates}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ 
                        ...prev, 
                        categories: { ...prev.categories, score_updates: checked }
                      }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">System Updates</div>
                    <div className="text-xs text-muted-foreground">App updates, maintenance</div>
                  </div>
                  <Switch
                    checked={preferences.categories.system_updates}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ 
                        ...prev, 
                        categories: { ...prev.categories, system_updates: checked }
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => toast.success('Preferences saved')}>
              Save Preferences
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}