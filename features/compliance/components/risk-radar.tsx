import React from 'react'
import { EtherealCard, EtherealCardHeader, EtherealCardTitle, EtherealCardContent } from '@/components/custom-ui/ethereal-card'
import { Shield, Globe, Coins, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RiskItem {
  category: string
  icon: React.ElementType
  status: 'good' | 'warning' | 'critical'
  count: number
  description: string
}

export function RiskRadar() {
  const riskItems: RiskItem[] = [
    {
      category: 'Safeguarding',
      icon: Shield,
      status: 'good',
      count: 45,
      description: 'All DBS checks up to date'
    },
    {
      category: 'International',
      icon: Globe,
      status: 'warning',
      count: 3,
      description: '3 activities need review'
    },
    {
      category: 'Fundraising',
      icon: Coins,
      status: 'good',
      count: 12,
      description: 'All records compliant'
    },
    {
      category: 'Documents',
      icon: FileText,
      status: 'critical',
      count: 2,
      description: '2 policies expired'
    },
  ]

  const statusConfig = {
    good: {
      color: 'text-[#B1FA63]',
      bgColor: 'bg-[#B1FA63]/10',
      icon: CheckCircle,
    },
    warning: {
      color: 'text-[#FE7733]',
      bgColor: 'bg-[#FE7733]/10',
      icon: Clock,
    },
    critical: {
      color: 'text-[#EF4444]',
      bgColor: 'bg-[#EF4444]/10',
      icon: AlertCircle,
    },
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#243837] mb-6">Risk Radar</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {riskItems.map((item) => {
          const config = statusConfig[item.status]
          const StatusIcon = config.icon
          
          return (
            <EtherealCard 
              key={item.category} 
              variant="default"
              className="hover:shadow-md transition-shadow cursor-pointer"
            >
              <EtherealCardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn('p-3 rounded-lg', config.bgColor)}>
                    <item.icon className={cn('h-6 w-6', config.color)} />
                  </div>
                  <StatusIcon className={cn('h-5 w-5', config.color)} />
                </div>
                
                <h3 className="font-semibold text-[#243837] mb-1">
                  {item.category}
                </h3>
                
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold text-[#243837]">
                    {item.count}
                  </span>
                  <span className="text-sm text-[#616161]">
                    records
                  </span>
                </div>
                
                <p className="text-sm text-[#616161]">
                  {item.description}
                </p>
              </EtherealCardContent>
            </EtherealCard>
          )
        })}
      </div>
    </div>
  )
}