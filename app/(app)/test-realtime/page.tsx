'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRealtime, usePresence, useBroadcast } from '@/hooks/use-realtime'
import { getCurrentOrganization } from '@/lib/api/auth'
import { createClient } from '@/lib/supabase/client'
import { Shield, Globe, DollarSign, AlertCircle, Users, Wifi, WifiOff } from 'lucide-react'

export default function RealtimeTestPage() {
  const [organizationId, setOrganizationId] = useState<string>('')
  const [events, setEvents] = useState<any[]>([])
  const [testData, setTestData] = useState({
    safeguarding: { person_name: 'Test Volunteer', status: 'pending' },
    overseas: { country: 'Kenya', activity_type: 'Education Support' },
    income: { amount: 1000, source: 'Online Donation' }
  })

  // Get organization ID
  useEffect(() => {
    getCurrentOrganization().then(org => {
      if (org) setOrganizationId(org.id)
    })
  }, [])

  // Set up real-time subscriptions
  const { isConnected } = useRealtime({
    organizationId,
    onInsert: (payload) => {
      setEvents(prev => [{
        type: 'INSERT',
        table: payload.table,
        data: payload,
        timestamp: new Date()
      }, ...prev].slice(0, 20))
    },
    onUpdate: (payload) => {
      setEvents(prev => [{
        type: 'UPDATE',
        table: payload.table,
        data: payload,
        timestamp: new Date()
      }, ...prev].slice(0, 20))
    },
    onDelete: (payload) => {
      setEvents(prev => [{
        type: 'DELETE',
        table: payload.table,
        data: payload,
        timestamp: new Date()
      }, ...prev].slice(0, 20))
    }
  })

  // Presence tracking
  const { onlineUsers } = usePresence(organizationId)
  const onlineCount = Object.keys(onlineUsers).length

  // Broadcasting
  const { broadcast } = useBroadcast(organizationId)

  // Test functions
  const insertTestRecord = async (table: string) => {
    const supabase = createClient()
    
    try {
      switch (table) {
        case 'safeguarding_records':
          await supabase.from('safeguarding_records').insert({
            organization_id: organizationId,
            person_name: testData.safeguarding.person_name,
            status: testData.safeguarding.status,
            dbs_type: 'enhanced',
            dbs_number: `TEST-${Date.now()}`,
            issue_date: new Date().toISOString().split('T')[0],
            expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          })
          break
          
        case 'overseas_activities':
          await supabase.from('overseas_activities').insert({
            organization_id: organizationId,
            country: testData.overseas.country,
            activity_type: testData.overseas.activity_type,
            description: 'Test activity',
            start_date: new Date().toISOString().split('T')[0],
            risk_level: 'medium'
          })
          break
          
        case 'income_records':
          await supabase.from('income_records').insert({
            organization_id: organizationId,
            amount: testData.income.amount,
            source: testData.income.source,
            date: new Date().toISOString().split('T')[0],
            category: 'donations'
          })
          break
      }
      
      // Also broadcast a custom event
      await broadcast('test-event', {
        table,
        action: 'insert',
        user: 'Test User'
      })
    } catch (error) {
      console.error('Failed to insert test record:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Real-time Subscriptions Test</h1>
        <p className="text-muted-foreground">Test real-time features and subscriptions</p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="h-5 w-5 text-green-500" />
                Connected
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5 text-red-500" />
                Disconnected
              </>
            )}
          </CardTitle>
          <CardDescription>
            Real-time connection status - Organization: {organizationId || 'Loading...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm">{onlineCount} users online</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Test Data Insertion</CardTitle>
          <CardDescription>
            Insert test records to trigger real-time events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => insertTestRecord('safeguarding_records')}
              className="flex items-center gap-2"
              disabled={!organizationId}
            >
              <Shield className="h-4 w-4" />
              Add Safeguarding Record
            </Button>
            
            <Button
              onClick={() => insertTestRecord('overseas_activities')}
              className="flex items-center gap-2"
              disabled={!organizationId}
            >
              <Globe className="h-4 w-4" />
              Add Overseas Activity
            </Button>
            
            <Button
              onClick={() => insertTestRecord('income_records')}
              className="flex items-center gap-2"
              disabled={!organizationId}
            >
              <DollarSign className="h-4 w-4" />
              Add Income Record
            </Button>
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-medium">Test Data Configuration:</p>
            <pre className="bg-muted p-3 rounded-md overflow-auto">
              {JSON.stringify(testData, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Events Log */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Events Log</CardTitle>
          <CardDescription>
            Events received through real-time subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {events.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No events received yet. Try inserting some test data above.
              </p>
            ) : (
              events.map((event, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-3 space-y-1 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {event.type} - {event.table}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {event.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                    {JSON.stringify(event.data, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}