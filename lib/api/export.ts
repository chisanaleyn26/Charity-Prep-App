'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentFinancialYear } from './utils'
import { Parser } from 'json2csv'

/**
 * Export safeguarding records as CSV
 */
export async function exportSafeguardingRecords(organizationId: string) {
  const supabase = await createClient()
  
  const { data: records, error } = await supabase
    .from('safeguarding_records')
    .select('*')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .order('person_name')
  
  if (error) {
    return { error: error.message }
  }
  
  const fields = [
    { label: 'Person Name', value: 'person_name' },
    { label: 'Role Title', value: 'role_title' },
    { label: 'Role Type', value: 'role_type' },
    { label: 'Department', value: 'department' },
    { label: 'DBS Check Type', value: 'dbs_check_type' },
    { label: 'Certificate Number', value: 'dbs_certificate_number' },
    { label: 'Issue Date', value: 'issue_date' },
    { label: 'Expiry Date', value: 'expiry_date' },
    { label: 'Works with Children', value: 'works_with_children' },
    { label: 'Works with Vulnerable Adults', value: 'works_with_vulnerable_adults' },
    { label: 'Training Completed', value: 'training_completed' },
    { label: 'Training Date', value: 'training_date' },
    { label: 'Active', value: 'is_active' },
    { label: 'Notes', value: 'notes' }
  ]
  
  const parser = new Parser({ fields })
  const csv = parser.parse(records || [])
  
  return {
    data: csv,
    filename: `safeguarding_records_${new Date().toISOString().split('T')[0]}.csv`,
    mimeType: 'text/csv'
  }
}

/**
 * Export overseas activities as CSV
 */
export async function exportOverseasActivities(
  organizationId: string,
  financialYear?: number
) {
  const supabase = await createClient()
  
  let query = supabase
    .from('overseas_activities')
    .select(`
      *,
      country:countries(name, is_high_risk),
      partner:overseas_partners(partner_name)
    `)
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
  
  if (financialYear) {
    query = query.eq('financial_year', financialYear)
  }
  
  const { data: activities, error } = await query.order('transfer_date', { ascending: false })
  
  if (error) {
    return { error: error.message }
  }
  
  const flattenedData = activities?.map(activity => ({
    ...activity,
    country_name: activity.country?.name,
    country_high_risk: activity.country?.is_high_risk,
    partner_name: activity.partner?.partner_name
  }))
  
  const fields = [
    { label: 'Activity Name', value: 'activity_name' },
    { label: 'Activity Type', value: 'activity_type' },
    { label: 'Country', value: 'country_name' },
    { label: 'High Risk Country', value: 'country_high_risk' },
    { label: 'Partner', value: 'partner_name' },
    { label: 'Transfer Date', value: 'transfer_date' },
    { label: 'Transfer Method', value: 'transfer_method' },
    { label: 'Amount', value: 'amount' },
    { label: 'Currency', value: 'currency' },
    { label: 'Amount (GBP)', value: 'amount_gbp' },
    { label: 'Exchange Rate', value: 'exchange_rate' },
    { label: 'Financial Year', value: 'financial_year' },
    { label: 'Quarter', value: 'quarter' },
    { label: 'Beneficiaries', value: 'beneficiaries_count' },
    { label: 'Sanctions Check', value: 'sanctions_check_completed' },
    { label: 'Reported to Commission', value: 'reported_to_commission' },
    { label: 'Description', value: 'description' }
  ]
  
  const parser = new Parser({ fields })
  const csv = parser.parse(flattenedData || [])
  
  return {
    data: csv,
    filename: `overseas_activities_${financialYear || 'all'}_${new Date().toISOString().split('T')[0]}.csv`,
    mimeType: 'text/csv'
  }
}

/**
 * Export income records as CSV
 */
export async function exportIncomeRecords(
  organizationId: string,
  financialYear?: number
) {
  const supabase = await createClient()
  
  // Get organization for financial year
  const { data: org } = await supabase
    .from('organizations')
    .select('financial_year_end')
    .eq('id', organizationId)
    .single()
  
  const year = financialYear || getCurrentFinancialYear(org?.financial_year_end || '03-31')
  
  const { data: records, error } = await supabase
    .from('income_records')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('financial_year', year)
    .is('deleted_at', null)
    .order('date_received', { ascending: false })
  
  if (error) {
    return { error: error.message }
  }
  
  const fields = [
    { label: 'Date Received', value: 'date_received' },
    { label: 'Source', value: 'source' },
    { label: 'Amount', value: 'amount' },
    { label: 'Donor Type', value: 'donor_type' },
    { label: 'Donor Name', value: 'donor_name' },
    { label: 'Anonymous', value: 'is_anonymous' },
    { label: 'Fundraising Method', value: 'fundraising_method' },
    { label: 'Campaign', value: 'campaign_name' },
    { label: 'Gift Aid Eligible', value: 'gift_aid_eligible' },
    { label: 'Gift Aid Claimed', value: 'gift_aid_claimed' },
    { label: 'Restricted Funds', value: 'restricted_funds' },
    { label: 'Restriction Details', value: 'restriction_details' },
    { label: 'Related Party', value: 'is_related_party' },
    { label: 'Related Party Relationship', value: 'related_party_relationship' },
    { label: 'Reference Number', value: 'reference_number' },
    { label: 'Financial Year', value: 'financial_year' },
    { label: 'Notes', value: 'notes' }
  ]
  
  const parser = new Parser({ fields })
  const csv = parser.parse(records || [])
  
  return {
    data: csv,
    filename: `income_records_${year}_${new Date().toISOString().split('T')[0]}.csv`,
    mimeType: 'text/csv'
  }
}

/**
 * Export all data for GDPR request
 */
export async function exportAllData(organizationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Unauthorized' }
  }
  
  // Verify admin access
  const { data: member } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .single()
  
  if (member?.role !== 'admin') {
    return { error: 'Admin access required' }
  }
  
  // Fetch all data
  const [
    { data: organization },
    { data: members },
    { data: safeguarding },
    { data: overseas },
    { data: partners },
    { data: income },
    { data: documents },
    { data: notifications }
  ] = await Promise.all([
    supabase.from('organizations').select('*').eq('id', organizationId).single(),
    supabase.from('organization_members').select('*, user:users(*)').eq('organization_id', organizationId),
    supabase.from('safeguarding_records').select('*').eq('organization_id', organizationId),
    supabase.from('overseas_activities').select('*').eq('organization_id', organizationId),
    supabase.from('overseas_partners').select('*').eq('organization_id', organizationId),
    supabase.from('income_records').select('*').eq('organization_id', organizationId),
    supabase.from('documents').select('*').eq('organization_id', organizationId),
    supabase.from('notifications').select('*').eq('organization_id', organizationId)
  ])
  
  const exportData = {
    exported_at: new Date().toISOString(),
    organization,
    members,
    compliance: {
      safeguarding,
      overseas_activities: overseas,
      overseas_partners: partners,
      income_records: income
    },
    documents,
    notifications
  }
  
  return {
    data: JSON.stringify(exportData, null, 2),
    filename: `charity_prep_export_${organizationId}_${new Date().toISOString().split('T')[0]}.json`,
    mimeType: 'application/json'
  }
}

/**
 * Install json2csv if not already installed
 * Run: npm install json2csv
 */