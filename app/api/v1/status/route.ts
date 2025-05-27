import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { 
  withApiAuth, 
  createApiResponse, 
  createErrorResponse,
  type ApiContext 
} from '@/lib/api-auth/middleware'

// GET /api/v1/status - API health check and status
async function handleGetStatus(request: NextRequest, context: ApiContext | null) {
  try {
    const startTime = Date.now()
    
    // Check database connectivity
    const supabase = createServerClient()
    const dbStartTime = Date.now()
    const { error: dbError } = await supabase.from('organizations').select('id').limit(1)
    const dbResponseTime = Date.now() - dbStartTime
    
    const status = {
      api: {
        status: 'operational',
        version: 'v1',
        timestamp: new Date().toISOString(),
        response_time: Date.now() - startTime
      },
      database: {
        status: dbError ? 'error' : 'operational',
        response_time: dbResponseTime,
        error: dbError?.message
      },
      authentication: {
        status: context ? 'authenticated' : 'unauthenticated',
        organization_id: context?.organizationId || null,
        subscription: context?.subscription || null
      },
      features: {
        api_access: context ? true : false,
        rate_limiting: true,
        webhooks: true,
        documentation: true
      },
      endpoints: {
        organizations: '/api/v1/organizations',
        compliance: '/api/v1/compliance',
        reports: '/api/v1/reports',
        documentation: '/api/v1/docs'
      },
      rate_limits: {
        window: '15 minutes',
        limits: {
          public: '50 requests',
          essentials: '100 requests',
          standard: '500 requests',
          premium: '2000 requests'
        }
      }
    }

    return createApiResponse(status)

  } catch (error) {
    console.error('Status check error:', error)
    return createErrorResponse('Status check failed', 'STATUS_ERROR', 500)
  }
}

// GET /api/v1/health - Simple health check (no auth required)
async function handleHealthCheck() {
  return createApiResponse({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: 'v1'
  })
}

// Export handlers
export const GET = withApiAuth(handleGetStatus, {
  requireAuth: false // Status endpoint doesn't require auth
})

// Also export a simple health check
export async function OPTIONS() {
  return handleHealthCheck()
}