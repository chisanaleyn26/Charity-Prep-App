import { createServerClient, getCurrentUserOrganization } from '@/lib/supabase/server'
import type { 
  OverseasActivity,
  CreateOverseasActivityInput,
  UpdateOverseasActivityInput
} from '../types/overseas-activities'

/**
 * Pure service functions for overseas activities data operations
 * These functions handle direct database operations without auth checks
 */

export async function fetchOverseasActivities(organizationId: string): Promise<OverseasActivity[]> {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('overseas_activities')
    .select('*')
    .eq('organization_id', organizationId)
    .order('transfer_date', { ascending: false })

  if (error) {
    console.error('Error fetching overseas activities:', error)
    throw new Error('Failed to fetch overseas activities')
  }

  // Handle nullable boolean fields with default values
  return (data || []).map(activity => ({
    ...activity,
    sanctions_check_completed: activity.sanctions_check_completed ?? false,
    requires_reporting: activity.requires_reporting ?? false,
    reported_to_commission: activity.reported_to_commission ?? false
  }))
}

export async function createOverseasActivityInDb(
  organizationId: string,
  input: CreateOverseasActivityInput
): Promise<OverseasActivity> {
  const supabase = await createServerClient()
  
  const insertData = {
    organization_id: organizationId,
    activity_name: input.activity_name,
    activity_type: input.activity_type,
    country_code: input.country_code,
    partner_id: input.partner_id || null,
    amount: input.amount,
    currency: input.currency || 'GBP',
    amount_gbp: input.amount_gbp,
    exchange_rate: input.exchange_rate || null,
    transfer_method: input.transfer_method,
    transfer_date: input.transfer_date,
    transfer_reference: input.transfer_reference || null,
    financial_year: input.financial_year,
    quarter: input.quarter || null,
    beneficiaries_count: input.beneficiaries_count || null,
    project_code: input.project_code || null,
    description: input.description || null,
    sanctions_check_completed: input.sanctions_check_completed ?? false,
    requires_reporting: input.requires_reporting ?? false,
    reported_to_commission: input.reported_to_commission ?? false
  }
  
  const { data, error } = await supabase
    .from('overseas_activities')
    .insert(insertData as any)
    .select()
    .single()

  if (error) {
    console.error('Error creating overseas activity:', error)
    throw new Error('Failed to create overseas activity')
  }

  return data
}

export async function updateOverseasActivityInDb(
  organizationId: string,
  input: UpdateOverseasActivityInput
): Promise<OverseasActivity> {
  const supabase = await createServerClient()
  
  const { id, ...updates } = input
  
  const { data, error } = await supabase
    .from('overseas_activities')
    .update(updates)
    .eq('id', id)
    .eq('organization_id', organizationId) // Ensure user can only update their org's activities
    .select()
    .single()

  if (error) {
    console.error('Error updating overseas activity:', error)
    throw new Error('Failed to update overseas activity')
  }

  return data
}

export async function deleteOverseasActivityFromDb(
  organizationId: string,
  id: string
): Promise<void> {
  const supabase = await createServerClient()
  
  const { error } = await supabase
    .from('overseas_activities')
    .delete()
    .eq('id', id)
    .eq('organization_id', organizationId) // Ensure user can only delete their org's activities

  if (error) {
    console.error('Error deleting overseas activity:', error)
    throw new Error('Failed to delete overseas activity')
  }
}

export async function getUserOrganization(userId: string): Promise<{ organizationId: string }> {
  // Use the existing helper that properly handles RLS and authentication
  const userOrg = await getCurrentUserOrganization()
  
  if (!userOrg) {
    throw new Error('User has no organization memberships. Please create or join an organization first.')
  }

  return { organizationId: userOrg.organizationId }
}