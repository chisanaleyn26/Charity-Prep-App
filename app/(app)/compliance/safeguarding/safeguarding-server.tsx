import { Shield } from 'lucide-react'
import { getCurrentUserOrganization } from '@/lib/supabase/server'
import { fetchSafeguardingRecords } from '@/features/compliance/services/safeguarding.service'
import SafeguardingClient from './safeguarding-client'
import { Card, CardContent } from '@/components/ui/card'

async function SafeguardingContent() {
  const currentOrgData = await getCurrentUserOrganization()
  
  if (!currentOrgData || !currentOrgData.organization) {
    return <div>Please select an organization to view safeguarding records</div>
  }

  const records = await fetchSafeguardingRecords(currentOrgData.organizationId)

  return (
    <SafeguardingClient 
      initialRecords={records} 
      organizationId={currentOrgData.organizationId}
    />
  )
}

export default function SafeguardingPage() {
  return (
    <div className="space-y-8">
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
      </div>

      <SafeguardingContent />
    </div>
  )
}