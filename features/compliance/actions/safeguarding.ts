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

export async function createSafeguardingRecord(input: CreateSafeguardingRecordInput): Promise<SafeguardingRecord> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { organizationId } = await getUserOrganization(user.id)
  const record = await createSafeguardingRecordInDb(organizationId, input)
  
  revalidatePath('/compliance/safeguarding')
  return record
}

export async function updateSafeguardingRecord(input: UpdateSafeguardingRecordInput): Promise<SafeguardingRecord> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { organizationId } = await getUserOrganization(user.id)
  const record = await updateSafeguardingRecordInDb(organizationId, input)
  
  revalidatePath('/compliance/safeguarding')
  return record
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