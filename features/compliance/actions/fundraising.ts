'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUserOrganization } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createFundraisingActivity(formData: FormData) {
  const supabase = await createClient()
  
  try {
    const { organizationId } = await getCurrentUserOrganization()
    
    const rawData = {
      source: formData.get('source') as string,
      amount: Number(formData.get('amount')),
      date_received: formData.get('date_received') as string,
      financial_year: Number(formData.get('financial_year')),
      donor_name: formData.get('donor_name') as string || null,
      donor_type: formData.get('donor_type') as string || null,
      campaign_name: formData.get('campaign_name') as string || null,
      fundraising_method: formData.get('fundraising_method') as string || null,
      gift_aid_eligible: formData.get('gift_aid_eligible') === 'true',
      gift_aid_claimed: formData.get('gift_aid_claimed') === 'true',
      is_anonymous: formData.get('is_anonymous') === 'true',
      is_related_party: formData.get('is_related_party') === 'true',
      related_party_relationship: formData.get('related_party_relationship') as string || null,
      restricted_funds: formData.get('restricted_funds') === 'true',
      restriction_details: formData.get('restriction_details') as string || null,
      reference_number: formData.get('reference_number') as string || null,
      notes: formData.get('notes') as string || null,
    }

    const { data, error } = await supabase
      .from('income_records')
      .insert({
        ...rawData,
        organization_id: organizationId,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating income record:', error)
      return { error: error.message }
    }

    revalidatePath('/compliance/fundraising')
    return { data }
  } catch (error) {
    console.error('Error in createFundraisingActivity:', error)
    return { error: error instanceof Error ? error.message : 'Failed to create record' }
  }
}

export async function updateFundraisingActivity(id: string, formData: FormData) {
  const supabase = await createClient()
  
  try {
    const rawData = {
      source: formData.get('source') as string,
      amount: Number(formData.get('amount')),
      date_received: formData.get('date_received') as string,
      financial_year: Number(formData.get('financial_year')),
      donor_name: formData.get('donor_name') as string || null,
      donor_type: formData.get('donor_type') as string || null,
      campaign_name: formData.get('campaign_name') as string || null,
      fundraising_method: formData.get('fundraising_method') as string || null,
      gift_aid_eligible: formData.get('gift_aid_eligible') === 'true',
      gift_aid_claimed: formData.get('gift_aid_claimed') === 'true',
      is_anonymous: formData.get('is_anonymous') === 'true',
      is_related_party: formData.get('is_related_party') === 'true',
      related_party_relationship: formData.get('related_party_relationship') as string || null,
      restricted_funds: formData.get('restricted_funds') === 'true',
      restriction_details: formData.get('restriction_details') as string || null,
      reference_number: formData.get('reference_number') as string || null,
      notes: formData.get('notes') as string || null,
    }

    const { data, error } = await supabase
      .from('income_records')
      .update(rawData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating income record:', error)
      return { error: error.message }
    }

    revalidatePath('/compliance/fundraising')
    return { data }
  } catch (error) {
    console.error('Error in updateFundraisingActivity:', error)
    return { error: error instanceof Error ? error.message : 'Failed to update record' }
  }
}

export async function deleteFundraisingActivity(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('income_records')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/compliance/fundraising')
  return { success: true }
}

export async function updateRaisedAmount(id: string, amount: number) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('income_records')
    .update({ amount: amount })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/compliance/fundraising')
  return { data }
}

export async function markComplianceComplete(id: string) {
  const supabase = await createClient()
  
  // Income records don't have compliance_checks_completed field
  // This is a no-op for compatibility
  const { data, error } = await supabase
    .from('income_records')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/compliance/fundraising')
  return { data }
}