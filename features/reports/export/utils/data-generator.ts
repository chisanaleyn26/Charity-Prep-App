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
      return await exportSafeguardingIncidents(supabase, orgId, filters, limit)
    
    case 'overseas-activities':
      return await exportOverseasActivities(supabase, orgId, filters, limit)
    
    case 'income-sources':
      return await exportIncomeSources(supabase, orgId, filters, limit)
    
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
  let query = supabase
    .from('fundraising_events')
    .select('*')
    .eq('organization_id', orgId)

  if (filters?.dateRange) {
    query = query
      .gte('event_date', filters.dateRange.start.toISOString())
      .lte('event_date', filters.dateRange.end.toISOString())
  }

  if (filters?.customFilters?.event_type) {
    query = query.in('event_type', filters.customFilters.event_type)
  }

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query.order('event_date', { ascending: false })

  if (error) throw error
  return data || []
}

async function exportSafeguardingIncidents(
  supabase: any,
  orgId: string,
  filters?: ExportFilters,
  limit?: number
) {
  let query = supabase
    .from('safeguarding_incidents')
    .select('*')
    .eq('organization_id', orgId)

  if (filters?.dateRange) {
    query = query
      .gte('incident_date', filters.dateRange.start.toISOString())
      .lte('incident_date', filters.dateRange.end.toISOString())
  }

  if (filters?.status && filters.status.length > 0) {
    query = query.in('status', filters.status)
  }

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query.order('incident_date', { ascending: false })

  if (error) throw error
  
  // Remove sensitive fields
  return (data || []).map(incident => ({
    incident_date: incident.incident_date,
    incident_type: incident.incident_type,
    severity: incident.severity,
    status: incident.status,
    reported_to_authorities: incident.reported_to_authorities,
    outcome: incident.outcome
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

async function exportIncomeSources(
  supabase: any,
  orgId: string,
  filters?: ExportFilters,
  limit?: number
) {
  let query = supabase
    .from('income_sources')
    .select('*')
    .eq('organization_id', orgId)

  if (filters?.dateRange) {
    query = query
      .gte('date', filters.dateRange.start.toISOString())
      .lte('date', filters.dateRange.end.toISOString())
  }

  if (filters?.customFilters?.source) {
    query = query.in('source', filters.customFilters.source)
  }

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query.order('date', { ascending: false })

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
      .gte('uploaded_at', filters.dateRange.start.toISOString())
      .lte('uploaded_at', filters.dateRange.end.toISOString())
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

  const { data, error } = await query.order('uploaded_at', { ascending: false })

  if (error) throw error
  
  // Return metadata only, not file content
  return (data || []).map(doc => ({
    id: doc.id,
    name: doc.name,
    type: doc.type,
    category: doc.category,
    uploaded_at: doc.uploaded_at,
    status: doc.status,
    file_size: doc.file_size
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
    supabase.from('fundraising_events').select('*').eq('organization_id', orgId)
      .gte('event_date', startDate.toISOString())
      .lte('event_date', endDate.toISOString()),
    supabase.from('safeguarding_incidents').select('*').eq('organization_id', orgId)
      .gte('incident_date', startDate.toISOString())
      .lte('incident_date', endDate.toISOString()),
    supabase.from('overseas_activities').select('*').eq('organization_id', orgId),
    supabase.from('income_sources').select('*').eq('organization_id', orgId)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
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
    'fundraising_events',
    'safeguarding_incidents',
    'overseas_activities',
    'income_sources',
    'documents',
    'compliance_scores',
    'compliance_actions'
  ]

  const allData: Record<string, any[]> = {}

  for (const table of tables) {
    let query = supabase.from(table).select('*')
    
    if (table !== 'organizations') {
      query = query.eq('organization_id', orgId)
    } else {
      query = query.eq('id', orgId)
    }

    if (filters?.dateRange && ['fundraising_events', 'safeguarding_incidents', 'income_sources'].includes(table)) {
      const dateField = table === 'fundraising_events' ? 'event_date' : 
                       table === 'safeguarding_incidents' ? 'incident_date' : 'date'
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