'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { dbsRecordSchema } from '../types/safeguarding'
import { z } from 'zod'

export async function createDBSRecord(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'Unauthorized' }
    }

    // Get user's organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (!membership?.organization_id) {
      return { error: 'No organization found' }
    }

    // Parse and validate form data
    const formObject = {
      person_name: formData.get('person_name'),
      dbs_number: formData.get('dbs_number') || null,
      issue_date: formData.get('issue_date') || null,
      expiry_date: formData.get('expiry_date') || null,
      dbs_type: formData.get('dbs_type'),
      role: formData.get('role') || null,
      department: formData.get('department') || null,
    }

    const validated = dbsRecordSchema.parse(formObject)

    // Calculate status based on expiry date
    let status = 'pending'
    if (validated.expiry_date) {
      const expiryDate = new Date(validated.expiry_date)
      const today = new Date()
      status = expiryDate > today ? 'valid' : 'expired'
    }

    // Insert record
    const { data, error } = await supabase
      .from('safeguarding_records')
      .insert({
        ...validated,
        organization_id: membership.organization_id,
      } as any)
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/compliance/safeguarding')
    return { data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: 'Failed to create DBS record' }
  }
}

export async function updateDBSRecord(id: string, formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'Unauthorized' }
    }

    // Parse and validate form data
    const formObject = {
      person_name: formData.get('person_name'),
      dbs_number: formData.get('dbs_number') || null,
      issue_date: formData.get('issue_date') || null,
      expiry_date: formData.get('expiry_date') || null,
      dbs_type: formData.get('dbs_type'),
      role: formData.get('role') || null,
      department: formData.get('department') || null,
    }

    const validated = dbsRecordSchema.parse(formObject)

    // Calculate status based on expiry date
    let status = 'pending'
    if (validated.expiry_date) {
      const expiryDate = new Date(validated.expiry_date)
      const today = new Date()
      status = expiryDate > today ? 'valid' : 'expired'
    }

    // Update record
    const { data, error } = await supabase
      .from('safeguarding_records')
      .update({
        ...validated,
      } as any)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/compliance/safeguarding')
    return { data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: 'Failed to update DBS record' }
  }
}

export async function deleteDBSRecord(id: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'Unauthorized' }
    }

    const { error } = await supabase
      .from('safeguarding_records')
      .delete()
      .eq('id', id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/compliance/safeguarding')
    return { success: true }
  } catch (error) {
    return { error: 'Failed to delete DBS record' }
  }
}

export async function bulkUpdateExpiredStatus() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'Unauthorized' }
    }

    // Status is calculated dynamically from expiry_date, no database update needed
    revalidatePath('/compliance/safeguarding')
    return { success: true }
  } catch (error) {
    return { error: 'Failed to update expired statuses' }
  }
}