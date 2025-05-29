'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useOrganization } from '@/features/organizations/components/organization-provider'
import { useSubscriptionCheck } from '@/features/subscription/hooks/use-subscription-check'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function TestAuthFlowPage() {
  const authStore = useAuthStore()
  const { organizations, currentOrganization, switchOrganization } = useOrganization()
  const { subscriptionStatus, isLoading: subLoading, refreshSubscription } = useSubscriptionCheck()
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    // Gather debug information
    const gatherDebugInfo = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      setDebugInfo({
        authUser: user,
        storeUser: authStore.user,
        storeOrganizations: authStore.organizations,
        contextOrganizations: organizations,
        currentOrganization: currentOrganization,
        isAuthenticated: authStore.isAuthenticated,
        subscriptionStatus: subscriptionStatus
      })
    }
    
    gatherDebugInfo()
  }, [authStore, organizations, currentOrganization, subscriptionStatus])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Auth Flow Test</h1>
        <p className="text-muted-foreground">Testing authentication and organization flow</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="debug">Debug Info</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Status</CardTitle>
              <CardDescription>Current user and authentication state</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Authenticated:</span>
                <Badge variant={authStore.isAuthenticated ? "default" : "secondary"}>
                  {authStore.isAuthenticated ? "Yes" : "No"}
                </Badge>
              </div>
              {authStore.user && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">User ID:</span>
                    <code className="text-sm">{authStore.user.id}</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Email:</span>
                    <span>{authStore.user.email}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Organization</CardTitle>
              <CardDescription>Active organization context</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {currentOrganization ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Name:</span>
                    <span>{currentOrganization.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">ID:</span>
                    <code className="text-sm">{currentOrganization.id}</code>
                  </div>
                  {currentOrganization.charity_number && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Charity Number:</span>
                      <span>{currentOrganization.charity_number}</span>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">No organization selected</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organizations</CardTitle>
              <CardDescription>
                All organizations you have access to ({organizations.length} total)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {organizations.map((membership) => (
                  <div
                    key={membership.organization_id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {membership.organization?.name || 'Unknown Organization'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Role: {membership.role} • Joined: {new Date(membership.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {currentOrganization?.id === membership.organization_id ? (
                      <Badge>Current</Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => switchOrganization(membership.organization_id)}
                      >
                        Switch
                      </Button>
                    )}
                  </div>
                ))}
                {organizations.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No organizations found. You should be redirected to onboarding.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Status</CardTitle>
              <CardDescription>Current subscription and billing information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {subLoading ? (
                <p className="text-muted-foreground">Loading subscription...</p>
              ) : subscriptionStatus ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Has Subscription:</span>
                    <Badge variant={subscriptionStatus.hasActiveSubscription ? "default" : "secondary"}>
                      {subscriptionStatus.hasActiveSubscription ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Tier:</span>
                    <Badge variant="outline">{subscriptionStatus.tier}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Provider:</span>
                    <span>{subscriptionStatus.provider || 'None'}</span>
                  </div>
                  {subscriptionStatus.requiresMigration && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Your subscription needs to be migrated from Paddle to Stripe
                      </p>
                    </div>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshSubscription}
                    className="w-full mt-2"
                  >
                    Refresh Status
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground">No subscription data available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feature Access</CardTitle>
              <CardDescription>Test feature availability based on subscription</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  'basic_compliance',
                  'full_compliance',
                  'ai_features',
                  'advanced_reports',
                  'api_access',
                  'bulk_operations'
                ].map((feature) => {
                  const hasAccess = subscriptionStatus ? 
                    require('@/lib/api/subscription-migration').isFeatureAvailable(subscriptionStatus.tier, feature) : 
                    false
                  
                  return (
                    <div key={feature} className="flex items-center justify-between">
                      <span className="font-medium">{feature}:</span>
                      <Badge variant={hasAccess ? "default" : "secondary"}>
                        {hasAccess ? "✓ Available" : "✗ Unavailable"}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debug" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
              <CardDescription>Raw data for debugging</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs overflow-auto p-4 bg-muted rounded-md">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}