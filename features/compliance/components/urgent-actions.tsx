import React from 'react'
import { EtherealCard, EtherealCardHeader, EtherealCardTitle, EtherealCardContent } from '@/components/custom-ui/ethereal-card'
import { EtherealButton } from '@/components/custom-ui/ethereal-button'
import { AlertTriangle, Calendar, FileWarning, Users } from 'lucide-react'

interface UrgentAction {
  id: string
  type: 'expiry' | 'missing' | 'review'
  title: string
  description: string
  dueDate: string
  icon: React.ElementType
  priority: 'high' | 'critical'
}

export function UrgentActions() {
  const actions: UrgentAction[] = [
    {
      id: '1',
      type: 'expiry',
      title: '3 DBS checks expiring',
      description: 'John Smith, Sarah Jones, and Mike Brown need renewal',
      dueDate: '5 days',
      icon: Users,
      priority: 'critical'
    },
    {
      id: '2',
      type: 'missing',
      title: 'Safeguarding policy outdated',
      description: 'Policy last updated over 12 months ago',
      dueDate: 'Overdue',
      icon: FileWarning,
      priority: 'critical'
    },
    {
      id: '3',
      type: 'review',
      title: 'Overseas activity review',
      description: 'Kenya project needs quarterly review',
      dueDate: '2 weeks',
      icon: Calendar,
      priority: 'high'
    },
  ]

  return (
    <EtherealCard variant="warning" className="border-2">
      <EtherealCardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-[#FE7733]" />
          <EtherealCardTitle>Urgent Actions Required</EtherealCardTitle>
        </div>
      </EtherealCardHeader>
      <EtherealCardContent>
        <div className="space-y-4">
          {actions.map((action) => (
            <div
              key={action.id}
              className="flex items-start gap-4 p-4 bg-[#FEF3EC] rounded-lg border border-[#FE7733]/20"
            >
              <div className="shrink-0 p-2 bg-white rounded-lg">
                <action.icon className="h-5 w-5 text-[#FE7733]" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-medium text-[#243837]">
                      {action.title}
                    </h4>
                    <p className="text-sm text-[#616161] mt-1">
                      {action.description}
                    </p>
                    <p className="text-xs text-[#FE7733] font-medium mt-2">
                      Due: {action.dueDate}
                    </p>
                  </div>
                  
                  <EtherealButton
                    size="sm"
                    variant="warning"
                    className="shrink-0"
                  >
                    Fix Now
                  </EtherealButton>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <EtherealButton variant="tertiary" className="w-full">
            View All Actions
          </EtherealButton>
        </div>
      </EtherealCardContent>
    </EtherealCard>
  )
}