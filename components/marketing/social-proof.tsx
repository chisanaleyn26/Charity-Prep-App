import React from 'react'
import { EtherealCard } from '@/components/custom-ui/ethereal-card'
import { Users, TrendingUp, Star } from 'lucide-react'

export function SocialProof() {
  const stats = [
    {
      icon: Users,
      value: '247',
      label: 'Charities compliant',
      color: 'text-[#B1FA63]',
    },
    {
      icon: TrendingUp,
      value: '92%',
      label: 'Average compliance score',
      color: 'text-[#B2A1FF]',
    },
    {
      icon: Star,
      value: '4.8',
      label: 'Trustpilot rating',
      color: 'text-[#FE7733]',
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <EtherealCard key={index} variant="default" className="text-center p-8">
              <stat.icon className={`h-10 w-10 mx-auto mb-4 ${stat.color}`} />
              <div className="text-4xl font-bold text-[#243837] mb-2">
                {stat.value}
              </div>
              <p className="text-[#616161]">{stat.label}</p>
            </EtherealCard>
          ))}
        </div>
      </div>
    </section>
  )
}