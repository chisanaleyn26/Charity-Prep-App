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
            <Button className="bg-[#B1FA63] hover:bg-[#9FE851] text-[#243837] font-medium border-[#B1FA63] hover:border-[#9FE851]">
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

      {/* Activities Table */}
      <FundraisingTable 
        initialActivities={activities}
      />
    </>
  )
}