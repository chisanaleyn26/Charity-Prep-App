'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestAuthContextPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)
  
  const runTests = async () => {
    setLoading(true)
    const supabase = createClient()
    const testResults: any = {}
    
    try {
      // Test 1: Check auth status
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      testResults.authStatus = {
        success: !authError && !!user,
        userId: user?.id,
        email: user?.email,
        error: authError?.message
      }
      
      // Test 2: Test auth context function
      const { data: authContext, error: contextError } = await supabase.rpc('test_auth_context')
      testResults.authContextFunction = {
        success: !contextError,
        data: authContext,
        error: contextError?.message
      }
      
      // Test 3: Try a simple insert
      const testOrg = {
        name: 'Test Org ' + Date.now(),
        income_band: 'small',
        financial_year_end: '2024-03-31',
        primary_email: 'test@example.com'
      }
      
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert(testOrg)
        .select()
        .single()
      
      testResults.directInsert = {
        success: !orgError,
        data: orgData,
        error: orgError?.message,
        errorCode: orgError?.code,
        errorDetails: orgError?.details
      }
      
      // Clean up if successful
      if (orgData?.id) {
        await supabase.from('organizations').delete().eq('id', orgData.id)
      }
      
    } catch (err: any) {
      testResults.unexpectedError = err.message
    }
    
    setResults(testResults)
    setLoading(false)
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Auth Context Test</h1>
        
        <button
          onClick={runTests}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300 mb-6"
        >
          {loading ? 'Running tests...' : 'Run Tests'}
        </button>
        
        {Object.keys(results).length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}