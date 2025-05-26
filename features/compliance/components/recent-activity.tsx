import React from 'react'
import { EtherealCard, EtherealCardHeader, EtherealCardTitle, EtherealCardContent } from '@/components/custom-ui/ethereal-card'
import { Clock, FileText, UserCheck, Globe, Coins } from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'document' | 'user' | 'international' | 'fundraising'
  action: string
  description: string
  timestamp: string
  user: string
  icon: React.ElementType
}

export function RecentActivity() {
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'user',
      action: 'DBS Check Completed',
      description: 'Sarah Thompson - Enhanced DBS verified',
      timestamp: '2 hours ago',
      user: 'Admin',
      icon: UserCheck
    },
    {
      id: '2',
      type: 'document',
      action: 'Policy Updated',
      description: 'Safeguarding Policy v2.1 uploaded',
      timestamp: '5 hours ago',
      user: 'Jane Doe',
      icon: FileText
    },
    {
      id: '3',
      type: 'international',
      action: 'Activity Approved',
      description: 'Uganda water project risk assessment completed',
      timestamp: '1 day ago',
      user: 'John Smith',
      icon: Globe
    },
    {
      id: '4',
      type: 'fundraising',
      action: 'Collection Registered',
      description: 'Street collection permit #2024-003 added',
      timestamp: '2 days ago',
      user: 'Mike Brown',
      icon: Coins
    },
    {
      id: '5',
      type: 'document',
      action: 'Report Generated',
      description: 'Q3 Compliance Report exported',
      timestamp: '3 days ago',
      user: 'Admin',
      icon: FileText
    }
  ]

  const typeColors = {
    document: 'text-[#B2A1FF]',
    user: 'text-[#B1FA63]',
    international: 'text-[#243837]',
    fundraising: 'text-[#FE7733]'
  }

  return (
    <EtherealCard variant="default">
      <EtherealCardHeader>
        <div className="flex items-center justify-between">
          <EtherealCardTitle>Recent Activity</EtherealCardTitle>
          <span className="text-sm text-[#616161]">Last 7 days</span>
        </div>
      </EtherealCardHeader>
      <EtherealCardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 pb-4 border-b border-[#E0E0E0] last:border-0 last:pb-0"
            >
              <div className={`p-2 rounded-lg bg-[#F5F5F5]`}>
                <activity.icon className={`h-5 w-5 ${typeColors[activity.type]}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-[#243837]">
                  {activity.action}
                </h4>
                <p className="text-sm text-[#616161] mt-1">
                  {activity.description}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-[#9E9E9E]">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {activity.timestamp}
                  </span>
                  <span>by {activity.user}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </EtherealCardContent>
    </EtherealCard>
  )
}