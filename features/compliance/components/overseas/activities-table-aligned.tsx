'use client'

import { useState } from 'react'
import { Edit, Trash2, Globe, AlertTriangle, DollarSign, Calendar, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ResponsiveTable, type TableColumn } from '@/components/ui/responsive-table'
import { OverseasActivity, getActivityTypeLabel, getTransferMethodColor, getRiskLevel, getRiskColor } from '../../types/overseas-activities'
import { OverseasActivitiesForm } from './activities-form-aligned'
import { deleteOverseasActivity } from '../../actions/overseas-activities'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { countries } from '@/lib/data/countries'

interface OverseasActivitiesTableProps {
  initialActivities: OverseasActivity[]
}

export function OverseasActivitiesTable({ initialActivities }: OverseasActivitiesTableProps) {
  const router = useRouter()
  const [activities, setActivities] = useState(initialActivities)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [editingActivity, setEditingActivity] = useState<OverseasActivity | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const getCountryName = (code: string) => {
    const country = countries.find(c => c.code === code)
    return country?.name || code
  }

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      (activity.activity_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCountryName(activity.country_code || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || activity.activity_type === filterType

    return matchesSearch && matchesType
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this overseas activity?')) return

    const result = await deleteOverseasActivity(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Activity deleted successfully')
      setActivities(activities.filter(a => a.id !== id))
      router.refresh()
    }
  }

  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
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
      key: 'activity',
      label: 'Activity',
      mobile: 'primary',
      render: (_, activity: OverseasActivity) => (
        <div>
          <div className="font-medium">{activity.activity_name}</div>
          {activity.description && (
            <div className="text-sm text-muted-foreground line-clamp-2">
              {activity.description}
            </div>
          )}
          {activity.project_code && (
            <div className="text-xs text-muted-foreground mt-1">
              Code: {activity.project_code}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'country',
      label: 'Country',
      mobile: 'secondary',
      render: (_, activity: OverseasActivity) => (
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          {getCountryName(activity.country_code)}
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      mobile: 'visible',
      render: (_, activity: OverseasActivity) => (
        <Badge variant="outline" className="bg-mist-50 text-mist-700 border-mist-200">
          {getActivityTypeLabel(activity.activity_type)}
        </Badge>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      mobile: 'visible',
      render: (_, activity: OverseasActivity) => (
        <div className="text-sm">
          <div className="font-medium">
            {formatCurrency(activity.amount_gbp, 'GBP')}
          </div>
          {activity.currency && activity.currency !== 'GBP' && (
            <div className="text-xs text-muted-foreground">
              {formatCurrency(activity.amount, activity.currency)}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'transfer',
      label: 'Transfer',
      mobile: 'hidden',
      render: (_, activity: OverseasActivity) => (
        <div className="space-y-1">
          <Badge variant="outline" className={getTransferMethodColor(activity.transfer_method)}>
            {activity.transfer_method.replace(/_/g, ' ')}
          </Badge>
          <div className="text-xs text-muted-foreground">
            {formatDate(activity.transfer_date)}
          </div>
        </div>
      )
    },
    {
      key: 'compliance',
      label: 'Compliance',
      mobile: 'visible',
      render: (_, activity: OverseasActivity) => {
        const riskLevel = getRiskLevel(activity)
        return (
          <div className="space-y-1">
            {activity.sanctions_check_completed ? (
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                Sanctions ✓
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                Sanctions Pending
              </Badge>
            )}
            <Badge variant="outline" className={getRiskColor(riskLevel)}>
              {riskLevel} risk
            </Badge>
          </div>
        )
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      mobile: 'visible',
      render: (_, activity: OverseasActivity) => (
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
          <CardTitle>Overseas Activities</CardTitle>
          <CardDescription>
            Track and manage your charity's international operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveTable
            data={filteredActivities}
            columns={columns}
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search activities..."
            emptyMessage="No overseas activities found"
            className="mt-6"
            filters={[
              {
                label: 'Type',
                value: filterType,
                onChange: setFilterType,
                options: [
                  { value: 'all', label: 'All Types' },
                  { value: 'humanitarian_aid', label: 'Humanitarian Aid' },
                  { value: 'development', label: 'Development' },
                  { value: 'education', label: 'Education' },
                  { value: 'healthcare', label: 'Healthcare' },
                  { value: 'emergency_relief', label: 'Emergency Relief' },
                  { value: 'capacity_building', label: 'Capacity Building' },
                  { value: 'advocacy', label: 'Advocacy' },
                  { value: 'other', label: 'Other' }
                ]
              }
            ]}
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Overseas Activity</DialogTitle>
            <DialogDescription>
              Update the details of this overseas activity
            </DialogDescription>
          </DialogHeader>
          <OverseasActivitiesForm
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