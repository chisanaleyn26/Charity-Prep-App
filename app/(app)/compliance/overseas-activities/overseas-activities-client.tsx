'use client'

import { useState } from 'react'
import { Globe, DollarSign, AlertTriangle, MapPin } from 'lucide-react'
import { OverseasActivitiesTable } from '@/features/compliance/components/overseas/activities-table-aligned'
import { OverseasActivitiesForm } from '@/features/compliance/components/overseas/activities-form-aligned'
import { getOverseasActivities } from '@/features/compliance/actions/overseas-activities'
import type { OverseasActivity } from '@/features/compliance/types/overseas-activities'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface OverseasActivitiesClientProps {
  initialActivities: OverseasActivity[]
  organizationId: string
}

export default function OverseasActivitiesClient({ 
  initialActivities, 
  organizationId 
}: OverseasActivitiesClientProps) {
  const [activities, setActivities] = useState<OverseasActivity[]>(initialActivities)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchActivities = async () => {
    try {
      setIsRefreshing(true)
      const data = await getOverseasActivities()
      setActivities(data)
    } catch (error) {
      console.error('Failed to fetch overseas activities:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleFormSubmit = () => {
    setIsDialogOpen(false)
    fetchActivities()
  }

  const calculateStats = () => {
    const totalCountries = new Set(activities.map(a => a.country_code).filter(Boolean)).size
    const activeActivities = activities.length
    const totalAnnualSpend = activities.reduce((sum, activity) => sum + (activity.amount_gbp || 0), 0)
    const highRiskActivities = activities.filter(a => a.requires_reporting && !a.reported_to_commission).length

    return {
      totalCountries,
      activeActivities,
      totalAnnualSpend,
      highRiskActivities
    }
  }

  const stats = calculateStats()

  const statCards = [
    {
      title: 'Countries',
      value: stats.totalCountries,
      description: 'Active locations',
      icon: MapPin,
      color: 'text-primary'
    },
    {
      title: 'Active Activities',
      value: stats.activeActivities,
      description: 'Ongoing operations',
      icon: Globe,
      color: 'text-sage-600'
    },
    {
      title: 'Annual Spend',
      value: new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(stats.totalAnnualSpend),
      description: 'Total overseas budget',
      icon: DollarSign,
      color: 'text-success'
    },
    {
      title: 'High Risk',
      value: stats.highRiskActivities,
      description: 'Activities needing review',
      icon: AlertTriangle,
      color: 'text-warning'
    }
  ]

  return (
    <>
      <div className="flex gap-2 justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#B1FA63] hover:bg-[#9FE851] text-[#243837] font-medium border-[#B1FA63] hover:border-[#9FE851]">
              <Globe className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Overseas Activity</DialogTitle>
              <DialogDescription>
                Record a new overseas activity or operation
              </DialogDescription>
            </DialogHeader>
            <OverseasActivitiesForm onSuccess={handleFormSubmit} />
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
      <OverseasActivitiesTable 
        initialActivities={activities}
      />
    </>
  )
}