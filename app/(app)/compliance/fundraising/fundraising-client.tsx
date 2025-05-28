'use client'

import { useState } from 'react'
import { DollarSign, TrendingUp, Target, AlertCircle } from 'lucide-react'
import { FundraisingTable } from '@/features/compliance/components/fundraising/fundraising-table'
import { FundraisingForm } from '@/features/compliance/components/fundraising/fundraising-form'
import { getFundraisingActivities } from '@/features/compliance/actions/fundraising'
import type { FundraisingActivity } from '@/features/compliance/types/fundraising'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface FundraisingClientProps {
  initialActivities: FundraisingActivity[]
  organizationId: string
}

export default function FundraisingClient({ 
  initialActivities, 
  organizationId 
}: FundraisingClientProps) {
  console.log('🎨 FundraisingClient render:', { 
    initialActivitiesLength: initialActivities.length,
    organizationId,
    sampleActivity: initialActivities[0]
  })
  
  const [activities, setActivities] = useState<FundraisingActivity[]>(initialActivities)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchActivities = async () => {
    try {
      setIsRefreshing(true)
      const data = await getFundraisingActivities()
      setActivities(data)
    } catch (error) {
      console.error('Failed to fetch fundraising activities:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleFormSubmit = () => {
    setIsDialogOpen(false)
    fetchActivities()
  }

  const calculateStats = () => {
    const totalIncome = activities.reduce((sum, a) => sum + (a.amount || 0), 0)
    const donorCount = new Set(activities.map(a => a.donor_name).filter(Boolean)).size
    const giftAidEligible = activities.filter(a => a.gift_aid_eligible).length
    const corporateDonations = activities.filter(a => a.donor_type === 'corporate').length

    return {
      totalIncome,
      donorCount,
      giftAidEligible,
      corporateDonations
    }
  }

  const stats = calculateStats()

  const statCards = [
    {
      title: 'Total Income',
      value: new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(stats.totalIncome),
      description: 'Current year',
      icon: Target,
      color: 'text-primary'
    },
    {
      title: 'Donor Count',
      value: stats.donorCount,
      description: 'Unique donors',
      icon: DollarSign,
      color: 'text-sage-600'
    },
    {
      title: 'Gift Aid Eligible',
      value: stats.giftAidEligible,
      description: 'Eligible donations',
      icon: TrendingUp,
      color: 'text-success'
    },
    {
      title: 'Corporate Donors',
      value: stats.corporateDonations,
      description: 'Business donations',
      icon: AlertCircle,
      color: 'text-muted-foreground'
    }
  ]

  return (
    <>
      <div className="flex gap-2 justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <DollarSign className="h-4 w-4 mr-2" />
              Add Income Record
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Income Record</DialogTitle>
              <DialogDescription>
                Record a new donation or income source
              </DialogDescription>
            </DialogHeader>
            <FundraisingForm onSuccess={handleFormSubmit} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
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

      {/* Activities Table */}
      <FundraisingTable 
        initialActivities={activities}
      />
    </>
  )
}