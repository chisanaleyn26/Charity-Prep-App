import { getCurrentUserOrganization } from '@/lib/supabase/server'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage() {
  // Get current organization from server
  const currentOrgData = await getCurrentUserOrganization()
  
  if (!currentOrgData || !currentOrgData.organization) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-medium">No organization found</h3>
          <p className="text-gray-600">Please select or create an organization to continue.</p>
        </div>
      </div>
    )
  }

  return <DashboardClient initialOrganization={currentOrgData.organization} />
}