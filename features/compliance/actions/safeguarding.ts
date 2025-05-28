'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { 
  SafeguardingRecord,
  CreateSafeguardingRecordInput, 
  UpdateSafeguardingRecordInput 
} from '../types/safeguarding-aligned'
import {
  fetchSafeguardingRecords,
  createSafeguardingRecordInDb,
  updateSafeguardingRecordInDb,
  deleteSafeguardingRecordFromDb,
  getUserOrganization
} from '../services/safeguarding.service'

/**
 * Server actions for safeguarding management
 * These handle authentication and call service functions
 */

export async function getSafeguardingRecords(): Promise<SafeguardingRecord[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { organizationId } = await getUserOrganization(user.id)
  return fetchSafeguardingRecords(organizationId)
}

export async function createSafeguardingRecord(data: FormData | CreateSafeguardingRecordInput): Promise<{ error?: string; data?: SafeguardingRecord }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Unauthorized')
    }

    // Parse input based on type
    const input = data instanceof FormData 
      ? {
          person_name: (data.get('person_name') as string)?.trim() || '',
          role_title: (data.get('role_title') as string)?.trim() || '',
          role_type: data.get('role_type') as CreateSafeguardingRecordInput['role_type'],
          department: (data.get('department') as string)?.trim() || null,
          dbs_certificate_number: (data.get('dbs_certificate_number') as string)?.trim() || null,
          dbs_check_type: data.get('dbs_check_type') as CreateSafeguardingRecordInput['dbs_check_type'],
          issue_date: new Date(data.get('issue_date') as string),
          expiry_date: new Date(data.get('expiry_date') as string),
          reference_checks_completed: data.get('reference_checks_completed') === 'true' || data.get('reference_checks_completed') === 'on',
          training_completed: data.get('training_completed') === 'true' || data.get('training_completed') === 'on',
          training_date: data.get('training_date') ? new Date(data.get('training_date') as string) : null,
          works_with_children: data.get('works_with_children') === 'true' || data.get('works_with_children') === 'on',
          works_with_vulnerable_adults: data.get('works_with_vulnerable_adults') === 'true' || data.get('works_with_vulnerable_adults') === 'on',
          unsupervised_access: data.get('unsupervised_access') === 'true' || data.get('unsupervised_access') === 'on',
          certificate_document_id: (data.get('certificate_document_id') as string)?.trim() || null,
          is_active: data.get('is_active') === 'true' || data.get('is_active') === 'on',
          notes: (data.get('notes') as string)?.trim() || null
        }
      : data

    const { organizationId } = await getUserOrganization(user.id)
    const record = await createSafeguardingRecordInDb(organizationId, input)
    
    revalidatePath('/compliance/safeguarding')
    return { data: record }
  } catch (error) {
    console.error('Create safeguarding record error:', error)
    return { error: error instanceof Error ? error.message : 'Failed to create safeguarding record' }
  }
}

export async function updateSafeguardingRecord(id: string, data: FormData | Partial<CreateSafeguardingRecordInput>): Promise<{ error?: string; data?: SafeguardingRecord }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Unauthorized')
    }

    // Parse input based on type
    const updates = data instanceof FormData 
      ? {
          person_name: (data.get('person_name') as string)?.trim() || '',
          role_title: (data.get('role_title') as string)?.trim() || '',
          role_type: data.get('role_type') as CreateSafeguardingRecordInput['role_type'],
          department: (data.get('department') as string)?.trim() || null,
          dbs_certificate_number: (data.get('dbs_certificate_number') as string)?.trim() || null,
          dbs_check_type: data.get('dbs_check_type') as CreateSafeguardingRecordInput['dbs_check_type'],
          issue_date: new Date(data.get('issue_date') as string),
          expiry_date: new Date(data.get('expiry_date') as string),
          reference_checks_completed: data.get('reference_checks_completed') === 'true' || data.get('reference_checks_completed') === 'on',
          training_completed: data.get('training_completed') === 'true' || data.get('training_completed') === 'on',
          training_date: data.get('training_date') ? new Date(data.get('training_date') as string) : null,
          works_with_children: data.get('works_with_children') === 'true' || data.get('works_with_children') === 'on',
          works_with_vulnerable_adults: data.get('works_with_vulnerable_adults') === 'true' || data.get('works_with_vulnerable_adults') === 'on',
          unsupervised_access: data.get('unsupervised_access') === 'true' || data.get('unsupervised_access') === 'on',
          certificate_document_id: (data.get('certificate_document_id') as string)?.trim() || null,
          is_active: data.get('is_active') === 'true' || data.get('is_active') === 'on',
          notes: (data.get('notes') as string)?.trim() || null
        }
      : data

    const input: UpdateSafeguardingRecordInput = { id, ...updates }

    const { organizationId } = await getUserOrganization(user.id)
    const record = await updateSafeguardingRecordInDb(organizationId, input)
    
    revalidatePath('/compliance/safeguarding')
    return { data: record }
  } catch (error) {
    console.error('Update safeguarding record error:', error)
    return { error: error instanceof Error ? error.message : 'Failed to update safeguarding record' }
  }
}

export async function deleteSafeguardingRecord(id: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { organizationId } = await getUserOrganization(user.id)
  await deleteSafeguardingRecordFromDb(organizationId, id)
  
  revalidatePath('/compliance/safeguarding')
}