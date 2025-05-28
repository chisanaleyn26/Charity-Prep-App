'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DebugAuthPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkEverything()
  }, [])

  const checkEverything = async () => {
    try {
      const supabase = createClient()
      
      // 1. Check auth
      console.log('Checking auth...')
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      // 2. Check organization memberships
      let memberships = null
      let membershipError = null
      
      if (user) {
        console.log('Checking memberships for user:', user.id)
        const { data: membershipData, error: memberError } = await supabase
          .from('organization_members')
          .select(`
            id,
            organization_id,
            role,
            accepted_at,
            created_at,
            organization:organizations(
              id,
              name,
              charity_number
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        
        memberships = membershipData
        membershipError = memberError
      }
      
      setData({
        auth: {
          user: user ? {
            id: user.id,
            email: user.email,
            created_at: user.created_at
          } : null,
          authError
        },
        memberships: {
          data: memberships,
          error: membershipError
        },
        timestamp: new Date().toISOString()
      })
      
    } catch (err) {
      console.error('Debug error:', err)
      setData({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Auth Debug</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Debug</h1>
      
      <div className="space-y-4">
        <button 
          onClick={checkEverything}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh Data
        </button>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Auth Status:</h2>
          <p className={data?.auth?.user ? 'text-green-600' : 'text-red-600'}>
            {data?.auth?.user ? '✅ Authenticated' : '❌ Not authenticated'}
          </p>
          {data?.auth?.user && (
            <div className="mt-2 text-sm">
              <p>User ID: {data.auth.user.id}</p>
              <p>Email: {data.auth.user.email}</p>
            </div>
          )}
          {data?.auth?.authError && (
            <p className="text-red-600 text-sm mt-2">Auth Error: {data.auth.authError.message}</p>
          )}
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Organization Memberships:</h2>
          {data?.memberships?.data ? (
            <div>
              <p className="text-green-600">✅ Found {data.memberships.data.length} membership(s)</p>
              {data.memberships.data.map((membership: any, index: number) => (
                <div key={index} className="mt-2 p-2 bg-white rounded text-sm">
                  <p><strong>Org:</strong> {membership.organization?.name}</p>
                  <p><strong>Role:</strong> {membership.role}</p>
                  <p><strong>Org ID:</strong> {membership.organization_id}</p>
                  <p><strong>Accepted:</strong> {membership.accepted_at}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-red-600">❌ No memberships found</p>
          )}
          {data?.memberships?.error && (
            <p className="text-red-600 text-sm mt-2">Membership Error: {data.memberships.error.message}</p>
          )}
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Raw Data:</h2>
          <pre className="text-xs overflow-auto bg-white p-2 rounded">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}