'use client'

import { Building2, Crown, Shield, Users, ChevronDown, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useOrganization } from './organization-provider'
import { useRouter } from 'next/navigation'
import type { OrganizationMember } from '@/lib/types/app.types'

interface OrgSwitcherProps {
  className?: string
}

const roleIcons = {
  admin: Crown,
  member: Shield,
  viewer: Users,
}

const roleLabels = {
  admin: 'Admin',
  member: 'Member',
  viewer: 'Viewer',
}

export function OrgSwitcher({ className }: OrgSwitcherProps) {
  const { organizations, currentOrganization, switchOrganization, isLoading } = useOrganization()
  const router = useRouter()

  const handleSelect = async (orgMember: OrganizationMember) => {
    if (orgMember.organization_id === currentOrganization?.id) {
      return
    }

    await switchOrganization(orgMember.organization_id)
  }

  const handleCreateNew = () => {
    router.push('/onboarding')
  }

  if (organizations.length === 0) {
    return null
  }

  const currentMember = organizations.find(
    org => org.organization_id === currentOrganization?.id
  )

  const RoleIcon = currentMember ? roleIcons[currentMember.role as keyof typeof roleIcons] : Building2

  const regularOrgs = organizations
  const advisorOrgs: OrganizationMember[] = [] // No separate advisor role in schema

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between bg-background",
            className
          )}
          disabled={isLoading}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <RoleIcon className="h-4 w-4 shrink-0" />
            <div className="flex flex-col items-start flex-1 min-w-0">
              <span className="truncate text-sm font-medium">
                {currentOrganization?.name || 'Select organization'}
              </span>
              {currentMember && (
                <span className="text-xs text-muted-foreground">
                  {roleLabels[currentMember.role as keyof typeof roleLabels]}
                </span>
              )}
            </div>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[280px]" align="start">
        {regularOrgs.length > 0 && (
          <>
            <DropdownMenuLabel>Organizations</DropdownMenuLabel>
            {regularOrgs.map((orgMember) => {
              const isSelected = orgMember.organization_id === currentOrganization?.id
              const RoleIcon = roleIcons[orgMember.role as keyof typeof roleIcons]
              
              return (
                <DropdownMenuItem
                  key={orgMember.id}
                  onSelect={() => handleSelect(orgMember)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <RoleIcon className="h-4 w-4" />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="truncate font-medium">
                      {(orgMember as any).organization?.name || 'Unknown Organization'}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {roleLabels[orgMember.role as keyof typeof roleLabels]}
                      </Badge>
                      {(orgMember as any).organization?.charity_number && (
                        <span className="text-xs text-muted-foreground">
                          #{(orgMember as any).organization.charity_number}
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
                  )}
                </DropdownMenuItem>
              )
            })}
          </>
        )}
        
        {advisorOrgs.length > 0 && (
          <>
            {regularOrgs.length > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel>Advisor Access</DropdownMenuLabel>
            {advisorOrgs.map((orgMember) => {
              const isSelected = orgMember.organization_id === currentOrganization?.id
              
              return (
                <DropdownMenuItem
                  key={`advisor-${orgMember.id}`}
                  onSelect={() => handleSelect(orgMember)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Users className="h-4 w-4" />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="truncate font-medium">
                      {(orgMember as any).organization?.name || 'Unknown Organization'}
                    </span>
                    <Badge variant="outline" className="text-xs w-fit">
                      Advisor
                    </Badge>
                  </div>
                  {isSelected && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
                  )}
                </DropdownMenuItem>
              )
            })}
          </>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={handleCreateNew}
          className="flex items-center gap-2 cursor-pointer text-primary"
        >
          <Plus className="h-4 w-4" />
          <span className="font-medium">Create New Organization</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}