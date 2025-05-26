'use server'

import { createClient } from '@/lib/supabase/server'
import { addDays, subDays, subMonths } from 'date-fns'

export interface DemoDataOptions {
  organizationId: string
  includeSafeguarding?: boolean
  includeOverseas?: boolean
  includeIncome?: boolean
  includeDocuments?: boolean
  realisticDates?: boolean
}

/**
 * Seed demo data for an organization
 */
export async function seedDemoData(
  options: DemoDataOptions
): Promise<{ success?: boolean; summary?: string; error?: string }> {
  try {
    const supabase = await createClient()
    const summary: string[] = []
    
    // Safeguarding Records
    if (options.includeSafeguarding !== false) {
      const safeguardingData = [
        {
          person_name: 'Sarah Johnson',
          role: 'Trustee',
          record_type: 'dbs_enhanced',
          reference_number: 'DBS001234567',
          issue_date: subMonths(new Date(), 18).toISOString(),
          expiry_date: addDays(new Date(), 540).toISOString(), // 18 months left
          status: 'active'
        },
        {
          person_name: 'Michael Chen',
          role: 'Youth Worker',
          record_type: 'dbs_enhanced',
          reference_number: 'DBS001234568',
          issue_date: subMonths(new Date(), 30).toISOString(),
          expiry_date: addDays(new Date(), 180).toISOString(), // 6 months left
          status: 'active'
        },
        {
          person_name: 'Emma Williams',
          role: 'Volunteer Coordinator',
          record_type: 'dbs_basic',
          reference_number: 'DBS001234569',
          issue_date: subMonths(new Date(), 35).toISOString(),
          expiry_date: addDays(new Date(), 25).toISOString(), // Expiring soon!
          status: 'active'
        },
        {
          person_name: 'David Thompson',
          role: 'Finance Officer',
          record_type: 'reference',
          reference_number: 'REF2023001',
          issue_date: subMonths(new Date(), 6).toISOString(),
          status: 'active'
        },
        {
          person_name: 'Lisa Anderson',
          role: 'Safeguarding Lead',
          record_type: 'training',
          reference_number: 'TRAIN2023001',
          issue_date: subMonths(new Date(), 3).toISOString(),
          expiry_date: addDays(new Date(), 270).toISOString(),
          status: 'active',
          notes: 'Level 3 Safeguarding Training completed'
        }
      ]
      
      for (const record of safeguardingData) {
        await supabase
          .from('safeguarding_records')
          .insert({
            ...record,
            organization_id: options.organizationId
          })
      }
      
      summary.push(`Added ${safeguardingData.length} safeguarding records`)
    }
    
    // Overseas Activities
    if (options.includeOverseas !== false) {
      // First ensure we have countries
      const { data: countries } = await supabase
        .from('countries')
        .select('*')
        .in('code', ['KE', 'UG', 'IN', 'BD', 'PK'])
      
      if (!countries || countries.length === 0) {
        // Seed basic country data
        await supabase
          .from('countries')
          .insert([
            { code: 'KE', name: 'Kenya', risk_level: 'medium', additional_checks_required: true },
            { code: 'UG', name: 'Uganda', risk_level: 'medium', additional_checks_required: true },
            { code: 'IN', name: 'India', risk_level: 'low', additional_checks_required: false },
            { code: 'BD', name: 'Bangladesh', risk_level: 'high', additional_checks_required: true },
            { code: 'PK', name: 'Pakistan', risk_level: 'high', additional_checks_required: true }
          ])
      }
      
      const overseasData = [
        {
          country_id: 'KE',
          activity_type: 'grant',
          description: 'School building project in Nairobi',
          amount: 25000,
          currency: 'GBP',
          activity_date: subMonths(new Date(), 2).toISOString(),
          partner_organization: 'Nairobi Education Foundation',
          transfer_method: 'bank_transfer',
          purpose_category: 'education'
        },
        {
          country_id: 'UG',
          activity_type: 'direct_aid',
          description: 'Medical supplies for rural clinic',
          amount: 8500,
          currency: 'GBP',
          activity_date: subMonths(new Date(), 1).toISOString(),
          partner_organization: 'Uganda Rural Health Initiative',
          transfer_method: 'wire_transfer',
          purpose_category: 'healthcare'
        },
        {
          country_id: 'IN',
          activity_type: 'volunteer_trip',
          description: 'Volunteer teaching program',
          amount: 3200,
          currency: 'GBP',
          activity_date: subDays(new Date(), 45).toISOString(),
          partner_organization: 'Delhi Youth Education Trust',
          transfer_method: 'credit_card',
          purpose_category: 'education'
        },
        {
          country_id: 'BD',
          activity_type: 'grant',
          description: 'Emergency flood relief',
          amount: 15000,
          currency: 'GBP',
          activity_date: subDays(new Date(), 20).toISOString(),
          partner_organization: 'Bangladesh Relief Network',
          transfer_method: 'bank_transfer',
          purpose_category: 'humanitarian',
          supporting_documents: ['flood_relief_proposal.pdf', 'partner_agreement.pdf']
        }
      ]
      
      for (const activity of overseasData) {
        await supabase
          .from('overseas_activities')
          .insert({
            ...activity,
            organization_id: options.organizationId
          })
      }
      
      summary.push(`Added ${overseasData.length} overseas activities`)
    }
    
    // Income Records
    if (options.includeIncome !== false) {
      const incomeData = [
        {
          source: 'donation',
          amount: 50000,
          currency: 'GBP',
          date_received: subMonths(new Date(), 1).toISOString(),
          donor_name: 'The Thompson Foundation',
          donor_type: 'trust',
          anonymous: false,
          gift_aid_eligible: false,
          restricted: true,
          restriction_details: 'For Kenya school project only',
          related_party: false
        },
        {
          source: 'donation',
          amount: 2500,
          currency: 'GBP',
          date_received: subDays(new Date(), 15).toISOString(),
          donor_type: 'individual',
          anonymous: true,
          gift_aid_eligible: true,
          restricted: false,
          related_party: false
        },
        {
          source: 'grant',
          amount: 75000,
          currency: 'GBP',
          date_received: subMonths(new Date(), 3).toISOString(),
          donor_name: 'National Lottery Community Fund',
          donor_type: 'government',
          anonymous: false,
          gift_aid_eligible: false,
          restricted: true,
          restriction_details: 'Youth program funding 2024-2025',
          related_party: false
        },
        {
          source: 'fundraising',
          amount: 12340,
          currency: 'GBP',
          date_received: subDays(new Date(), 30).toISOString(),
          description: 'Annual Gala Dinner',
          campaign_name: 'Spring Gala 2024',
          anonymous: false,
          gift_aid_eligible: false,
          restricted: false,
          related_party: false,
          notes: 'Net proceeds after event costs'
        },
        {
          source: 'trading',
          amount: 5600,
          currency: 'GBP',
          date_received: subDays(new Date(), 10).toISOString(),
          description: 'Charity shop sales - March',
          anonymous: false,
          gift_aid_eligible: false,
          restricted: false,
          related_party: false
        },
        {
          source: 'donation',
          amount: 28000,
          currency: 'GBP',
          date_received: subDays(new Date(), 5).toISOString(),
          donor_name: 'Anonymous Major Donor',
          donor_type: 'individual',
          anonymous: true,
          gift_aid_eligible: false,
          restricted: false,
          related_party: false,
          threshold_exceeded: true,
          notes: 'Large anonymous donation - enhanced due diligence completed'
        }
      ]
      
      for (const income of incomeData) {
        await supabase
          .from('income_records')
          .insert({
            ...income,
            organization_id: options.organizationId
          })
      }
      
      summary.push(`Added ${incomeData.length} income records`)
    }
    
    // Sample Documents
    if (options.includeDocuments) {
      const documents = [
        {
          name: 'Safeguarding Policy 2024.pdf',
          type: 'policy',
          category: 'safeguarding',
          file_size: 245000,
          mime_type: 'application/pdf'
        },
        {
          name: 'Annual Accounts 2023.pdf',
          type: 'report',
          category: 'financial',
          file_size: 1250000,
          mime_type: 'application/pdf'
        },
        {
          name: 'Kenya Project Report Q1.docx',
          type: 'report',
          category: 'overseas',
          file_size: 562000,
          mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }
      ]
      
      for (const doc of documents) {
        await supabase
          .from('documents')
          .insert({
            ...doc,
            organization_id: options.organizationId,
            uploaded_by: '00000000-0000-0000-0000-000000000000', // System
            storage_path: `demo/${options.organizationId}/${doc.name}`
          })
      }
      
      summary.push(`Added ${documents.length} sample documents`)
    }
    
    // Create some notifications
    const notifications = [
      {
        type: 'dbs_expiry',
        title: 'DBS Check Expiring Soon',
        message: 'Emma Williams\' DBS check expires in 25 days',
        severity: 'warning' as const,
        link: '/compliance/safeguarding'
      },
      {
        type: 'overseas_alert',
        title: 'High Risk Country Activity',
        message: 'Recent activity in Bangladesh requires additional documentation',
        severity: 'info' as const,
        link: '/compliance/overseas'
      },
      {
        type: 'compliance_score',
        title: 'Compliance Score Update',
        message: 'Your compliance score has improved to 87%',
        severity: 'success' as const,
        link: '/dashboard'
      }
    ]
    
    for (const notification of notifications) {
      await supabase
        .from('notifications')
        .insert({
          ...notification,
          organization_id: options.organizationId
        })
    }
    
    summary.push(`Added ${notifications.length} sample notifications`)
    
    return {
      success: true,
      summary: summary.join(', ')
    }
    
  } catch (error) {
    console.error('Seed demo data error:', error)
    return { error: 'Failed to seed demo data' }
  }
}

/**
 * Clear all data for an organization (dangerous!)
 */
export async function clearOrganizationData(
  organizationId: string,
  confirm: boolean = false
): Promise<{ success?: boolean; error?: string }> {
  if (!confirm) {
    return { error: 'Must confirm data deletion' }
  }
  
  try {
    const supabase = await createClient()
    
    // Delete in order of dependencies
    const tables = [
      'notifications',
      'documents',
      'income_records',
      'overseas_activities',
      'safeguarding_records',
      'activity_logs',
      'performance_metrics',
      'error_logs',
      'ai_requests'
    ]
    
    for (const table of tables) {
      await supabase
        .from(table)
        .delete()
        .eq('organization_id', organizationId)
    }
    
    return { success: true }
    
  } catch (error) {
    console.error('Clear organization data error:', error)
    return { error: 'Failed to clear data' }
  }
}

/**
 * Generate realistic test data patterns
 */
export async function generateRealisticData(
  organizationId: string,
  months: number = 12
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    
    // Generate data over time period
    for (let month = 0; month < months; month++) {
      const baseDate = subMonths(new Date(), month)
      
      // Add some DBS checks (staggered)
      if (month % 3 === 0) {
        await supabase
          .from('safeguarding_records')
          .insert({
            organization_id: organizationId,
            person_name: `Staff Member ${month}`,
            role: 'Volunteer',
            record_type: 'dbs_basic',
            reference_number: `DBS00${1000 + month}`,
            issue_date: baseDate.toISOString(),
            expiry_date: addDays(baseDate, 1095).toISOString(), // 3 years
            status: 'active'
          })
      }
      
      // Add monthly income
      const monthlyDonations = Math.floor(Math.random() * 5) + 1
      for (let i = 0; i < monthlyDonations; i++) {
        await supabase
          .from('income_records')
          .insert({
            organization_id: organizationId,
            source: ['donation', 'grant', 'fundraising'][Math.floor(Math.random() * 3)] as any,
            amount: Math.floor(Math.random() * 10000) + 100,
            currency: 'GBP',
            date_received: addDays(baseDate, Math.floor(Math.random() * 28)).toISOString(),
            donor_type: ['individual', 'trust', 'corporate'][Math.floor(Math.random() * 3)] as any,
            anonymous: Math.random() > 0.8,
            gift_aid_eligible: Math.random() > 0.5,
            restricted: Math.random() > 0.7,
            related_party: false
          })
      }
      
      // Add quarterly overseas activity
      if (month % 3 === 0) {
        await supabase
          .from('overseas_activities')
          .insert({
            organization_id: organizationId,
            country_id: ['KE', 'UG', 'IN'][Math.floor(Math.random() * 3)],
            activity_type: 'grant',
            description: `Q${Math.floor(month / 3) + 1} overseas program`,
            amount: Math.floor(Math.random() * 20000) + 5000,
            currency: 'GBP',
            activity_date: baseDate.toISOString(),
            transfer_method: 'bank_transfer',
            purpose_category: ['education', 'healthcare', 'humanitarian'][Math.floor(Math.random() * 3)] as any
          })
      }
    }
    
    return { success: true }
    
  } catch (error) {
    console.error('Generate realistic data error:', error)
    return { error: 'Failed to generate data' }
  }
}