'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CustomCalendar } from '@/components/ui/custom-calendar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Plus,
  Filter,
  Download,
  Bell,
  MoreHorizontal,
  ExternalLink,
  CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { DeadlineModal } from '@/components/deadline-modal'
import { useToast } from '@/hooks/use-toast'
import { useOrganization } from '@/features/organizations/components/organization-provider'
import { DeadlineService } from '@/lib/api/deadlines'
import type { Deadline } from '@/lib/api/deadlines'


export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [orgReady, setOrgReady] = useState(false)
  const { toast } = useToast()
  const { currentOrganization, isLoading: orgLoading } = useOrganization()

  // Fix hydration by setting initial date only on client
  useEffect(() => {
    setMounted(true)
    setSelectedDate(new Date())
  }, [])

  // Track when organization is ready on client side only
  useEffect(() => {
    if (mounted) {
      const ready = !orgLoading && !!currentOrganization
      setOrgReady(ready)
      console.log('📊 Organization status:', {
        mounted: true,
        orgLoading,
        hasOrganization: !!currentOrganization,
        organizationId: currentOrganization?.id,
        orgReady: ready
      })
    }
  }, [mounted, orgLoading, currentOrganization])

  // Load deadlines from API
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    
    async function loadDeadlines() {
      if (!mounted) return
      
      // If no organization after 3 seconds, proceed with empty data
      if (!currentOrganization) {
        timeoutId = setTimeout(() => {
          setDeadlines([])
          setLoading(false)
        }, 3000)
        return
      }
      
      // Clear timeout if we have organization
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      try {
        setLoading(true)
        const fetchedDeadlines = await DeadlineService.getDeadlines()
        setDeadlines(fetchedDeadlines)
      } catch (error) {
        console.error('Failed to load deadlines:', error)
        
        // Fallback to empty array
        setDeadlines([])
        
        toast({
          title: 'Failed to load deadlines',
          description: 'Please ensure the database is properly set up',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    loadDeadlines()
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [mounted, currentOrganization, toast])

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
    if (!mounted) return 'Loading...'
    
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`
    if (diffDays === 0) return 'Due today'
    if (diffDays === 1) return 'Due tomorrow'
    return `${diffDays} days remaining`
  }

  const handleCompleteDeadline = async (deadlineId: string) => {
    const deadline = deadlines.find(d => d.id === deadlineId)
    
    try {
      // Optimistically update UI
      setDeadlines(prev => 
        prev.map(deadline => 
          deadline.id === deadlineId 
            ? { ...deadline, status: 'completed' as const }
            : deadline
        )
      )

      // Update via API
      await DeadlineService.completeDeadline(deadlineId)
      
      // Show success toast
      if (deadline) {
        toast({
          title: 'Deadline completed',
          description: `${deadline.title} has been marked as completed.`
        })
      }
    } catch (error) {
      // Revert optimistic update on error
      setDeadlines(prev => 
        prev.map(d => 
          d.id === deadlineId 
            ? { ...d, status: deadline?.status || 'upcoming' }
            : d
        )
      )
      
      toast({
        title: 'Error completing deadline',
        description: 'Failed to update deadline status',
        variant: 'destructive'
      })
    }
  }

  const handleAddDeadline = () => {
    if (!currentOrganization) {
      toast({
        title: 'Organization Required',
        description: 'Please wait for your organization to load or refresh the page.',
        variant: 'destructive'
      })
      return
    }
    setIsModalOpen(true)
  }

  const handleSaveDeadline = async (deadlineData: Omit<Deadline, 'id' | 'status'>) => {
    console.log('🔄 Calendar handleSaveDeadline called:', deadlineData)
    console.log('🏢 Current organization:', currentOrganization?.name, currentOrganization?.id)
    
    if (!currentOrganization) {
      console.log('❌ No organization available')
      toast({
        title: 'Organization Required',
        description: 'Please wait for your organization to load or refresh the page.',
        variant: 'destructive'
      })
      return // Don't throw error, just return early
    }

    try {
      console.log('📤 Calling API to create deadline...')
      
      // Create via API
      const newDeadline = await DeadlineService.createDeadline({
        ...deadlineData,
        organizationId: currentOrganization.id
      })
      
      console.log('✅ API call successful, new deadline:', newDeadline)
      
      // Add to local state
      setDeadlines(prev => {
        const updated = [...prev, newDeadline]
        console.log('📋 Updated deadlines state (total:', updated.length, ')')
        return updated
      })
      
      // Show success toast
      toast({
        title: '🎉 Deadline created',
        description: `${deadlineData.title} has been added to your calendar.`
      })
      
      console.log('🎯 handleSaveDeadline completed successfully!')
      
      // Close the modal
      setIsModalOpen(false)
      
    } catch (error) {
      console.error('💥 Failed to create deadline:', error)
      toast({
        title: 'Error creating deadline',
        description: `Failed to save deadline: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Modern Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-light text-gray-900 tracking-tight leading-tight">
              Calendar & Deadlines
            </h1>
            <p className="text-lg text-gray-600 font-normal leading-relaxed">
              Track important dates and upcoming compliance deadlines
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {mounted && orgLoading && (
            <Badge variant="outline" className="text-sm font-medium px-3 py-1">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2"></div>
              Loading organization...
            </Badge>
          )}
          {overdueCount > 0 && (
            <Badge variant="destructive" className="text-sm font-medium px-3 py-1">
              {overdueCount} overdue
            </Badge>
          )}
          <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
            {upcomingCount} upcoming
          </Badge>
          <Button 
            onClick={handleAddDeadline}
            className="bg-[#B1FA63] hover:bg-[#9FE851] text-[#243837] font-medium"
            disabled={mounted ? !orgReady : false}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Deadline
          </Button>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-12">
          <TabsTrigger value="calendar" className="font-medium">Calendar View</TabsTrigger>
          <TabsTrigger value="list" className="font-medium">List View</TabsTrigger>
          <TabsTrigger value="upcoming" className="font-medium">Upcoming</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Enhanced Calendar */}
            <Card className="lg:col-span-2 shadow-sm border-0 bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold text-gray-900">Calendar</CardTitle>
                    <CardDescription className="text-gray-600 mt-1">
                      Select a date to view deadlines
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
                      <span className="text-gray-600">Overdue</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
                      <span className="text-gray-600">Upcoming</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {mounted && !loading ? (
                  <CustomCalendar
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    modifiers={{
                      hasDeadlines: (date) => getDeadlinesForDate(date).length > 0,
                      overdue: (date) => getDeadlinesForDate(date).some(d => d.status === 'overdue'),
                      upcoming: (date) => getDeadlinesForDate(date).some(d => d.status === 'upcoming')
                    }}
                    className="w-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">
                        {!mounted ? 'Loading calendar...' : 'Loading deadlines...'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Selected Date Deadlines */}
            <Card className="shadow-sm border-0 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Clock className="h-5 w-5 text-gray-600" />
                  {selectedDate ? formatDate(selectedDate) : 'Select a date'}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {selectedDateDeadlines.length === 1 
                    ? '1 deadline' 
                    : `${selectedDateDeadlines.length} deadlines`} for this date
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDateDeadlines.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CalendarIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium">No deadlines</p>
                    <p className="text-sm text-gray-500 mt-1">Select a different date to view deadlines</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateDeadlines.map((deadline) => (
                      <div key={deadline.id} className="group p-4 border border-gray-200 rounded-xl hover:shadow-md hover:border-gray-300 transition-all duration-200">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-2 flex-1">
                            <h4 className="font-medium text-sm text-gray-900 leading-tight">{deadline.title}</h4>
                            <p className="text-xs text-gray-600 leading-relaxed">{deadline.description}</p>
                            <div className="flex gap-2">
                              <Badge variant="outline" className={cn('text-xs font-medium', getPriorityColor(deadline.priority))}>
                                {deadline.priority}
                              </Badge>
                              <Badge variant="outline" className={cn('text-xs font-medium', getStatusColor(deadline.status))}>
                                {deadline.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {deadline.status !== 'completed' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCompleteDeadline(deadline.id)}
                                className="h-8 w-8 p-0"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            {deadline.relatedUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="h-8 w-8 p-0"
                              >
                                <Link href={deadline.relatedUrl}>
                                  <ExternalLink className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
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
          {/* Modern Filters */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by:</span>
            </div>
            <div className="flex items-center gap-4">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px] h-10">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="dbs_expiry">DBS Expiry</SelectItem>
                  <SelectItem value="annual_return">Annual Return</SelectItem>
                  <SelectItem value="policy_review">Policy Review</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px] h-10">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="text-sm text-gray-500">
                {filteredDeadlines.length} of {deadlines.length} deadlines
              </div>
            </div>
          </div>

          {/* Enhanced Deadlines List */}
          <div className="space-y-4">
            {filteredDeadlines.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">No deadlines found</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              filteredDeadlines.map((deadline) => (
                <Card key={deadline.id} className={cn(
                  'group transition-all duration-200 hover:shadow-lg border-0 shadow-sm',
                  deadline.status === 'overdue' && 'ring-2 ring-red-200 bg-red-50/50',
                  deadline.status === 'completed' && 'opacity-75'
                )}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-6">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-start gap-3">
                          <h3 className="font-semibold text-lg text-gray-900 leading-tight">{deadline.title}</h3>
                          <div className="flex gap-2">
                            <Badge variant="outline" className={cn('text-xs font-medium', getPriorityColor(deadline.priority))}>
                              {deadline.priority}
                            </Badge>
                            <Badge variant="outline" className={cn('text-xs font-medium', getStatusColor(deadline.status))}>
                              {deadline.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{deadline.description}</p>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            {formatDate(deadline.date)}
                          </span>
                          <span className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {getDaysUntilDeadline(deadline.date)}
                          </span>
                          <Badge variant="outline" className="text-xs font-medium">
                            {getTypeLabel(deadline.type)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {deadline.status !== 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCompleteDeadline(deadline.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Complete
                          </Button>
                        )}
                        {deadline.relatedUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={deadline.relatedUrl}>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-6">
          {/* Enhanced Quick Stats */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="shadow-sm border-0 bg-gradient-to-br from-red-50 to-red-25">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-light text-gray-900 mb-1">{overdueCount}</p>
                    <p className="text-sm font-medium text-gray-600">Overdue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-0 bg-gradient-to-br from-amber-50 to-amber-25">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-light text-gray-900 mb-1">
                      {mounted ? deadlines.filter(d => d.status === 'upcoming' && new Date(d.date).getTime() - Date.now() <= 7 * 24 * 60 * 60 * 1000).length : '0'}
                    </p>
                    <p className="text-sm font-medium text-gray-600">Due this week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-0 bg-gradient-to-br from-blue-50 to-blue-25">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <CalendarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-light text-gray-900 mb-1">{upcomingCount}</p>
                    <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-0 bg-gradient-to-br from-emerald-50 to-emerald-25">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-light text-gray-900 mb-1">
                      {deadlines.filter(d => d.status === 'completed').length}
                    </p>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Modern Filters - Same as List View */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by:</span>
            </div>
            <div className="flex items-center gap-4">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px] h-10">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="dbs_expiry">DBS Expiry</SelectItem>
                  <SelectItem value="annual_return">Annual Return</SelectItem>
                  <SelectItem value="policy_review">Policy Review</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px] h-10">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="text-sm text-gray-500">
                {filteredDeadlines.filter(d => d.status === 'upcoming' || d.status === 'overdue').length} upcoming deadlines
              </div>
            </div>
          </div>

          {/* Enhanced Deadlines List - Same Design as List View */}
          <div className="space-y-4">
            {filteredDeadlines.filter(d => d.status === 'upcoming' || d.status === 'overdue').length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">No upcoming deadlines found</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              filteredDeadlines
                .filter(d => d.status === 'upcoming' || d.status === 'overdue')
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map((deadline) => (
                  <Card key={deadline.id} className={cn(
                    'group transition-all duration-200 hover:shadow-lg border-0 shadow-sm',
                    deadline.status === 'overdue' && 'ring-2 ring-red-200 bg-red-50/50',
                    deadline.status === 'completed' && 'opacity-75'
                  )}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-6">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-start gap-3">
                            <h3 className="font-semibold text-lg text-gray-900 leading-tight">{deadline.title}</h3>
                            <div className="flex gap-2">
                              <Badge variant="outline" className={cn('text-xs font-medium', getPriorityColor(deadline.priority))}>
                                {deadline.priority}
                              </Badge>
                              <Badge variant="outline" className={cn('text-xs font-medium', getStatusColor(deadline.status))}>
                                {deadline.status}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">{deadline.description}</p>
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <span className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4" />
                              {formatDate(deadline.date)}
                            </span>
                            <span className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {getDaysUntilDeadline(deadline.date)}
                            </span>
                            <Badge variant="outline" className="text-xs font-medium">
                              {getTypeLabel(deadline.type)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {deadline.status !== 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCompleteDeadline(deadline.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Complete
                            </Button>
                          )}
                          {deadline.relatedUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <Link href={deadline.relatedUrl}>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Deadline Creation Modal */}
      <DeadlineModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSaveDeadline}
        initialDate={selectedDate}
      />
    </div>
  )
}