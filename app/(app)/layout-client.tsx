'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileSidebar, MobileHeader } from '@/components/layout/mobile-sidebar'
import { OrganizationProvider } from '@/features/organizations/components/organization-provider'
import { Tables } from '@/lib/types/database.types'

type Organization = Tables<'organizations'>

export function AppLayoutClient({ 
  children,
  organization 
}: { 
  children: React.ReactNode
  organization: Organization
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <OrganizationProvider>
      <div className="flex h-screen bg-gray-50 touch-manipulation">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar 
            collapsed={sidebarCollapsed} 
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            organization={organization}
          />
        </div>
        
        {/* Mobile Sidebar */}
        <MobileSidebar
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          organization={organization}
        />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <MobileHeader
            onMenuToggle={() => setMobileSidebarOpen(true)}
            organization={organization}
          />
          
          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </OrganizationProvider>
  )
}