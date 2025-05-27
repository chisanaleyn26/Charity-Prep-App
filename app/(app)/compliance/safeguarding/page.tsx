'use client'

import { useState, useEffect } from 'react'
import { Shield, UserCheck, AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import { SafeguardingTableAligned } from '@/features/compliance/components/safeguarding/safeguarding-table-aligned'
import { SafeguardingFormAligned } from '@/features/compliance/components/safeguarding/safeguarding-form-aligned'
import { getSafeguardingRecords } from '@/features/compliance/services/safeguarding-aligned'
import type { SafeguardingRecord } from '@/features/compliance/types/safeguarding-aligned'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { mockSafeguardingRecords } from '@/lib/mock-data'
import { ExportButton } from '@/components/common/export-button'
import { createClient } from '@/lib/supabase/client'

// MOCK MODE
const MOCK_MODE = true

export default function SafeguardingPage() {
  const [records, setRecords] = useState<SafeguardingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<SafeguardingRecord | undefined>()
  const [organizationId, setOrganizationId] = useState<string>('')

  const fetchRecords = async () => {
    try {
      setLoading(true)
      if (MOCK_MODE) {
        // Convert mock data to SafeguardingRecord format
        const mockRecords: SafeguardingRecord[] = mockSafeguardingRecords.map(record => ({
          ...record,
          is_active: true,
          reference_checks_completed: true,
          reference_check_date: record.dbs_check_date,
          id_verified: true,
          verification_date: record.dbs_check_date,
          verification_method: 'passport'
        }))
        setRecords(mockRecords)
      } else {
        const data = await getSafeguardingRecords()
        setRecords(data)
      }
    } catch (error) {
      console.error('Failed to fetch safeguarding records:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
    // Get organization ID for export
    const getOrgId = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: membership } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .single()
        if (membership) {
          setOrganizationId(membership.organization_id)
        }
      }
    }
    getOrgId()
  }, [])

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
    <div className="space-y-8">
      {/* Enhanced Typography Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-3">
          <h1 className="text-5xl font-extralight text-gray-900 tracking-tight leading-none flex items-center gap-4">
            <Shield className="h-12 w-12 text-gray-600" />
            Safeguarding
          </h1>
          <p className="text-lg text-gray-600 font-normal leading-relaxed tracking-wide">
            Manage DBS checks and safeguarding compliance for all staff and volunteers.
          </p>
        </div>
        
        <div className="flex gap-2">
          {organizationId && (
            <ExportButton 
              organizationId={organizationId}
              dataType="safeguarding"
              variant="outline"
            />
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  setEditingRecord(undefined)
                  setIsDialogOpen(true)
                }}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Add Safeguarding Record
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
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
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <stat.icon className="h-4 w-4 text-gray-600" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider leading-tight">
                {stat.title}
              </h3>
              <p className="text-3xl font-extralight text-gray-900 tracking-tight leading-none">
                {stat.value}
              </p>
              <p className="text-xs text-gray-600 font-medium tracking-wide">
                {stat.description}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Safeguarding Records Table */}
      {loading ? (
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <SafeguardingTableAligned 
          records={records}
          onEdit={handleEdit}
          onRefresh={fetchRecords}
        />
      )}
    </div>
  )
}