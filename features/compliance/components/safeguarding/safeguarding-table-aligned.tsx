'use client'

import { useState } from 'react'
import { ResponsiveTable, MobileStatusBadge, type TableColumn, type TableAction } from '@/components/ui/responsive-table'
import { Badge } from '@/components/ui/badge'
import { Check, X, Edit, Trash } from 'lucide-react'
import { deleteSafeguardingRecord } from '../../services/safeguarding-aligned'
import type { SafeguardingRecord } from '../../types/safeguarding-aligned'

interface SafeguardingTableProps {
  records: SafeguardingRecord[]
  onEdit?: (record: SafeguardingRecord) => void
  onRefresh?: () => void
}

export function SafeguardingTableAligned({ records, onEdit, onRefresh }: SafeguardingTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleDelete = async (record: SafeguardingRecord) => {
    if (!confirm('Are you sure you want to delete this record?')) return
    
    setDeletingId(record.id)
    try {
      await deleteSafeguardingRecord(record.id)
      onRefresh?.()
    } catch (error) {
      console.error('Error deleting record:', error)
      alert('Failed to delete record')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // In a real app, you'd filter the data or make an API call
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString()
  }

  const getRoleTypeBadge = (roleType: string) => {
    const colors: Record<string, string> = {
      employee: 'bg-blue-100 text-blue-800',
      volunteer: 'bg-green-100 text-green-800',
      trustee: 'bg-purple-100 text-purple-800',
      contractor: 'bg-orange-100 text-orange-800'
    }
    return (
      <Badge className={colors[roleType] || 'bg-gray-100 text-gray-800'}>
        {roleType.charAt(0).toUpperCase() + roleType.slice(1)}
      </Badge>
    )
  }

  const getDBSTypeBadge = (dbsType: string) => {
    const labels: Record<string, string> = {
      basic: 'Basic',
      standard: 'Standard', 
      enhanced: 'Enhanced',
      enhanced_barred: 'Enhanced + Barred'
    }
    return <Badge variant="outline">{labels[dbsType] || dbsType}</Badge>
  }

  const getComplianceStatus = (record: SafeguardingRecord) => {
    const checks = [
      record.dbs_certificate_number,
      record.reference_checks_completed,
      record.training_completed,
      new Date(record.expiry_date) > new Date()
    ]
    
    const passed = checks.filter(Boolean).length
    const total = checks.length
    
    if (passed === total) return <MobileStatusBadge status="compliant">Compliant</MobileStatusBadge>
    if (passed >= total * 0.75) return <MobileStatusBadge status="warning">Partial</MobileStatusBadge>
    return <MobileStatusBadge status="expired">Non-compliant</MobileStatusBadge>
  }

  const getRiskFactors = (record: SafeguardingRecord) => {
    const factors = []
    if (record.works_with_children) factors.push('Children')
    if (record.works_with_vulnerable_adults) factors.push('Vulnerable Adults')
    if (record.unsupervised_access) factors.push('Unsupervised')
    
    return (
      <div className="flex flex-wrap gap-1">
        {factors.map((factor, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {factor}
          </Badge>
        ))}
      </div>
    )
  }

  const getDBSChecks = (record: SafeguardingRecord) => (
    <div className="space-y-1 text-sm">
      <div className="flex items-center gap-1">
        {record.reference_checks_completed ? 
          <Check className="h-3 w-3 text-green-600" /> : 
          <X className="h-3 w-3 text-red-600" />
        }
        <span>References</span>
      </div>
      <div className="flex items-center gap-1">
        {record.training_completed ? 
          <Check className="h-3 w-3 text-green-600" /> : 
          <X className="h-3 w-3 text-red-600" />
        }
        <span>Training</span>
      </div>
      <div className="text-xs text-gray-500">
        Expires: {formatDate(record.expiry_date)}
      </div>
    </div>
  )

  // Define table columns for responsive table
  const columns: TableColumn[] = [
    {
      key: 'person_name',
      label: 'Person',
      mobile: 'primary',
      sortable: true,
      render: (value, record) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          {record.department && (
            <div className="text-sm text-gray-500">{record.department}</div>
          )}
        </div>
      )
    },
    {
      key: 'role_type',
      label: 'Role',
      mobile: 'primary',
      render: (value, record) => (
        <div>
          <div className="font-medium text-sm mb-1">{record.role_title}</div>
          {getRoleTypeBadge(value)}
        </div>
      )
    },
    {
      key: 'dbs_check_type',
      label: 'DBS Type',
      mobile: 'secondary',
      render: (value, record) => (
        <div className="space-y-1">
          {getDBSTypeBadge(value)}
          {record.dbs_certificate_number && (
            <div className="text-xs text-gray-500 font-mono">
              #{record.dbs_certificate_number}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'dbs_checks',
      label: 'DBS Checks',
      mobile: 'secondary',
      render: (value, record) => getDBSChecks(record)
    },
    {
      key: 'compliance_status',
      label: 'Compliance',
      mobile: 'visible',
      render: (value, record) => getComplianceStatus(record)
    },
    {
      key: 'risk_factors',
      label: 'Risk Factors',
      mobile: 'hidden',
      render: (value, record) => getRiskFactors(record)
    },
    {
      key: 'is_active',
      label: 'Status',
      mobile: 'secondary',
      render: (value) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    }
  ]

  // Define table actions
  const actions: TableAction[] = [
    {
      label: 'Edit',
      icon: <Edit className="w-4 h-4" />,
      onClick: (record) => onEdit?.(record)
    },
    {
      label: 'Delete',
      icon: <Trash className="w-4 h-4" />,
      onClick: handleDelete,
      variant: 'destructive',
      disabled: (record) => deletingId === record.id
    }
  ]

  // Filter records based on search
  const filteredRecords = records.filter(record => {
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    return (
      record.person_name.toLowerCase().includes(searchLower) ||
      record.role_type.toLowerCase().includes(searchLower) ||
      record.role_title.toLowerCase().includes(searchLower) ||
      (record.dbs_certificate_number && record.dbs_certificate_number.toLowerCase().includes(searchLower)) ||
      (record.department && record.department.toLowerCase().includes(searchLower))
    )
  })

  return (
    <ResponsiveTable
      data={filteredRecords}
      columns={columns}
      actions={actions}
      title="Safeguarding Records"
      subtitle={`${filteredRecords.length} record${filteredRecords.length !== 1 ? 's' : ''} • Track DBS checks, training, and compliance status`}
      searchable={true}
      exportable={true}
      emptyMessage="No safeguarding records found. Add your first DBS record to get started with compliance tracking."
      onSearch={handleSearch}
      onExport={() => {
        // In a real app, implement CSV export
        console.log('Export safeguarding records')
      }}
      className="w-full"
    />
  )
}