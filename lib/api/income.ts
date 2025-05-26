'use server'

import { createClient } from '@/lib/supabase/server'
import { 
  createIncomeRecordSchema, 
  updateIncomeRecordSchema,
  incomeFiltersSchema 
} from '@/lib/types/api.types'
import { revalidatePath } from 'next/cache'

export async function createIncomeRecord(organizationId: string, data: unknown) {
  const validatedFields = createIncomeRecordSchema.safeParse(data)

  if (!validatedFields.success) {
    return { error: 'Invalid income record data' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: record, error } = await supabase
    .from('income_records')
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

  revalidatePath('/income')
  return { data: record }
}

export async function updateIncomeRecord(id: string, data: unknown) {
  const validatedFields = updateIncomeRecordSchema.safeParse(data)

  if (!validatedFields.success) {
    return { error: 'Invalid income record data' }
  }

  const supabase = await createClient()

  const { data: record, error } = await supabase
    .from('income_records')
    .update(validatedFields.data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/income')
  return { data: record }
}

export async function deleteIncomeRecord(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('income_records')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/income')
  return { success: true }
}

export async function getIncomeRecords(organizationId: string, filters?: unknown) {
  const validatedFilters = incomeFiltersSchema.safeParse(filters || {})
  const filterData = validatedFilters.success ? validatedFilters.data : incomeFiltersSchema.parse({})

  const supabase = await createClient()

  let query = supabase
    .from('income_records')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)
    .is('deleted_at', null)

  // Apply filters
  if (filterData.search) {
    query = query.or(`donor_name.ilike.%${filterData.search}%,reference_number.ilike.%${filterData.search}%`)
  }

  if (filterData.source) {
    query = query.eq('source', filterData.source)
  }

  if (filterData.donor_type) {
    query = query.eq('donor_type', filterData.donor_type)
  }

  if (filterData.fundraising_method) {
    query = query.eq('fundraising_method', filterData.fundraising_method)
  }

  if (filterData.gift_aid_eligible !== undefined) {
    query = query.eq('gift_aid_eligible', filterData.gift_aid_eligible)
  }

  if (filterData.restricted_funds !== undefined) {
    query = query.eq('restricted_funds', filterData.restricted_funds)
  }

  if (filterData.startDate) {
    query = query.gte('date_received', filterData.startDate)
  }

  if (filterData.endDate) {
    query = query.lte('date_received', filterData.endDate)
  }

  // Apply sorting
  const sortBy = filterData.sortBy || 'date_received'
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

export async function getIncomeDashboard(organizationId: string, financialYear?: number) {
  const supabase = await createClient()

  let query = supabase
    .from('income_records')
    .select('*')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)

  if (financialYear) {
    query = query.eq('financial_year', financialYear)
  }

  const { data: records } = await query

  if (!records) {
    return null
  }

  const dashboard = {
    totalIncome: records.reduce((sum, r) => sum + r.amount, 0),
    donorCount: new Set(records.filter(r => !r.is_anonymous).map(r => r.donor_name)).size,
    giftAidEligible: records.filter(r => r.gift_aid_eligible).reduce((sum, r) => sum + r.amount, 0),
    restrictedFunds: records.filter(r => r.restricted_funds).reduce((sum, r) => sum + r.amount, 0),
    incomeBySource: {} as Record<string, number>,
    incomeByMethod: {} as Record<string, number>,
  }

  // Count by source and method
  records.forEach(record => {
    dashboard.incomeBySource[record.source] = 
      (dashboard.incomeBySource[record.source] || 0) + record.amount
    
    if (record.fundraising_method) {
      dashboard.incomeByMethod[record.fundraising_method] = 
        (dashboard.incomeByMethod[record.fundraising_method] || 0) + record.amount
    }
  })

  return dashboard
}

export async function getFinancialYears(organizationId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('income_records')
    .select('financial_year')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .order('financial_year', { ascending: false })

  if (!data) {
    return []
  }

  return [...new Set(data.map(r => r.financial_year))]
}