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

export default function SafeguardingPage() {
  const [records, setRecords] = useState<SafeguardingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<SafeguardingRecord | undefined>()

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const data = await getSafeguardingRecords()
      setRecords(data)
    } catch (error) {
      console.error('Failed to fetch safeguarding records:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Safeguarding
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage DBS checks and safeguarding compliance
          </p>
        </div>
        
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

      {/* Stats Cards - Bento Style Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
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