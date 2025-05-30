'use client'

import { Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useOrganization } from '@/features/organizations/components/organization-provider'

export function OrganizationBadge() {
  const { currentOrganization } = useOrganization()

  if (!currentOrganization) {
    return null
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
      <Building2 className="h-4 w-4 text-gray-500" />
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">
          {currentOrganization.name}
        </span>
        {currentOrganization.charity_number && (
          <span className="text-xs text-gray-500">
            Charity #{currentOrganization.charity_number}
          </span>
        )}
      </div>
    </div>
  )
}