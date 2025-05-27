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

const ComplianceQuerySchema = z.object({
  type: z.enum(['safeguarding', 'fundraising', 'overseas_activities', 'all']).optional(),
  status: z.enum(['compliant', 'non_compliant', 'pending', 'all']).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  offset: z.string().regex(/^\d+$/).transform(Number).optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

const SafeguardingRecordSchema = z.object({
  person_name: z.string().min(1),
  role_type: z.enum(['employee', 'volunteer', 'trustee']),
  dbs_certificate_number: z.string().optional(),
  dbs_issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dbs_type: z.enum(['basic', 'standard', 'enhanced', 'enhanced_barred']).optional(),
  works_with_children: z.boolean(),
  works_with_vulnerable_adults: z.boolean(),
  training_completed: z.boolean().optional(),
  training_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

const FundraisingRecordSchema = z.object({
  activity_type: z.enum(['street_collection', 'house_to_house', 'event', 'online', 'other']),
  description: z.string().min(1),
  planned_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  location: z.string().optional(),
  permit_required: z.boolean(),
  permit_obtained: z.boolean().optional(),
  permit_reference: z.string().optional(),
  estimated_income: z.number().positive().optional(),
})

const OverseasActivitySchema = z.object({
  country_code: z.string().length(2),
  activity_description: z.string().min(1),
  partner_organization: z.string().optional(),
  amount_gbp: z.number().positive(),
  transfer_method: z.enum(['bank_transfer', 'cash', 'in_kind', 'other']),
  purpose: z.string().min(1),
  approval_required: z.boolean(),
  approval_obtained: z.boolean().optional(),
  approval_reference: z.string().optional(),
})

// GET /api/v1/compliance - Get compliance data
async function handleGetCompliance(request: NextRequest, context: ApiContext) {
  const { searchParams } = new URL(request.url)
  const queryValidation = validateRequest(ComplianceQuerySchema, Object.fromEntries(searchParams))
  
  if (!queryValidation.success) {
    return createErrorResponse(queryValidation.error, 'INVALID_QUERY')
  }

  const { type = 'all', status, limit = 100, offset = 0, start_date, end_date } = queryValidation.data
  const supabase = createServerClient()

  try {
    const result: any = {
      summary: {},
      data: {}
    }

    // Get compliance score summary
    const { data: complianceScore } = await supabase
      .from('compliance_scores')
      .select('*')
      .eq('organization_id', context.organizationId)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .single()

    result.summary = complianceScore

    // Fetch specific compliance data based on type
    if (type === 'all' || type === 'safeguarding') {
      let query = supabase
        .from('safeguarding_records')
        .select('*')
        .eq('organization_id', context.organizationId)
        .order('created_at', { ascending: false })

      if (start_date) query = query.gte('created_at', start_date)
      if (end_date) query = query.lte('created_at', end_date)
      if (limit) query = query.limit(limit)
      if (offset) query = query.range(offset, offset + limit - 1)

      const { data: safeguarding, error } = await query

      if (error) throw error
      result.data.safeguarding = safeguarding
    }

    if (type === 'all' || type === 'fundraising') {
      let query = supabase
        .from('fundraising_activities')
        .select('*')
        .eq('organization_id', context.organizationId)
        .order('created_at', { ascending: false })

      if (start_date) query = query.gte('created_at', start_date)
      if (end_date) query = query.lte('created_at', end_date)
      if (limit) query = query.limit(limit)
      if (offset) query = query.range(offset, offset + limit - 1)

      const { data: fundraising, error } = await query

      if (error) throw error
      result.data.fundraising = fundraising
    }

    if (type === 'all' || type === 'overseas_activities') {
      let query = supabase
        .from('overseas_activities')
        .select('*')
        .eq('organization_id', context.organizationId)
        .order('created_at', { ascending: false })

      if (start_date) query = query.gte('created_at', start_date)
      if (end_date) query = query.lte('created_at', end_date)
      if (limit) query = query.limit(limit)
      if (offset) query = query.range(offset, offset + limit - 1)

      const { data: overseas, error } = await query

      if (error) throw error
      result.data.overseas_activities = overseas
    }

    return createApiResponse(result)

  } catch (error) {
    console.error('Error fetching compliance data:', error)
    return createErrorResponse('Failed to fetch compliance data', 'FETCH_ERROR', 500)
  }
}

// POST /api/v1/compliance/safeguarding - Add safeguarding record
async function handleCreateSafeguardingRecord(request: NextRequest, context: ApiContext) {
  try {
    const body = await request.json()
    const validation = validateRequest(SafeguardingRecordSchema, body)
    
    if (!validation.success) {
      return createErrorResponse(validation.error, 'INVALID_DATA')
    }

    const supabase = createServerClient()
    
    const { data: record, error } = await supabase
      .from('safeguarding_records')
      .insert({
        ...validation.data,
        organization_id: context.organizationId,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return createApiResponse(record, 201)

  } catch (error) {
    console.error('Error creating safeguarding record:', error)
    return createErrorResponse('Failed to create safeguarding record', 'CREATE_ERROR', 500)
  }
}

// POST /api/v1/compliance/fundraising - Add fundraising record
async function handleCreateFundraisingRecord(request: NextRequest, context: ApiContext) {
  try {
    const body = await request.json()
    const validation = validateRequest(FundraisingRecordSchema, body)
    
    if (!validation.success) {
      return createErrorResponse(validation.error, 'INVALID_DATA')
    }

    const supabase = createServerClient()
    
    const { data: record, error } = await supabase
      .from('fundraising_activities')
      .insert({
        ...validation.data,
        organization_id: context.organizationId,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return createApiResponse(record, 201)

  } catch (error) {
    console.error('Error creating fundraising record:', error)
    return createErrorResponse('Failed to create fundraising record', 'CREATE_ERROR', 500)
  }
}

// POST /api/v1/compliance/overseas - Add overseas activity record
async function handleCreateOverseasRecord(request: NextRequest, context: ApiContext) {
  try {
    const body = await request.json()
    const validation = validateRequest(OverseasActivitySchema, body)
    
    if (!validation.success) {
      return createErrorResponse(validation.error, 'INVALID_DATA')
    }

    const supabase = createServerClient()
    
    const { data: record, error } = await supabase
      .from('overseas_activities')
      .insert({
        ...validation.data,
        organization_id: context.organizationId,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return createApiResponse(record, 201)

  } catch (error) {
    console.error('Error creating overseas activity record:', error)
    return createErrorResponse('Failed to create overseas activity record', 'CREATE_ERROR', 500)
  }
}

// Export wrapped handlers
export const GET = withApiAuth(handleGetCompliance, {
  requireAuth: true,
  requiredFeature: 'api_access'
})

// For POST requests, we'll create separate handlers for each compliance type
// This would normally be in separate route files like safeguarding/route.ts, etc.
export const POST = withApiAuth(async (request: NextRequest, context: ApiContext) => {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  switch (type) {
    case 'safeguarding':
      return handleCreateSafeguardingRecord(request, context)
    case 'fundraising':
      return handleCreateFundraisingRecord(request, context)
    case 'overseas':
      return handleCreateOverseasRecord(request, context)
    default:
      return createErrorResponse('Invalid compliance type', 'INVALID_TYPE', 400)
  }
}, {
  requireAuth: true,
  requiredFeature: 'api_access'
})