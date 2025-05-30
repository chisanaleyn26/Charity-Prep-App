'use client'

import { useState } from 'react'
import { Shield, UserCheck, AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import { SafeguardingTableAligned } from '@/features/compliance/components/safeguarding/safeguarding-table-aligned'
import { SafeguardingFormAligned } from '@/features/compliance/components/safeguarding/safeguarding-form-aligned'
import { getSafeguardingRecords } from '@/features/compliance/actions/safeguarding'
import type { SafeguardingRecord } from '@/features/compliance/types/safeguarding-aligned'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ExportButton } from '@/components/common/export-button'

interface SafeguardingClientProps {
  initialRecords: SafeguardingRecord[]
  organizationId: string
}

export default function SafeguardingClient({ 
  initialRecords, 
  organizationId 
}: SafeguardingClientProps) {
  const [records, setRecords] = useState<SafeguardingRecord[]>(initialRecords)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<SafeguardingRecord | undefined>()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchRecords = async () => {
    try {
      setIsRefreshing(true)
      const data = await getSafeguardingRecords()
      setRecords(data)
    } catch (error) {
      console.error('Failed to fetch safeguarding records:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleFormSubmit = () => {
    setIsDialogOpen(false)
    setEditingRecord(undefined)
    fetchRecords()
  }

  const handleEdit = (record: SafeguardingRecord) => {
    setEditingRecord(record)
    setIsDialogOpen(true)
  }

  const calculateStats = () => {
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    
    const activeRecords = records.filter(r => r.is_active)
    const expiringSoon = activeRecords.filter(r => {
      if (!r.expiry_date) return false
      const expiryDate = new Date(r.expiry_date)
      return expiryDate > now && expiryDate <= thirtyDaysFromNow
    })
    const expired = activeRecords.filter(r => {
      if (!r.expiry_date) return false
      return new Date(r.expiry_date) <= now
    })
    
    const compliant = activeRecords.filter(r => 
      r.dbs_certificate_number && 
      r.reference_checks_completed && 
      r.training_completed &&
      (!r.expiry_date || new Date(r.expiry_date) > now)
    )
    
    const complianceRate = activeRecords.length > 0 
      ? Math.round((compliant.length / activeRecords.length) * 100)
      : 100

    return {
      total: activeRecords.length,
      expiring: expiringSoon.length,
      expired: expired.length,
      complianceRate
    }
  }

  const stats = calculateStats()

  const statCards = [
    {
      title: 'Total Checks',
      value: stats.total,
      description: 'Active DBS records',
      icon: UserCheck,
      color: 'text-primary'
    },
    {
      title: 'Expiring Soon',
      value: stats.expiring,
      description: 'Within 30 days',
      icon: Clock,
      color: 'text-warning'
    },
    {
      title: 'Expired',
      value: stats.expired,
      description: 'Need renewal',
      icon: AlertTriangle,
      color: 'text-destructive'
    },
    {
      title: 'Compliance Rate',
      value: `${stats.complianceRate}%`,
      description: 'Valid checks',
      icon: CheckCircle,
      color: 'text-success'
    }
  ]

  return (
    <>
      <div className="flex gap-2 justify-end">
        <ExportButton 
          organizationId={organizationId}
          dataType="safeguarding"
          variant="outline"
        />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-[#B1FA63] hover:bg-[#9FE851] text-[#243837] font-medium border-[#B1FA63] hover:border-[#9FE851]"
              onClick={() => {
                setEditingRecord(undefined)
                setIsDialogOpen(true)
              }}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Add Safeguarding Record
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRecord ? 'Edit' : 'Add New'} Safeguarding Record
              </DialogTitle>
              <DialogDescription>
                Record DBS checks and safeguarding information for staff and volunteers
              </DialogDescription>
            </DialogHeader>
            <SafeguardingFormAligned 
              record={editingRecord}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setIsDialogOpen(false)
                setEditingRecord(undefined)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#B1FA63]/30 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 bg-[#243837] rounded-lg flex items-center justify-center group-hover:scale-105 group-hover:bg-[#B1FA63] transition-all duration-200 flex-shrink-0">
                <stat.icon className="h-5 w-5 text-[#B1FA63] group-hover:text-[#243837]" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-normal">
                {stat.title}
              </h3>
              <p className="text-3xl font-light text-gray-900 leading-none tracking-tight">
                {stat.value}
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {stat.description}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Safeguarding Records Table */}
      <SafeguardingTableAligned 
        records={records}
        onEdit={handleEdit}
        onRefresh={fetchRecords}
      />
    </>
  )
}