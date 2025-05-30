import { createServerClient, getCurrentUserOrganization } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'
import type { 
  FundraisingActivity,
  CreateFundraisingActivityInput,
  UpdateFundraisingActivityInput
} from '../types/fundraising'

/**
 * Pure service functions for fundraising data operations
 * These functions handle direct database operations without auth checks
 */

// Internal function without caching
async function _fetchFundraisingActivities(organizationId: string): Promise<FundraisingActivity[]> {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('income_records')
    .select('*')
    .eq('organization_id', organizationId)
    .order('date_received', { ascending: false })

  if (error) {
    console.error('Database error fetching income records:', error)
    throw new Error(`Failed to fetch income records: ${error.message}`)
  }

  // Convert numeric fields from strings to numbers
  const processedData = (data || []).map(record => ({
    ...record,
    amount: typeof record.amount === 'string' ? parseFloat(record.amount) : record.amount,
    is_anonymous: record.is_anonymous ?? false,
    restricted_funds: record.restricted_funds ?? false,
    is_related_party: record.is_related_party ?? false,
    gift_aid_eligible: record.gift_aid_eligible ?? false,
    gift_aid_claimed: record.gift_aid_claimed ?? false
  }))

  return processedData
}

export async function fetchFundraisingActivities(organizationId: string): Promise<FundraisingActivity[]> {
  return _fetchFundraisingActivities(organizationId)
}

export async function createFundraisingActivityInDb(
  organizationId: string,
  input: CreateFundraisingActivityInput
): Promise<FundraisingActivity> {
  const supabase = await createServerClient()
  
  // Get current user for created_by field
  const { data: { user } } = await supabase.auth.getUser()
  
  const insertData = {
    organization_id: organizationId,
    source: input.source,
    amount: input.amount,
    date_received: input.date_received,
    financial_year: input.financial_year,
    donor_type: input.donor_type || null,
    donor_name: input.donor_name || null,
    is_anonymous: input.is_anonymous ?? false,
    fundraising_method: input.fundraising_method || null,
    campaign_name: input.campaign_name || null,
    restricted_funds: input.restricted_funds ?? false,
    restriction_details: input.restriction_details || null,
    is_related_party: input.is_related_party ?? false,
    related_party_relationship: input.related_party_relationship || null,
    gift_aid_eligible: input.gift_aid_eligible ?? false,
    gift_aid_claimed: input.gift_aid_claimed ?? false,
    reference_number: input.reference_number || null,
    notes: input.notes || null,
    created_by: user?.id || null
  }
  
  const { data, error } = await supabase
    .from('income_records')
    .insert(insertData as any)
    .select()
    .single()

  if (error) {
    console.error('Error creating income record:', error)
    throw new Error(`Failed to create income record: ${error.message}`)
  }

  return data
}

export async function updateFundraisingActivityInDb(
  organizationId: string,
  input: UpdateFundraisingActivityInput
): Promise<FundraisingActivity> {
  const supabase = await createServerClient()
  
  const { id, ...updates } = input
  
  const { data, error } = await supabase
    .from('income_records')
    .update(updates)
    .eq('id', id)
    .eq('organization_id', organizationId) // Ensure user can only update their org's records
    .select()
    .single()

  if (error) {
    console.error('Error updating income record:', error)
    throw new Error('Failed to update income record')
  }

  return data
}

export async function deleteFundraisingActivityFromDb(
  organizationId: string,
  id: string
): Promise<void> {
  const supabase = await createServerClient()
  
  const { error } = await supabase
    .from('income_records')
    .delete()
    .eq('id', id)
    .eq('organization_id', organizationId) // Ensure user can only delete their org's records

  if (error) {
    console.error('Error deleting income record:', error)
    throw new Error('Failed to delete income record')
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