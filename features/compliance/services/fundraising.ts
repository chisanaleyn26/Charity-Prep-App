import { createClient } from '@/lib/supabase/server'
import { FundraisingActivity } from '../types/fundraising'

export async function getFundraisingActivities(): Promise<FundraisingActivity[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('income_records')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching fundraising activities:', error)
    return []
  }

  return data || []
}

export async function getActiveFundraisingActivities(): Promise<FundraisingActivity[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('income_records')
    .select('*')
    .eq('status', 'active')
    .order('end_date', { ascending: true })

  if (error) {
    console.error('Error fetching active fundraising activities:', error)
    return []
  }

  return data || []
}

export async function getFundraisingActivity(id: string): Promise<FundraisingActivity | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('income_records')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching fundraising activity:', error)
    return null
  }

  return data
}

export async function getFundraisingStats() {
  const supabase = await createClient()
  
  const { data: activities, error } = await supabase
    .from('income_records')
    .select('amount, financial_year, donor_type, is_related_party')

  if (error) {
    console.error('Error fetching fundraising stats:', error)
    return {
      activeActivities: 0,
      totalTarget: 0,
      totalRaised: 0,
      averageProgress: 0,
      needingCompliance: 0
    }
  }

  // For income records, adapt the stats to available fields
  const totalRecords = (activities || []).length
  const totalAmount = (activities || []).reduce((sum, a) => sum + (a.amount || 0), 0)
  const currentYear = new Date().getFullYear()
  const currentYearRecords = (activities || []).filter(a => a.financial_year === currentYear).length
  const needingCompliance = (activities || []).filter(a => 
    a.amount > 100000 || a.donor_type === 'corporate' || a.is_related_party
  ).length

  return {
    activeActivities: currentYearRecords,
    totalTarget: totalAmount,
    totalRaised: totalAmount,
    averageProgress: 100, // Income records are completed by definition
    needingCompliance
  }
}

export async function getTopFundraisingActivities(limit: number = 5): Promise<FundraisingActivity[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('income_records')
    .select('*')
    .order('amount', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching top fundraising activities:', error)
    return []
  }

  return data || []
}

export async function getFundraisingByType() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('income_records')
    .select('source, amount')

  if (error) {
    console.error('Error fetching fundraising by type:', error)
    return {}
  }

  const byType = (data || []).reduce((acc, activity) => {
    if (!acc[activity.source]) {
      acc[activity.source] = 0
    }
    acc[activity.source] += activity.amount || 0
    return acc
  }, {} as Record<string, number>)

  return byType
}