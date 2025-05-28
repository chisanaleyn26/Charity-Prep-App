import { createServerClient } from '@/lib/supabase/server'
import type { 
  SafeguardingRecord, 
  CreateSafeguardingRecordInput, 
  UpdateSafeguardingRecordInput 
} from '../types/safeguarding-aligned'

/**
 * Pure service functions for safeguarding data operations
 * These functions handle direct database operations without auth checks
 */

export async function fetchSafeguardingRecords(organizationId: string): Promise<SafeguardingRecord[]> {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('safeguarding_records')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching safeguarding records:', error)
    throw new Error('Failed to fetch safeguarding records')
  }

  // Handle nullable boolean fields with default values and convert dates
  return (data || []).map(record => ({
    ...record,
    issue_date: new Date(record.issue_date),
    expiry_date: new Date(record.expiry_date),
    training_date: record.training_date ? new Date(record.training_date) : null,
    created_at: record.created_at ? new Date(record.created_at) : new Date(),
    updated_at: record.updated_at ? new Date(record.updated_at) : new Date(),
    deleted_at: record.deleted_at ? new Date(record.deleted_at) : null,
    reference_checks_completed: record.reference_checks_completed ?? false,
    training_completed: record.training_completed ?? false,
    works_with_children: record.works_with_children ?? false,
    works_with_vulnerable_adults: record.works_with_vulnerable_adults ?? false,
    unsupervised_access: record.unsupervised_access ?? false,
    is_active: record.is_active ?? true
  }))
}

export async function createSafeguardingRecordInDb(
  organizationId: string,
  input: CreateSafeguardingRecordInput
): Promise<SafeguardingRecord> {
  const supabase = await createServerClient()
  
  // Validate DBS certificate number if provided
  if (input.dbs_certificate_number && !/^\d{12}$/.test(input.dbs_certificate_number)) {
    throw new Error('DBS certificate number must be exactly 12 digits')
  }

  // Validate expiry date > issue date
  if (new Date(input.expiry_date) <= new Date(input.issue_date)) {
    throw new Error('DBS expiry date must be after issue date')
  }
  
  const insertData = {
    organization_id: organizationId,
    person_name: input.person_name,
    role_title: input.role_title,
    role_type: input.role_type,
    department: input.department || null,
    dbs_certificate_number: input.dbs_certificate_number || null,
    dbs_check_type: input.dbs_check_type,
    issue_date: input.issue_date,
    expiry_date: input.expiry_date,
    reference_checks_completed: input.reference_checks_completed ?? false,
    training_completed: input.training_completed ?? false,
    training_date: input.training_date || null,
    works_with_children: input.works_with_children ?? false,
    works_with_vulnerable_adults: input.works_with_vulnerable_adults ?? false,
    unsupervised_access: input.unsupervised_access ?? false,
    certificate_document_id: input.certificate_document_id || null,
    is_active: input.is_active ?? true,
    notes: input.notes || null
  }
  
  const { data, error } = await supabase
    .from('safeguarding_records')
    .insert(insertData as any)
    .select()
    .single()

  if (error) {
    console.error('Error creating safeguarding record:', error)
    throw new Error('Failed to create safeguarding record')
  }

  return {
    ...data,
    issue_date: new Date(data.issue_date),
    expiry_date: new Date(data.expiry_date),
    training_date: data.training_date ? new Date(data.training_date) : null,
    created_at: data.created_at ? new Date(data.created_at) : new Date(),
    updated_at: data.updated_at ? new Date(data.updated_at) : new Date(),
    deleted_at: data.deleted_at ? new Date(data.deleted_at) : null
  }
}

export async function updateSafeguardingRecordInDb(
  organizationId: string,
  input: UpdateSafeguardingRecordInput
): Promise<SafeguardingRecord> {
  const supabase = await createServerClient()
  
  const { id, ...updates } = input
  
  // Validate DBS certificate number if provided
  if (updates.dbs_certificate_number && !/^\d{12}$/.test(updates.dbs_certificate_number)) {
    throw new Error('DBS certificate number must be exactly 12 digits')
  }

  // Validate expiry date > issue date if both provided
  if (updates.issue_date && updates.expiry_date) {
    if (new Date(updates.expiry_date) <= new Date(updates.issue_date)) {
      throw new Error('DBS expiry date must be after issue date')
    }
  }
  
  const { data, error } = await supabase
    .from('safeguarding_records')
    .update(updates)
    .eq('id', id)
    .eq('organization_id', organizationId) // Ensure user can only update their org's records
    .select()
    .single()

  if (error) {
    console.error('Error updating safeguarding record:', error)
    throw new Error('Failed to update safeguarding record')
  }

  return {
    ...data,
    issue_date: new Date(data.issue_date),
    expiry_date: new Date(data.expiry_date),
    training_date: data.training_date ? new Date(data.training_date) : null,
    created_at: data.created_at ? new Date(data.created_at) : new Date(),
    updated_at: data.updated_at ? new Date(data.updated_at) : new Date(),
    deleted_at: data.deleted_at ? new Date(data.deleted_at) : null
  }
}

export async function deleteSafeguardingRecordFromDb(
  organizationId: string,
  id: string
): Promise<void> {
  const supabase = await createServerClient()
  
  const { error } = await supabase
    .from('safeguarding_records')
    .delete()
    .eq('id', id)
    .eq('organization_id', organizationId) // Ensure user can only delete their org's records

  if (error) {
    console.error('Error deleting safeguarding record:', error)
    throw new Error('Failed to delete safeguarding record')
  }
}

export async function debugGetUserOrganization(userId: string): Promise<any> {
  const supabase = await createServerClient()
  
  try {
    // Check what's in the users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    // Check organization memberships
    const { data: memberships, error: membershipError } = await supabase
      .from('organization_members')
      .select('*')
      .eq('user_id', userId)

    // Check organizations
    const { data: organizations, error: orgsError } = await supabase
      .from('organizations')
      .select('*')

    return {
      debug: true,
      userId,
      user: { data: user, error: userError },
      memberships: { data: memberships, error: membershipError },
      organizations: { data: organizations, error: orgsError },
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      debug: true,
      userId,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }
  }
}

export async function getUserOrganization(userId: string): Promise<{ organizationId: string }> {
  const supabase = await createServerClient()
  
  // First, try to get the user's current organization from the users table
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('current_organization_id')
    .eq('id', userId)
    .single()

  if (!userError && user?.current_organization_id) {
    return { organizationId: user.current_organization_id }
  }

  // If no current org set, get the first organization membership
  const { data: memberships, error: membershipError } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', userId)
    .limit(1)

  if (membershipError) {
    console.error('Error fetching user organization memberships:', membershipError)
    throw new Error('Failed to fetch user organization')
  }

  if (!memberships || memberships.length === 0) {
    throw new Error('User has no organization memberships. Please create or join an organization first.')
  }

  const organizationId = memberships[0].organization_id

  // Optionally set this as the user's current organization for next time
  await supabase
    .from('users')
    .update({ current_organization_id: organizationId })
    .eq('id', userId)

  return { organizationId }
}