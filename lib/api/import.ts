'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { parse } from 'csv-parse/sync'
import { 
  createSafeguardingRecordSchema,
  createOverseasActivitySchema,
  createIncomeRecordSchema
} from '@/lib/types/api.types'

export interface ImportResult {
  success: boolean
  imported: number
  skipped: number
  errors: Array<{
    row: number
    field?: string
    message: string
  }>
}

/**
 * Import safeguarding records from CSV
 */
export async function importSafeguardingRecords(
  organizationId: string,
  csvContent: string,
  mapping: Record<string, string>
): Promise<ImportResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [{ row: 0, message: 'Unauthorized' }]
    }
  }
  
  try {
    // Parse CSV
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    })
    
    const result: ImportResult = {
      success: true,
      imported: 0,
      skipped: 0,
      errors: []
    }
    
    // Process each row
    for (let i = 0; i < records.length; i++) {
      const row = records[i]
      const rowNumber = i + 2 // Account for header
      
      try {
        // Map CSV columns to our schema
        const mappedData: any = {}
        for (const [csvColumn, schemaField] of Object.entries(mapping)) {
          if (row[csvColumn] !== undefined) {
            mappedData[schemaField] = row[csvColumn]
          }
        }
        
        // Parse dates
        if (mappedData.issue_date) {
          mappedData.issue_date = new Date(mappedData.issue_date).toISOString()
        }
        if (mappedData.expiry_date) {
          mappedData.expiry_date = new Date(mappedData.expiry_date).toISOString()
        }
        if (mappedData.training_date) {
          mappedData.training_date = new Date(mappedData.training_date).toISOString()
        }
        
        // Parse booleans
        const booleanFields = [
          'works_with_children', 
          'works_with_vulnerable_adults',
          'unsupervised_access',
          'training_completed',
          'reference_checks_completed'
        ]
        for (const field of booleanFields) {
          if (mappedData[field] !== undefined) {
            mappedData[field] = ['true', 'yes', '1'].includes(
              String(mappedData[field]).toLowerCase()
            )
          }
        }
        
        // Validate with schema
        const validated = createSafeguardingRecordSchema.parse(mappedData)
        
        // Insert record
        const { error } = await supabase
          .from('safeguarding_records')
          .insert({
            ...validated,
            organization_id: organizationId,
            created_by: user.id
          })
        
        if (error) {
          result.errors.push({
            row: rowNumber,
            message: error.message
          })
          result.skipped++
        } else {
          result.imported++
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          result.errors.push({
            row: rowNumber,
            field: error.errors[0]?.path.join('.'),
            message: error.errors[0]?.message || 'Validation error'
          })
        } else {
          result.errors.push({
            row: rowNumber,
            message: error instanceof Error ? error.message : 'Unknown error'
          })
        }
        result.skipped++
      }
    }
    
    return result
  } catch (error) {
    return {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [{
        row: 0,
        message: error instanceof Error ? error.message : 'Failed to parse CSV'
      }]
    }
  }
}

/**
 * Import overseas activities from CSV
 */
export async function importOverseasActivities(
  organizationId: string,
  csvContent: string,
  mapping: Record<string, string>
): Promise<ImportResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [{ row: 0, message: 'Unauthorized' }]
    }
  }
  
  try {
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    })
    
    const result: ImportResult = {
      success: true,
      imported: 0,
      skipped: 0,
      errors: []
    }
    
    // Get country codes for lookup
    const { data: countries } = await supabase
      .from('countries')
      .select('code, name')
    
    const countryMap = new Map(
      countries?.map(c => [c.name.toLowerCase(), c.code]) || []
    )
    
    for (let i = 0; i < records.length; i++) {
      const row = records[i]
      const rowNumber = i + 2
      
      try {
        const mappedData: any = {}
        for (const [csvColumn, schemaField] of Object.entries(mapping)) {
          if (row[csvColumn] !== undefined) {
            mappedData[schemaField] = row[csvColumn]
          }
        }
        
        // Convert country name to code if needed
        if (mappedData.country_code && mappedData.country_code.length > 2) {
          const code = countryMap.get(mappedData.country_code.toLowerCase())
          if (code) {
            mappedData.country_code = code
          }
        }
        
        // Parse dates
        if (mappedData.transfer_date) {
          mappedData.transfer_date = new Date(mappedData.transfer_date).toISOString()
        }
        
        // Parse numbers
        mappedData.amount = parseFloat(mappedData.amount)
        mappedData.amount_gbp = parseFloat(mappedData.amount_gbp || mappedData.amount)
        if (mappedData.exchange_rate) {
          mappedData.exchange_rate = parseFloat(mappedData.exchange_rate)
        }
        if (mappedData.beneficiaries_count) {
          mappedData.beneficiaries_count = parseInt(mappedData.beneficiaries_count)
        }
        
        // Default financial year if not provided
        if (!mappedData.financial_year) {
          mappedData.financial_year = new Date().getFullYear()
        }
        
        const validated = createOverseasActivitySchema.parse(mappedData)
        
        const { error } = await supabase
          .from('overseas_activities')
          .insert({
            ...validated,
            organization_id: organizationId,
            created_by: user.id
          })
        
        if (error) {
          result.errors.push({
            row: rowNumber,
            message: error.message
          })
          result.skipped++
        } else {
          result.imported++
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          result.errors.push({
            row: rowNumber,
            field: error.errors[0]?.path.join('.'),
            message: error.errors[0]?.message || 'Validation error'
          })
        } else {
          result.errors.push({
            row: rowNumber,
            message: error instanceof Error ? error.message : 'Unknown error'
          })
        }
        result.skipped++
      }
    }
    
    return result
  } catch (error) {
    return {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [{
        row: 0,
        message: error instanceof Error ? error.message : 'Failed to parse CSV'
      }]
    }
  }
}

/**
 * Import income records from CSV
 */
export async function importIncomeRecords(
  organizationId: string,
  csvContent: string,
  mapping: Record<string, string>
): Promise<ImportResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [{ row: 0, message: 'Unauthorized' }]
    }
  }
  
  try {
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    })
    
    const result: ImportResult = {
      success: true,
      imported: 0,
      skipped: 0,
      errors: []
    }
    
    for (let i = 0; i < records.length; i++) {
      const row = records[i]
      const rowNumber = i + 2
      
      try {
        const mappedData: any = {}
        for (const [csvColumn, schemaField] of Object.entries(mapping)) {
          if (row[csvColumn] !== undefined) {
            mappedData[schemaField] = row[csvColumn]
          }
        }
        
        // Parse date
        if (mappedData.date_received) {
          mappedData.date_received = new Date(mappedData.date_received).toISOString()
        }
        
        // Parse amount
        mappedData.amount = parseFloat(
          String(mappedData.amount).replace(/[£$,]/g, '')
        )
        
        // Parse booleans
        const booleanFields = [
          'is_anonymous',
          'gift_aid_eligible',
          'gift_aid_claimed',
          'restricted_funds',
          'is_related_party'
        ]
        for (const field of booleanFields) {
          if (mappedData[field] !== undefined) {
            mappedData[field] = ['true', 'yes', '1'].includes(
              String(mappedData[field]).toLowerCase()
            )
          }
        }
        
        // Default financial year if not provided
        if (!mappedData.financial_year) {
          const date = new Date(mappedData.date_received)
          mappedData.financial_year = date.getFullYear()
        }
        
        const validated = createIncomeRecordSchema.parse(mappedData)
        
        const { error } = await supabase
          .from('income_records')
          .insert({
            ...validated,
            organization_id: organizationId,
            created_by: user.id
          })
        
        if (error) {
          result.errors.push({
            row: rowNumber,
            message: error.message
          })
          result.skipped++
        } else {
          result.imported++
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          result.errors.push({
            row: rowNumber,
            field: error.errors[0]?.path.join('.'),
            message: error.errors[0]?.message || 'Validation error'
          })
        } else {
          result.errors.push({
            row: rowNumber,
            message: error instanceof Error ? error.message : 'Unknown error'
          })
        }
        result.skipped++
      }
    }
    
    return result
  } catch (error) {
    return {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [{
        row: 0,
        message: error instanceof Error ? error.message : 'Failed to parse CSV'
      }]
    }
  }
}

/**
 * Preview CSV import to help with mapping
 */
export async function previewCSVImport(csvContent: string): Promise<{
  headers: string[]
  rows: any[]
  total: number
} | { error: string }> {
  try {
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      max_records: 5 // Only preview first 5 rows
    })
    
    if (records.length === 0) {
      return { error: 'No data found in CSV' }
    }
    
    return {
      headers: Object.keys(records[0]),
      rows: records,
      total: csvContent.split('\n').filter(line => line.trim()).length - 1
    }
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : 'Failed to parse CSV' 
    }
  }
}