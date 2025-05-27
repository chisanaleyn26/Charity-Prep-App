import { createClient } from '@/lib/supabase/server'
import { DataSourceType, ExportFilters } from '../types/export'

export async function generateExportData(
  orgId: string,
  dataSource: DataSourceType,
  filters?: ExportFilters,
  limit?: number
): Promise<any[]> {
  const supabase = await createClient()

  switch (dataSource) {
    case 'compliance-scores':
      return await exportComplianceScores(supabase, orgId, filters, limit)
    
    case 'fundraising-events':
      return await exportFundraisingEvents(supabase, orgId, filters, limit)
    
    case 'safeguarding-incidents':
      return await exportSafeguardingRecords(supabase, orgId, filters, limit)
    
    case 'overseas-activities':
      return await exportOverseasActivities(supabase, orgId, filters, limit)
    
    case 'income-sources':
      return await exportIncomeRecords(supabase, orgId, filters, limit)
    
    case 'documents':
      return await exportDocuments(supabase, orgId, filters, limit)
    
    case 'annual-return':
      return await exportAnnualReturnData(supabase, orgId, filters, limit)
    
    case 'board-pack':
      return await exportBoardPackData(supabase, orgId, filters, limit)
    
    case 'all-data':
      return await exportAllData(supabase, orgId, filters, limit)
    
    default:
      throw new Error(`Unsupported data source: ${dataSource}`)
  }
}

async function exportComplianceScores(
  supabase: any,
  orgId: string,
  filters?: ExportFilters,
  limit?: number
) {
  let query = supabase
    .from('compliance_scores')
    .select('*')
    .eq('organization_id', orgId)

  if (filters?.dateRange) {
    query = query
      .gte('created_at', filters.dateRange.start.toISOString())
      .lte('created_at', filters.dateRange.end.toISOString())
  }

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

async function exportFundraisingEvents(
  supabase: any,
  orgId: string,
  filters?: ExportFilters,
  limit?: number
) {
  // Use income_records as fundraising events source
  let query = supabase
    .from('income_records')
    .select('*')
    .eq('organization_id', orgId)

  if (filters?.dateRange) {
    query = query
      .gte('date_received', filters.dateRange.start.toISOString())
      .lte('date_received', filters.dateRange.end.toISOString())
  }

  if (filters?.customFilters?.source_type) {
    query = query.in('source_type', filters.customFilters.source_type)
  }

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query.order('date_received', { ascending: false })

  if (error) throw error
  return data || []
}

async function exportSafeguardingRecords(
  supabase: any,
  orgId: string,
  filters?: ExportFilters,
  limit?: number
) {
  let query = supabase
    .from('safeguarding_records')
    .select('*')
    .eq('organization_id', orgId)

  if (filters?.dateRange) {
    query = query
      .gte('created_at', filters.dateRange.start.toISOString())
      .lte('created_at', filters.dateRange.end.toISOString())
  }

  if (filters?.status && filters.status.length > 0) {
    query = query.in('check_status', filters.status)
  }

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  
  // Remove sensitive fields but keep relevant compliance data
  return (data || []).map(record => ({
    person_name: record.person_name,
    role_title: record.role_title,
    role_type: record.role_type,
    department: record.department,
    dbs_check_type: record.dbs_check_type,
    issue_date: record.issue_date,
    expiry_date: record.expiry_date,
    check_status: record.check_status,
    works_with_children: record.works_with_children,
    works_with_vulnerable_adults: record.works_with_vulnerable_adults,
    training_completed: record.training_completed,
    reference_checks_completed: record.reference_checks_completed,
    is_active: record.is_active,
    created_at: record.created_at
  }))
}

async function exportOverseasActivities(
  supabase: any,
  orgId: string,
  filters?: ExportFilters,
  limit?: number
) {
  let query = supabase
    .from('overseas_activities')
    .select('*')
    .eq('organization_id', orgId)

  if (filters?.customFilters?.country) {
    query = query.in('country', filters.customFilters.country)
  }

  if (filters?.customFilters?.activity_type) {
    query = query.in('activity_type', filters.customFilters.activity_type)
  }

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

async function exportIncomeRecords(
  supabase: any,
  orgId: string,
  filters?: ExportFilters,
  limit?: number
) {
  let query = supabase
    .from('income_records')
    .select('*')
    .eq('organization_id', orgId)

  if (filters?.dateRange) {
    query = query
      .gte('date_received', filters.dateRange.start.toISOString())
      .lte('date_received', filters.dateRange.end.toISOString())
  }

  if (filters?.customFilters?.source_type) {
    query = query.in('source_type', filters.customFilters.source_type)
  }

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query.order('date_received', { ascending: false })

  if (error) throw error
  return data || []
}

async function exportDocuments(
  supabase: any,
  orgId: string,
  filters?: ExportFilters,
  limit?: number
) {
  let query = supabase
    .from('documents')
    .select('*')
    .eq('organization_id', orgId)

  if (filters?.dateRange) {
    query = query
      .gte('created_at', filters.dateRange.start.toISOString())
      .lte('created_at', filters.dateRange.end.toISOString())
  }

  if (filters?.customFilters?.type) {
    query = query.in('type', filters.customFilters.type)
  }

  if (filters?.categories && filters.categories.length > 0) {
    query = query.in('category', filters.categories)
  }

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  
  // Return metadata only, not file content
  return (data || []).map(doc => ({
    id: doc.id,
    file_name: doc.file_name,
    document_type: doc.document_type,
    category: doc.category,
    created_at: doc.created_at,
    file_size: doc.file_size,
    mime_type: doc.mime_type,
    expires_at: doc.expires_at,
    is_public: doc.is_public
  }))
}

async function exportAnnualReturnData(
  supabase: any,
  orgId: string,
  filters?: ExportFilters,
  limit?: number
) {
  // Get all data needed for annual return
  const year = filters?.customFilters?.year || new Date().getFullYear()
  const startDate = new Date(year, 0, 1)
  const endDate = new Date(year, 11, 31)

  const [
    org,
    fundraising,
    safeguarding,
    overseas,
    income
  ] = await Promise.all([
    supabase.from('organizations').select('*').eq('id', orgId).single(),
    supabase.from('income_records').select('*').eq('organization_id', orgId)
      .gte('date_received', startDate.toISOString())
      .lte('date_received', endDate.toISOString()),
    supabase.from('safeguarding_records').select('*').eq('organization_id', orgId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString()),
    supabase.from('overseas_activities').select('*').eq('organization_id', orgId),
    supabase.from('income_records').select('*').eq('organization_id', orgId)
      .gte('date_received', startDate.toISOString())
      .lte('date_received', endDate.toISOString())
  ])

  return [{
    organization: org.data,
    fundraising: fundraising.data || [],
    safeguarding: safeguarding.data || [],
    overseas: overseas.data || [],
    income: income.data || [],
    year
  }]
}

async function exportBoardPackData(
  supabase: any,
  orgId: string,
  filters?: ExportFilters,
  limit?: number
) {
  // Similar to annual return but with different formatting
  const dateRange = filters?.dateRange || {
    start: new Date(new Date().setMonth(new Date().getMonth() - 3)),
    end: new Date()
  }

  // Aggregate data for board pack
  const data = await exportAnnualReturnData(supabase, orgId, {
    ...filters,
    dateRange
  }, limit)

  return data
}

async function exportAllData(
  supabase: any,
  orgId: string,
  filters?: ExportFilters,
  limit?: number
) {
  // Export all data from all tables
  const tables = [
    'organizations',
    'income_records',
    'safeguarding_records',
    'overseas_activities',
    'documents',
    'compliance_scores'
  ]

  const allData: Record<string, any[]> = {}

  for (const table of tables) {
    let query = supabase.from(table).select('*')
    
    if (table !== 'organizations') {
      query = query.eq('organization_id', orgId)
    } else {
      query = query.eq('id', orgId)
    }

    if (filters?.dateRange && ['income_records', 'safeguarding_records'].includes(table)) {
      const dateField = table === 'income_records' ? 'date_received' : 'created_at'
      query = query
        .gte(dateField, filters.dateRange.start.toISOString())
        .lte(dateField, filters.dateRange.end.toISOString())
    }

    if (limit && table !== 'organizations') {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (!error && data) {
      allData[table] = data
    }
  }

  return [allData]
}