'use server'

import { createClient } from '@/lib/supabase/server'
import { 
  createOverseasActivitySchema, 
  updateOverseasActivitySchema,
  createOverseasPartnerSchema,
  updateOverseasPartnerSchema,
  overseasFiltersSchema 
} from '@/lib/types/api.types'
import { revalidatePath } from 'next/cache'

export async function createOverseasActivity(organizationId: string, data: unknown) {
  const validatedFields = createOverseasActivitySchema.safeParse(data)

  if (!validatedFields.success) {
    return { error: 'Invalid overseas activity data' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Check if country is high risk
  const { data: country } = await supabase
    .from('countries')
    .select('is_high_risk, requires_due_diligence')
    .eq('code', validatedFields.data.country_code)
    .single()

  const { data: activity, error } = await supabase
    .from('overseas_activities')
    .insert({
      ...validatedFields.data,
      organization_id: organizationId,
      created_by: user.id,
      requires_reporting: country?.is_high_risk || false,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/overseas')
  return { data: activity }
}

export async function updateOverseasActivity(id: string, data: unknown) {
  const validatedFields = updateOverseasActivitySchema.safeParse(data)

  if (!validatedFields.success) {
    return { error: 'Invalid overseas activity data' }
  }

  const supabase = await createClient()

  const { data: activity, error } = await supabase
    .from('overseas_activities')
    .update(validatedFields.data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/overseas')
  return { data: activity }
}

export async function deleteOverseasActivity(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('overseas_activities')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/overseas')
  return { success: true }
}

export async function getOverseasActivities(organizationId: string, filters?: unknown) {
  const validatedFilters = overseasFiltersSchema.safeParse(filters || {})
  const filterData = validatedFilters.success ? validatedFilters.data : overseasFiltersSchema.parse({})

  const supabase = await createClient()

  let query = supabase
    .from('overseas_activities')
    .select(`
      *,
      country:countries(*),
      partner:overseas_partners(*)
    `, { count: 'exact' })
    .eq('organization_id', organizationId)
    .is('deleted_at', null)

  // Apply filters
  if (filterData.search) {
    query = query.or(`activity_name.ilike.%${filterData.search}%,description.ilike.%${filterData.search}%`)
  }

  if (filterData.activity_type) {
    query = query.eq('activity_type', filterData.activity_type)
  }

  if (filterData.country_code) {
    query = query.eq('country_code', filterData.country_code)
  }

  if (filterData.transfer_method) {
    query = query.eq('transfer_method', filterData.transfer_method)
  }

  if (filterData.high_risk_only) {
    query = query.eq('countries.is_high_risk', true)
  }

  if (filterData.startDate) {
    query = query.gte('transfer_date', filterData.startDate)
  }

  if (filterData.endDate) {
    query = query.lte('transfer_date', filterData.endDate)
  }

  // Apply sorting
  const sortBy = filterData.sortBy || 'transfer_date'
  const sortOrder = filterData.sortOrder || 'desc'
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  // Apply pagination
  const page = filterData.page
  const pageSize = filterData.pageSize
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    return { error: error.message }
  }

  return {
    data,
    pagination: {
      page,
      pageSize,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
    },
  }
}

export async function createOverseasPartner(organizationId: string, data: unknown) {
  const validatedFields = createOverseasPartnerSchema.safeParse(data)

  if (!validatedFields.success) {
    return { error: 'Invalid partner data' }
  }

  const supabase = await createClient()

  const { data: partner, error } = await supabase
    .from('overseas_partners')
    .insert({
      ...validatedFields.data,
      organization_id: organizationId,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/overseas/partners')
  return { data: partner }
}

export async function updateOverseasPartner(id: string, data: unknown) {
  const validatedFields = updateOverseasPartnerSchema.safeParse(data)

  if (!validatedFields.success) {
    return { error: 'Invalid partner data' }
  }

  const supabase = await createClient()

  const { data: partner, error } = await supabase
    .from('overseas_partners')
    .update(validatedFields.data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/overseas/partners')
  return { data: partner }
}

export async function getOverseasPartners(organizationId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('overseas_partners')
    .select('*, country:countries(*)')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .order('partner_name')

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function getOverseasDashboard(organizationId: string) {
  const supabase = await createClient()

  const { data: activities } = await supabase
    .from('overseas_activities')
    .select('*, country:countries(*)')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)

  const { data: partners } = await supabase
    .from('overseas_partners')
    .select('id')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)

  if (!activities) {
    return null
  }

  const dashboard = {
    totalActivities: activities.length,
    totalAmount: activities.reduce((sum, a) => sum + a.amount_gbp, 0),
    countriesCount: new Set(activities.map(a => a.country_code)).size,
    partnersCount: partners?.length || 0,
    activitiesByType: {} as Record<string, number>,
    highRiskActivities: activities.filter(a => a.country?.is_high_risk).length,
  }

  // Count by activity type
  activities.forEach(activity => {
    dashboard.activitiesByType[activity.activity_type] = 
      (dashboard.activitiesByType[activity.activity_type] || 0) + 1
  })

  return dashboard
}

export async function getCountries() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .order('name')

  if (error) {
    return { error: error.message }
  }

  return { data }
}