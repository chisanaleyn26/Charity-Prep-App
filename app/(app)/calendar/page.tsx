'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Plus,
  Filter,
  Download,
  Bell
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Deadline {
  id: string
  title: string
  description: string
  date: Date
  type: 'dbs_expiry' | 'annual_return' | 'policy_review' | 'training' | 'other'
  priority: 'high' | 'medium' | 'low'
  status: 'upcoming' | 'overdue' | 'completed'
  relatedUrl?: string
}

// Mock deadlines data
const mockDeadlines: Deadline[] = [
  {
    id: '1',
    title: 'DBS Check Renewal - Sarah Johnson',
    description: 'Enhanced DBS check expires and needs renewal',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15), // 15 days from now
    type: 'dbs_expiry',
    priority: 'high',
    status: 'upcoming',
    relatedUrl: '/compliance/safeguarding'
  },
  {
    id: '2',
    title: 'Annual Return Submission',
    description: 'Submit charity annual return to Charity Commission',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45), // 45 days from now
    type: 'annual_return',
    priority: 'high',
    status: 'upcoming',
    relatedUrl: '/reports/annual-return'
  },
  {
    id: '3',
    title: 'Safeguarding Policy Review',
    description: 'Annual review of safeguarding policies and procedures',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days from now
    type: 'policy_review',
    priority: 'medium',
    status: 'upcoming',
    relatedUrl: '/documents'
  },
  {
    id: '4',
    title: 'Staff Training - Child Protection',
    description: 'Mandatory safeguarding training for all staff',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
    type: 'training',
    priority: 'medium',
    status: 'upcoming'
  },
  {
    id: '5',
    title: 'DBS Check Renewal - Mike Chen',
    description: 'Standard DBS check expired 5 days ago',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    type: 'dbs_expiry',
    priority: 'high',
    status: 'overdue',
    relatedUrl: '/compliance/safeguarding'
  },
  {
    id: '6',
    title: 'Trustee Training Completed',
    description: 'All trustees completed governance training',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    type: 'training',
    priority: 'low',
    status: 'completed'
  }
]

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [deadlines] = useState<Deadline[]>(mockDeadlines)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filteredDeadlines = deadlines.filter(deadline => {
    const typeMatch = filterType === 'all' || deadline.type === filterType
    const statusMatch = filterStatus === 'all' || deadline.status === filterStatus
    return typeMatch && statusMatch
  })

  const overdueCount = deadlines.filter(d => d.status === 'overdue').length
  const upcomingCount = deadlines.filter(d => d.status === 'upcoming').length

  const getDeadlinesForDate = (date: Date) => {
    return deadlines.filter(deadline => {
      const deadlineDate = new Date(deadline.date)
      return deadlineDate.toDateString() === date.toDateString()
    })
  }

  const selectedDateDeadlines = selectedDate ? getDeadlinesForDate(selectedDate) : []

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200'
      case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'dbs_expiry': return 'DBS Expiry'
      case 'annual_return': return 'Annual Return'
      case 'policy_review': return 'Policy Review'
      case 'training': return 'Training'
      default: return 'Other'
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getDaysUntilDeadline = (date: Date) => {
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`
    if (diffDays === 0) return 'Due today'
    if (diffDays === 1) return 'Due tomorrow'
    return `${diffDays} days remaining`
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <h1 className="text-5xl font-extralight text-foreground tracking-tight leading-none flex items-center gap-4">
            <CalendarIcon className="h-12 w-12 text-muted-foreground" />
            Calendar & Deadlines
          </h1>
          <p className="text-lg text-muted-foreground font-normal leading-relaxed tracking-wide">
            Track important dates and upcoming compliance deadlines.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="destructive" className="text-sm">
            {overdueCount} overdue
          </Badge>
          <Badge variant="secondary" className="text-sm">
            {upcomingCount} upcoming
          </Badge>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Deadline
          </Button>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Calendar */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>
                  Select a date to view deadlines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={{
                    hasDeadlines: (date) => getDeadlinesForDate(date).length > 0,
                    overdue: (date) => getDeadlinesForDate(date).some(d => d.status === 'overdue'),
                    upcoming: (date) => getDeadlinesForDate(date).some(d => d.status === 'upcoming')
                  }}
                  modifiersStyles={{
                    hasDeadlines: { fontWeight: 'bold' },
                    overdue: { backgroundColor: '#fef2f2', color: '#dc2626' },
                    upcoming: { backgroundColor: '#eff6ff', color: '#2563eb' }
                  }}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            {/* Selected Date Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {selectedDate ? formatDate(selectedDate) : 'Select a date'}
                </CardTitle>
                <CardDescription>
                  Deadlines for selected date
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDateDeadlines.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No deadlines for this date</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateDeadlines.map((deadline) => (
                      <div key={deadline.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm">{deadline.title}</h4>
                            <p className="text-xs text-muted-foreground">{deadline.description}</p>
                            <div className="flex gap-1">
                              <Badge variant="outline" className={cn('text-xs', getPriorityColor(deadline.priority))}>
                                {deadline.priority}
                              </Badge>
                              <Badge variant="outline" className={cn('text-xs', getStatusColor(deadline.status))}>
                                {deadline.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filter by:</span>
            </div>
            <select
              className="text-sm border rounded px-2 py-1"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="dbs_expiry">DBS Expiry</option>
              <option value="annual_return">Annual Return</option>
              <option value="policy_review">Policy Review</option>
              <option value="training">Training</option>
              <option value="other">Other</option>
            </select>
            <select
              className="text-sm border rounded px-2 py-1"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="overdue">Overdue</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Deadlines List */}
          <div className="space-y-3">
            {filteredDeadlines.map((deadline) => (
              <Card key={deadline.id} className={cn(
                'transition-all hover:shadow-md',
                deadline.status === 'overdue' && 'ring-2 ring-red-200 bg-red-50'
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{deadline.title}</h3>
                        <Badge variant="outline" className={cn('text-xs', getPriorityColor(deadline.priority))}>
                          {deadline.priority}
                        </Badge>
                        <Badge variant="outline" className={cn('text-xs', getStatusColor(deadline.status))}>
                          {deadline.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{deadline.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {formatDate(deadline.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getDaysUntilDeadline(deadline.date)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(deadline.type)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {deadline.relatedUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={deadline.relatedUrl}>View</a>
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Bell className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold">{overdueCount}</p>
                    <p className="text-xs text-muted-foreground">Overdue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {deadlines.filter(d => d.status === 'upcoming' && new Date(d.date).getTime() - Date.now() <= 7 * 24 * 60 * 60 * 1000).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Due this week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{upcomingCount}</p>
                    <p className="text-xs text-muted-foreground">Upcoming</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {deadlines.filter(d => d.status === 'completed').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle>Next 30 Days</CardTitle>
              <CardDescription>
                Deadlines coming up in the next month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deadlines
                  .filter(d => d.status === 'upcoming' || d.status === 'overdue')
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .slice(0, 10)
                  .map((deadline) => (
                    <div key={deadline.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{deadline.title}</h4>
                        <p className="text-sm text-muted-foreground">{deadline.description}</p>
                        <div className="flex gap-2">
                          <Badge variant="outline" className={cn('text-xs', getPriorityColor(deadline.priority))}>
                            {deadline.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {getDaysUntilDeadline(deadline.date)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatDate(deadline.date)}</p>
                        {deadline.relatedUrl && (
                          <Button variant="outline" size="sm" className="mt-2" asChild>
                            <a href={deadline.relatedUrl}>Take Action</a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}