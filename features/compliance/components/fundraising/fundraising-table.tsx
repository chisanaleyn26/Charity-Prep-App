'use client'

import { useState } from 'react'
import { Edit, Trash2, Target, TrendingUp, Calendar, AlertCircle, MoreHorizontal, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ResponsiveTable, type TableColumn } from '@/components/ui/responsive-table'
import { FundraisingActivity, getActivityTypeLabel, getStatusColor, calculateProgress, getProgressColor, requiresComplianceCheck, getDaysRemaining, getMethodLabel } from '../../types/fundraising'
import { FundraisingForm } from './fundraising-form'
import { deleteFundraisingActivity, markComplianceComplete } from '../../actions/fundraising'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface FundraisingTableProps {
  initialActivities: FundraisingActivity[]
}

export function FundraisingTable({ initialActivities }: FundraisingTableProps) {
  const router = useRouter()
  const [activities, setActivities] = useState(initialActivities)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [editingActivity, setEditingActivity] = useState<FundraisingActivity | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      (activity.campaign_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (activity.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (activity.donor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    
    const matchesType = filterType === 'all' || activity.source === filterType
    const matchesStatus = filterStatus === 'all' || filterStatus === 'completed'

    return matchesSearch && matchesType && matchesStatus
  })

  // Show empty state when no activities
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fundraising Activities</CardTitle>
          <CardDescription>Track donations and income sources</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No fundraising activities yet</h3>
          <p className="text-muted-foreground text-center mb-4">
            Start by recording your first donation or income source using the "Add New Record" button above.
          </p>
        </CardContent>
      </Card>
    )
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this income record?')) return

    const result = await deleteFundraisingActivity(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Income record deleted successfully')
      setActivities(activities.filter(a => a.id !== id))
      router.refresh()
    }
  }

  const handleMarkCompliant = async (id: string) => {
    const result = await markComplianceComplete(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Compliance checks marked as complete')
      setActivities(activities.map(a => 
        a.id === id ? { ...a, compliance_checks_completed: true } : a
      ))
      router.refresh()
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: string | null | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const columns: TableColumn[] = [
    {
      key: 'details',
      label: 'Income Details',
      mobile: 'primary',
      render: (_, activity: FundraisingActivity) => (
        <div>
          <div className="font-medium">
            {activity.campaign_name || activity.donor_name || 'Income Record'}
          </div>
          {activity.notes && (
            <div className="text-sm text-muted-foreground line-clamp-2">
              {activity.notes}
            </div>
          )}
          {activity.donor_name && (
            <div className="text-xs text-muted-foreground mt-1">
              Donor: {activity.donor_name}
            </div>
          )}
          {activity.reference_number && (
            <div className="text-xs text-muted-foreground">
              Ref: {activity.reference_number}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'source',
      label: 'Source',
      mobile: 'visible',
      render: (_, activity: FundraisingActivity) => (
        <Badge variant="outline" className="bg-mist-50 text-mist-700 border-mist-200">
          {getActivityTypeLabel(activity.source)}
        </Badge>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      mobile: 'secondary',
      render: (_, activity: FundraisingActivity) => (
        <div className="space-y-1">
          <div className="text-lg font-semibold">
            {formatCurrency(activity.amount)}
          </div>
          {activity.gift_aid_eligible && (
            <div className="text-xs text-success">
              Gift Aid Eligible
            </div>
          )}
          {activity.restricted_funds && (
            <div className="text-xs text-warning">
              Restricted
            </div>
          )}
        </div>
      )
    },
    {
      key: 'method',
      label: 'Method',
      mobile: 'hidden',
      render: (_, activity: FundraisingActivity) => (
        activity.fundraising_method ? (
          <Badge variant="outline" className="bg-sage-50 text-sage-700 border-sage-200">
            {getMethodLabel(activity.fundraising_method)}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )
      )
    },
    {
      key: 'date',
      label: 'Date',
      mobile: 'visible',
      render: (_, activity: FundraisingActivity) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            {formatDate(activity.date_received)}
          </div>
          <div className="text-xs text-muted-foreground">
            FY {activity.financial_year}
          </div>
        </div>
      )
    },
    {
      key: 'compliance',
      label: 'Compliance',
      mobile: 'visible',
      render: (_, activity: FundraisingActivity) => {
        const needsCompliance = requiresComplianceCheck(activity)
        return needsCompliance ? (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
            <AlertCircle className="h-3 w-3 mr-1" />
            Review Required
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      mobile: 'visible',
      render: (_, activity: FundraisingActivity) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setEditingActivity(activity)
                  setShowEditDialog(true)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(activity.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ]

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Income Records</CardTitle>
          <CardDescription>
            Track and manage your charity's income and fundraising compliance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveTable
            data={filteredActivities}
            columns={columns}
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search income records..."
            emptyMessage="No income records found"
            className="mt-6"
            filters={[
              {
                label: 'Source',
                value: filterType,
                onChange: setFilterType,
                options: [
                  { value: 'all', label: 'All Sources' },
                  { value: 'donations_legacies', label: 'Donations & Legacies' },
                  { value: 'charitable_activities', label: 'Charitable Activities' },
                  { value: 'other_trading', label: 'Other Trading' },
                  { value: 'investments', label: 'Investments' },
                  { value: 'other', label: 'Other' }
                ]
              },
              {
                label: 'Status',
                value: filterStatus,
                onChange: setFilterStatus,
                options: [
                  { value: 'all', label: 'All Records' },
                  { value: 'completed', label: 'Received' }
                ]
              }
            ]}
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Income Record</DialogTitle>
            <DialogDescription>
              Update the details of this income record
            </DialogDescription>
          </DialogHeader>
          <FundraisingForm
            activity={editingActivity || undefined}
            onSuccess={() => {
              setShowEditDialog(false)
              setEditingActivity(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}