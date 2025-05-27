import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { 
  withApiAuth, 
  createApiResponse, 
  createErrorResponse,
  validateRequest,
  type ApiContext 
} from '@/lib/api-auth/middleware'
import { z } from 'zod'

const OrganizationQuerySchema = z.object({
  include: z.string().optional(),
  fields: z.string().optional(),
})

const OrganizationUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  website: z.string().url().optional(),
  charity_number: z.string().optional(),
  contact_email: z.string().email().optional(),
})

// GET /api/v1/organizations - List organizations for the authenticated user
async function handleGetOrganizations(request: NextRequest, context: ApiContext) {
  const { searchParams } = new URL(request.url)
  const queryValidation = validateRequest(OrganizationQuerySchema, Object.fromEntries(searchParams))
  
  if (!queryValidation.success) {
    return createErrorResponse(queryValidation.error, 'INVALID_QUERY')
  }

  const { include, fields } = queryValidation.data
  const supabase = createServerClient()

  try {
    let query = supabase
      .from('organizations')
      .select('*')
      .eq('id', context.organizationId)

    // Apply field selection if specified
    if (fields) {
      const selectedFields = fields.split(',').map(f => f.trim())
      query = supabase
        .from('organizations')
        .select(selectedFields.join(','))
        .eq('id', context.organizationId)
    }

    const { data: organization, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('Organization not found', 'ORGANIZATION_NOT_FOUND', 404)
      }
      throw error
    }

    // Include additional data if requested
    let responseData = organization
    
    if (include) {
      const includes = include.split(',').map(i => i.trim())
      const additionalData: any = {}

      for (const includeItem of includes) {
        switch (includeItem) {
          case 'subscription':
            const { data: subscription } = await supabase
              .from('subscriptions')
              .select('tier, status, current_period_end, billing_cycle')
              .eq('organization_id', context.organizationId)
              .eq('status', 'active')
              .single()
            additionalData.subscription = subscription
            break

          case 'usage':
            const { data: usage } = await supabase
              .from('usage_tracking')
              .select('*')
              .eq('organization_id', context.organizationId)
              .order('period_start', { ascending: false })
              .limit(1)
              .single()
            additionalData.usage = usage
            break

          case 'members':
            const { data: members } = await supabase
              .from('organization_members')
              .select(`
                role,
                joined_at,
                users:user_id (
                  id,
                  email,
                  full_name
                )
              `)
              .eq('organization_id', context.organizationId)
            additionalData.members = members
            break

          case 'compliance_score':
            const { data: score } = await supabase
              .from('compliance_scores')
              .select('*')
              .eq('organization_id', context.organizationId)
              .order('calculated_at', { ascending: false })
              .limit(1)
              .single()
            additionalData.compliance_score = score
            break
        }
      }

      responseData = { ...organization, ...additionalData }
    }

    return createApiResponse(responseData)

  } catch (error) {
    console.error('Error fetching organization:', error)
    return createErrorResponse('Failed to fetch organization', 'FETCH_ERROR', 500)
  }
}

// PUT /api/v1/organizations - Update organization
async function handleUpdateOrganization(request: NextRequest, context: ApiContext) {
  try {
    const body = await request.json()
    const validation = validateRequest(OrganizationUpdateSchema, body)
    
    if (!validation.success) {
      return createErrorResponse(validation.error, 'INVALID_DATA')
    }

    const supabase = createServerClient()
    
    const { data: organization, error } = await supabase
      .from('organizations')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString()
      })
      .eq('id', context.organizationId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return createApiResponse(organization)

  } catch (error) {
    console.error('Error updating organization:', error)
    return createErrorResponse('Failed to update organization', 'UPDATE_ERROR', 500)
  }
}

// Export wrapped handlers
export const GET = withApiAuth(handleGetOrganizations, {
  requireAuth: true,
  requiredFeature: 'api_access'
})

export const PUT = withApiAuth(handleUpdateOrganization, {
  requireAuth: true,
  requiredFeature: 'api_access'
})