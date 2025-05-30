"use client";

import { useState, useEffect } from "react";
import { SimpleAppSidebar } from "@/components/layout/simple-app-sidebar";
import {
  MobileSidebar,
  MobileHeader,
} from "@/components/layout/mobile-sidebar";
import { OrganizationProvider } from "@/features/organizations/components/organization-provider";
import { ProfileCompletionProvider } from "@/features/user/components/profile-completion-provider";
import { useAuthStore } from "@/stores/auth-store";
import { Toaster } from "sonner";
import type { Organization, OrganizationMember, User } from "@/lib/types/app.types";

export function AppLayoutClient({
  children,
  organization,
  organizations,
  user,
}: {
  children: React.ReactNode;
  organization: Organization;
  organizations?: OrganizationMember[];
  user?: User;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  const { setUser, setCurrentOrganization } = useAuthStore();

  // Initialize auth store with server data - only set user and current org
  useEffect(() => {
    if (user) {
      setUser(user);
    }
    // Only set the current organization (no multiple orgs)
    setCurrentOrganization(organization);
  }, [user, organization, setUser, setCurrentOrganization]);

  return (
    <OrganizationProvider initialOrganization={organization}>
      <ProfileCompletionProvider>
        <div className="flex h-screen bg-white">
          {/* Desktop Sidebar */}
          <div className="hidden lg:flex">
            <SimpleAppSidebar
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </div>

          {/* Mobile Sidebar */}
          <MobileSidebar
            isOpen={mobileSidebarOpen}
            onClose={() => setMobileSidebarOpen(false)}
            organization={organization}
          />

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Mobile Header */}
            <MobileHeader
              onMenuToggle={() => setMobileSidebarOpen(true)}
              organization={organization}
            />

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto bg-background">
              <div className="min-h-full">
                <div className="px-4 sm:px-6 py-4 sm:py-8">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
        
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            className: 'sonner-toast',
          }}
        />
      </ProfileCompletionProvider>
    </OrganizationProvider>
  );
}
