'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useOrganization } from '@/features/organizations/components/organization-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function DebugSubscriptionPage() {
  const { currentOrganization: activeOrg } = useOrganization()
  const [subscriptionData, setSubscriptionData] = useState<any>(null)
  const [userLimitData, setUserLimitData] = useState<any>(null)
  const [memberData, setMemberData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDebugData() {
      if (!activeOrg) {
        setLoading(false)
        return
      }

      try {
        const supabase = createClient()
        
        // Get subscription data
        const { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('organization_id', activeOrg.id)
          .eq('status', 'active')
          .single()
          
        if (subError) {
          console.error('Subscription error:', subError)
          setSubscriptionData({ error: subError.message })
        } else {
          setSubscriptionData(subscription)
        }
        
        // Test user limit functions
        const { data: canAdd, error: canAddError } = await supabase
          .rpc('check_organization_user_limit', { org_id: activeOrg.id })
          
        const { data: limit, error: limitError } = await supabase
          .rpc('get_organization_user_limit', { org_id: activeOrg.id })
          
        setUserLimitData({
          canAddUsers: canAdd,
          userLimit: limit,
          canAddError: canAddError?.message,
          limitError: limitError?.message
        })
        
        // Get member count
        const { data: members, error: memberError } = await supabase
          .from('organization_members')
          .select('*')
          .eq('organization_id', activeOrg.id)
          
        if (!memberError) {
          const acceptedCount = members.filter(m => m.accepted_at).length
          setMemberData({
            totalMembers: members.length,
            acceptedMembers: acceptedCount,
            members: members
          })
        }
        
      } catch (err) {
        console.error('Debug error:', err)
        setError(String(err))
      } finally {
        setLoading(false)
      }
    }
    
    loadDebugData()
  }, [activeOrg])

  if (loading) {
    return <div className="p-8">Loading debug information...</div>
  }

  if (!activeOrg) {
    return (
      <Alert>
        <AlertDescription>
          No organization selected. Please select an organization first.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold">Subscription Debug Information</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Current Organization</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-sm">{JSON.stringify(activeOrg, null, 2)}</pre>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Subscription Data</CardTitle>
          <CardDescription>Raw subscription record from database</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-sm overflow-auto">{JSON.stringify(subscriptionData, null, 2)}</pre>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>User Limit Functions</CardTitle>
          <CardDescription>Results from database functions</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-sm">{JSON.stringify(userLimitData, null, 2)}</pre>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Member Data</CardTitle>
          <CardDescription>Current organization members</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-sm">{JSON.stringify(memberData, null, 2)}</pre>
        </CardContent>
      </Card>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}