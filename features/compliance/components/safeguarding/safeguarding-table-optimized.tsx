'use client'

import { useState, useMemo } from 'react'
import { OptimizedTable } from '@/components/ui/virtual-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, X, Edit, Trash, AlertCircle } from 'lucide-react'
import { deleteSafeguardingRecord } from '../../services/safeguarding-aligned'
import type { SafeguardingRecord } from '../../types/safeguarding-aligned'
import { format, differenceInDays } from 'date-fns'
import { toast } from 'sonner'

interface SafeguardingTableOptimizedProps {
  records: SafeguardingRecord[]
  onEdit?: (record: SafeguardingRecord) => void
  onRefresh?: () => void
}

export function SafeguardingTableOptimized({ 
  records, 
  onEdit, 
  onRefresh 
}: SafeguardingTableOptimizedProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (record: SafeguardingRecord) => {
    if (!confirm('Are you sure you want to delete this record?')) return
    
    setDeletingId(record.id)
    try {
      await deleteSafeguardingRecord(record.id)
      toast.success('Record deleted successfully')
      onRefresh?.()
    } catch (error) {
      console.error('Error deleting record:', error)
      toast.error('Failed to delete record')
    } finally {
      setDeletingId(null)
    }
  }

  const getExpiryStatus = (expiryDate: Date) => {
    const days = differenceInDays(new Date(expiryDate), new Date())
    
    if (days < 0) return { status: 'expired', color: 'destructive' }
    if (days <= 30) return { status: 'expiring', color: 'warning' }
    if (days <= 90) return { status: 'soon', color: 'default' }
    return { status: 'active', color: 'success' }
  }

  const getRoleTypeBadge = (roleType: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      employee: 'default',
      volunteer: 'secondary',
      trustee: 'outline',
      contractor: 'destructive'
    }
    return variants[roleType] || 'default'
  }

  const columns = useMemo(() => [
    {
      key: 'person_name',
      header: 'Person',
      width: 200,
      render: (record: SafeguardingRecord) => (
        <div>
          <div className="font-medium">{record.person_name}</div>
          <div className="text-sm text-muted-foreground">{record.role_title}</div>
        </div>
      )
    },
    {
      key: 'role_type',
      header: 'Type',
      width: 120,
      render: (record: SafeguardingRecord) => (
        <Badge variant={getRoleTypeBadge(record.role_type)}>
          {record.role_type}
        </Badge>
      )
    },
    {
      key: 'dbs_check_type',
      header: 'DBS Check',
      width: 150,
      render: (record: SafeguardingRecord) => (
        <div className="space-y-1">
          <div className="text-sm font-medium capitalize">
            {record.dbs_check_type.replace('_', ' + ')}
          </div>
          {record.dbs_certificate_number && (
            <div className="text-xs text-muted-foreground">
              #{record.dbs_certificate_number}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'expiry_date',
      header: 'Expiry',
      width: 140,
      render: (record: SafeguardingRecord) => {
        const { status, color } = getExpiryStatus(record.expiry_date)
        const days = differenceInDays(new Date(record.expiry_date), new Date())
        
        return (
          <div className="space-y-1">
            <Badge variant={color as any} className="text-xs">
              {status === 'expired' ? 'Expired' : 
               status === 'expiring' ? `${days}d left` :
               status === 'soon' ? `${days}d` : 
               'Active'}
            </Badge>
            <div className="text-xs text-muted-foreground">
              {format(new Date(record.expiry_date), 'dd MMM yyyy')}
            </div>
          </div>
        )
      }
    },
    {
      key: 'compliance',
      header: 'Compliance',
      width: 200,
      render: (record: SafeguardingRecord) => (
        <div className="flex flex-wrap gap-1">
          {record.reference_checks_completed && (
            <Badge variant="outline" className="text-xs">
              <Check className="w-3 h-3 mr-1" />
              References
            </Badge>
          )}
          {record.training_completed && (
            <Badge variant="outline" className="text-xs">
              <Check className="w-3 h-3 mr-1" />
              Training
            </Badge>
          )}
          {!record.reference_checks_completed && !record.training_completed && (
            <Badge variant="destructive" className="text-xs">
              <X className="w-3 h-3 mr-1" />
              Incomplete
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'risk',
      header: 'Risk Level',
      width: 120,
      render: (record: SafeguardingRecord) => {
        const hasHighRisk = record.works_with_children || 
                           record.works_with_vulnerable_adults || 
                           record.unsupervised_access
        
        return hasHighRisk ? (
          <Badge variant="destructive" className="text-xs">
            <AlertCircle className="w-3 h-3 mr-1" />
            High Risk
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">
            Standard
          </Badge>
        )
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 100,
      render: (record: SafeguardingRecord) => (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit?.(record)}
            disabled={deletingId === record.id}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDelete(record)}
            disabled={deletingId === record.id}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ], [deletingId, onEdit])

  // Sort records by expiry date (most urgent first)
  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      const aDays = differenceInDays(new Date(a.expiry_date), new Date())
      const bDays = differenceInDays(new Date(b.expiry_date), new Date())
      return aDays - bDays
    })
  }, [records])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {records.length} records • {' '}
          {records.filter(r => differenceInDays(new Date(r.expiry_date), new Date()) < 0).length} expired • {' '}
          {records.filter(r => differenceInDays(new Date(r.expiry_date), new Date()) <= 30 && differenceInDays(new Date(r.expiry_date), new Date()) > 0).length} expiring soon
        </div>
      </div>
      
      <OptimizedTable
        data={sortedRecords}
        columns={columns}
        searchable
        sortable
        searchKeys={['person_name', 'role_title', 'dbs_certificate_number']}
        visibleRows={10}
        rowHeight={80}
        className="h-[600px]"
        onRowClick={onEdit}
      />
    </div>
  )
}