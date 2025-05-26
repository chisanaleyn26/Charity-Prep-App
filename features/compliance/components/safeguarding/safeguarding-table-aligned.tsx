'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return
    
    setDeletingId(id)
    try {
      await deleteSafeguardingRecord(id)
      onRefresh?.()
    } catch (error) {
      console.error('Error deleting record:', error)
      alert('Failed to delete record')
    } finally {
      setDeletingId(null)
    }
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
    
    if (passed === total) return <Badge className="bg-green-100 text-green-800">Compliant</Badge>
    if (passed >= total * 0.75) return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
    return <Badge className="bg-red-100 text-red-800">Non-compliant</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Safeguarding Records</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Person</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>DBS Check</TableHead>
                <TableHead>Compliance</TableHead>
                <TableHead>Risk Factors</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{record.person_name}</div>
                      {record.department && (
                        <div className="text-sm text-gray-500">{record.department}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{record.role_title}</div>
                      <div className="mt-1">{getRoleTypeBadge(record.role_type)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getDBSTypeBadge(record.dbs_check_type)}
                      {record.dbs_certificate_number && (
                        <div className="text-xs text-gray-500">
                          #{record.dbs_certificate_number}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-1">
                        {record.reference_checks_completed ? <Check className="h-3 w-3 text-green-600" /> : <X className="h-3 w-3 text-red-600" />}
                        References
                      </div>
                      <div className="flex items-center gap-1">
                        {record.training_completed ? <Check className="h-3 w-3 text-green-600" /> : <X className="h-3 w-3 text-red-600" />}
                        Training
                      </div>
                      <div className="text-xs text-gray-500">
                        Expires: {formatDate(record.expiry_date)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getComplianceStatus(record)}</TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      {record.works_with_children && (
                        <Badge variant="secondary" className="text-xs">Children</Badge>
                      )}
                      {record.works_with_vulnerable_adults && (
                        <Badge variant="secondary" className="text-xs">Vulnerable Adults</Badge>
                      )}
                      {record.unsupervised_access && (
                        <Badge variant="secondary" className="text-xs">Unsupervised</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={record.is_active ? 'default' : 'secondary'}>
                      {record.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit?.(record)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(record.id)}
                        disabled={deletingId === record.id}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {records.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No safeguarding records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}