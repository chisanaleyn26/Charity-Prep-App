'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { 
  OverseasActivity,
  CreateOverseasActivityInput,
  UpdateOverseasActivityInput
} from '../types/overseas-activities'
import {
  fetchOverseasActivities,
  createOverseasActivityInDb,
  updateOverseasActivityInDb,
  deleteOverseasActivityFromDb,
  getUserOrganization
} from '../services/overseas-activities.service'

/**
 * Server actions for overseas activities management
 * These handle authentication and call service functions
 */

export async function getOverseasActivities(): Promise<OverseasActivity[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { organizationId } = await getUserOrganization(user.id)
  return fetchOverseasActivities(organizationId)
}

export async function createOverseasActivity(input: CreateOverseasActivityInput): Promise<OverseasActivity> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { organizationId } = await getUserOrganization(user.id)
  const activity = await createOverseasActivityInDb(organizationId, input)
  
  revalidatePath('/compliance/overseas-activities')
  return activity
}

export async function updateOverseasActivity(input: UpdateOverseasActivityInput): Promise<OverseasActivity> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { organizationId } = await getUserOrganization(user.id)
  const activity = await updateOverseasActivityInDb(organizationId, input)
  
  revalidatePath('/compliance/overseas-activities')
  return activity
}

export async function deleteOverseasActivity(id: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { organizationId } = await getUserOrganization(user.id)
  await deleteOverseasActivityFromDb(organizationId, id)
  
  revalidatePath('/compliance/overseas-activities')
}

export async function updateComplianceStatus(id: string, sanctionsCompleted: boolean, reportingRequired: boolean): Promise<OverseasActivity> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { organizationId } = await getUserOrganization(user.id)
  const activity = await updateOverseasActivityInDb(organizationId, {
    id,
    sanctions_check_completed: sanctionsCompleted,
    requires_reporting: reportingRequired
  })
  
  revalidatePath('/compliance/overseas-activities')
  return activity
}