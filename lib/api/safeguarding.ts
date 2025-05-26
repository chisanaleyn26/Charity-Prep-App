'use server'

import { createClient } from '@/lib/supabase/server'
import { 
  createSafeguardingRecordSchema, 
  updateSafeguardingRecordSchema,
  safeguardingFiltersSchema 
} from '@/lib/types/api.types'
import { revalidatePath } from 'next/cache'

export async function createSafeguardingRecord(organizationId: string, data: unknown) {
  const validatedFields = createSafeguardingRecordSchema.safeParse(data)

  if (!validatedFields.success) {
    return { error: 'Invalid safeguarding record data' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: record, error } = await supabase
    .from('safeguarding_records')
    .insert({
      ...validatedFields.data,
      organization_id: organizationId,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/safeguarding')
  return { data: record }
}

export async function updateSafeguardingRecord(id: string, data: unknown) {
  const validatedFields = updateSafeguardingRecordSchema.safeParse(data)

  if (!validatedFields.success) {
    return { error: 'Invalid safeguarding record data' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: record, error } = await supabase
    .from('safeguarding_records')
    .update({
      ...validatedFields.data,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/safeguarding')
  return { data: record }
}

export async function deleteSafeguardingRecord(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('safeguarding_records')
    .update({ 
      deleted_at: new Date().toISOString(),
      is_active: false 
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/safeguarding')
  return { success: true }
}

export async function getSafeguardingRecords(organizationId: string, filters?: unknown) {
  const validatedFilters = safeguardingFiltersSchema.safeParse(filters || {})
  const filterData = validatedFilters.success ? validatedFilters.data : safeguardingFiltersSchema.parse({})

  const supabase = await createClient()

  let query = supabase
    .from('safeguarding_records')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)
    .is('deleted_at', null)

  // Apply filters
  if (filterData.search) {
    query = query.or(`person_name.ilike.%${filterData.search}%,role_title.ilike.%${filterData.search}%`)
  }

  if (filterData.role_type) {
    query = query.eq('role_type', filterData.role_type)
  }

  if (filterData.dbs_check_type) {
    query = query.eq('dbs_check_type', filterData.dbs_check_type)
  }

  if (filterData.is_active !== undefined) {
    query = query.eq('is_active', filterData.is_active)
  }

  if (filterData.expiring_soon) {
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    query = query.lte('expiry_date', thirtyDaysFromNow.toISOString())
  }

  if (filterData.startDate) {
    query = query.gte('expiry_date', filterData.startDate)
  }

  if (filterData.endDate) {
    query = query.lte('expiry_date', filterData.endDate)
  }

  // Apply sorting
  const sortBy = filterData.sortBy || 'expiry_date'
  const sortOrder = filterData.sortOrder || 'asc'
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

export async function getSafeguardingDashboard(organizationId: string) {
  const supabase = await createClient()

  const today = new Date().toISOString()
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  const { data: records } = await supabase
    .from('safeguarding_records')
    .select('*')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)

  if (!records) {
    return null
  }

  const dashboard = {
    totalRecords: records.length,
    activeRecords: records.filter(r => r.is_active).length,
    expiringRecords: records.filter(r => 
      new Date(r.expiry_date) <= thirtyDaysFromNow && 
      new Date(r.expiry_date) > new Date()
    ).length,
    overdueRecords: records.filter(r => new Date(r.expiry_date) < new Date()).length,
    recordsByType: {} as Record<string, number>,
    recordsByDBSType: {} as Record<string, number>,
  }

  // Count by role type
  records.forEach(record => {
    dashboard.recordsByType[record.role_type] = (dashboard.recordsByType[record.role_type] || 0) + 1
    dashboard.recordsByDBSType[record.dbs_check_type] = (dashboard.recordsByDBSType[record.dbs_check_type] || 0) + 1
  })

  return dashboard
}