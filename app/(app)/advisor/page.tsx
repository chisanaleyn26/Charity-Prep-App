import { Metadata } from 'next'
import { MultiOrgDashboard } from '@/features/advisor/components/multi-org-dashboard'

export const metadata: Metadata = {
  title: 'Advisor Dashboard - Charity Prep',
  description: 'Multi-organization compliance overview for advisors',
}

export default function AdvisorPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold leading-6 text-gray-900">Advisor Dashboard</h1>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Monitor compliance across all your organizations. View urgent actions, compare performance, 
          and manage bulk operations from a unified interface.
        </p>
      </div>
      
      <MultiOrgDashboard />
    </div>
  )
}