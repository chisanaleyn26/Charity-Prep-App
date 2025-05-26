import { createClient } from '@/lib/supabase/server'
import { OverseasActivity } from '../types/overseas-activities'

export async function getOverseasActivities(): Promise<OverseasActivity[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('overseas_activities')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching overseas activities:', error)
    return []
  }

  // Handle nullable boolean fields
  return (data || []).map(activity => ({
    ...activity,
    sanctions_check_completed: activity.sanctions_check_completed ?? false,
    requires_reporting: activity.requires_reporting ?? false,
    reported_to_commission: activity.reported_to_commission ?? false,
    created_at: activity.created_at ?? new Date().toISOString(),
    updated_at: activity.updated_at ?? new Date().toISOString()
  }))
}

export async function getOverseasActivity(id: string): Promise<OverseasActivity | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('overseas_activities')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching overseas activity:', error)
    return null
  }

  if (!data) return null

  // Handle nullable boolean fields
  return {
    ...data,
    sanctions_check_completed: data.sanctions_check_completed ?? false,
    requires_reporting: data.requires_reporting ?? false,
    reported_to_commission: data.reported_to_commission ?? false,
    created_at: data.created_at ?? new Date().toISOString(),
    updated_at: data.updated_at ?? new Date().toISOString()
  }
}

export async function getOverseasStats() {
  const supabase = await createClient()
  
  const { data: activities, error } = await supabase
    .from('overseas_activities')
    .select('country_code, amount_gbp, transfer_method, sanctions_check_completed')

  if (error) {
    console.error('Error fetching overseas stats:', error)
    return {
      totalCountries: 0,
      activeActivities: 0,
      totalAnnualSpend: 0,
      highRiskActivities: 0
    }
  }

  const uniqueCountries = new Set((activities || []).map(a => a.country_code))
  const totalSpend = (activities || []).reduce((sum, a) => sum + (a.amount_gbp || 0), 0)
  
  // High risk if not bank transfer or sanctions check not completed
  const highRiskCount = (activities || []).filter(a => 
    a.transfer_method !== 'bank_transfer' || !a.sanctions_check_completed
  ).length

  return {
    totalCountries: uniqueCountries.size,
    activeActivities: (activities || []).length, // All activities are considered active
    totalAnnualSpend: totalSpend,
    highRiskActivities: highRiskCount
  }
}

export async function getActivitiesByCountry() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('overseas_activities')
    .select('country_code')

  if (error) {
    console.error('Error fetching activities by country:', error)
    return {}
  }

  const byCountry = (data || []).reduce((acc, activity) => {
    acc[activity.country_code] = (acc[activity.country_code] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return byCountry
}