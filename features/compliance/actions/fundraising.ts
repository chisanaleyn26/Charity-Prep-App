'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { 
  FundraisingActivity,
  CreateFundraisingActivityInput,
  UpdateFundraisingActivityInput
} from '../types/fundraising'
import {
  fetchFundraisingActivities,
  createFundraisingActivityInDb,
  updateFundraisingActivityInDb,
  deleteFundraisingActivityFromDb,
  getUserOrganization
} from '../services/fundraising.service'

/**
 * Server actions for fundraising/income records management
 * These handle authentication and call service functions
 */

export async function getFundraisingActivities(): Promise<FundraisingActivity[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { organizationId } = await getUserOrganization(user.id)
  return fetchFundraisingActivities(organizationId)
}

export async function createFundraisingActivity(input: CreateFundraisingActivityInput): Promise<FundraisingActivity> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { organizationId } = await getUserOrganization(user.id)
  const activity = await createFundraisingActivityInDb(organizationId, input)
  
  revalidatePath('/compliance/fundraising')
  return activity
}

export async function updateFundraisingActivity(input: UpdateFundraisingActivityInput): Promise<FundraisingActivity> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { organizationId } = await getUserOrganization(user.id)
  const activity = await updateFundraisingActivityInDb(organizationId, input)
  
  revalidatePath('/compliance/fundraising')
  return activity
}

export async function deleteFundraisingActivity(id: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { organizationId } = await getUserOrganization(user.id)
  await deleteFundraisingActivityFromDb(organizationId, id)
  
  revalidatePath('/compliance/fundraising')
}

export async function updateRaisedAmount(id: string, amount: number): Promise<FundraisingActivity> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { organizationId } = await getUserOrganization(user.id)
  const activity = await updateFundraisingActivityInDb(organizationId, { id, amount })
  
  revalidatePath('/compliance/fundraising')
  return activity
}

export async function markComplianceComplete(id: string): Promise<FundraisingActivity> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { organizationId } = await getUserOrganization(user.id)
  const activity = await updateFundraisingActivityInDb(organizationId, { 
    id, 
    compliance_status: 'compliant' 
  })
  
  revalidatePath('/compliance/fundraising')
  return activity
}