import { openrouter, AI_MODELS, callOpenRouter } from '@/lib/ai/openrouter'
import { MAPPING_PROMPTS, fillPrompt } from '@/lib/ai/prompts'
import type { CSVColumnMapping, DataTypeInfo } from '../types/extraction'
import type { CSVParseResult } from './csv-parser'

// Schema definitions for different import types
export const IMPORT_SCHEMAS = {
  safeguarding: {
    fields: {
      person_name: { type: 'string', required: true, description: 'Full name of person' },
      dbs_certificate_number: { type: 'string', required: false, description: '12-digit DBS certificate number' },
      issue_date: { type: 'date', required: true, description: 'Date certificate was issued' },
      expiry_date: { type: 'date', required: true, description: 'Date certificate expires' },
      role_title: { type: 'string', required: true, description: 'Job title or role' },
      role_type: { type: 'enum', required: true, description: 'employee, volunteer, trustee, or contractor' },
      dbs_check_type: { type: 'enum', required: true, description: 'basic, standard, enhanced, or enhanced_barred' },
      department: { type: 'string', required: false, description: 'Department or team' }
    }
  },
  fundraising: {
    fields: {
      source: { type: 'string', required: true, description: 'Source of income' },
      amount: { type: 'number', required: true, description: 'Amount received' },
      date_received: { type: 'date', required: true, description: 'Date of receipt' },
      donor_name: { type: 'string', required: false, description: 'Name of donor' },
      donor_type: { type: 'enum', required: true, description: 'individual, corporate, foundation, trust, government, or other' },
      is_anonymous: { type: 'boolean', required: false, description: 'Whether donation is anonymous' },
      gift_aid_eligible: { type: 'boolean', required: false, description: 'Eligible for Gift Aid' },
      reference_number: { type: 'string', required: false, description: 'Reference or invoice number' }
    }
  },
  overseas_activities: {
    fields: {
      activity_name: { type: 'string', required: true, description: 'Name of activity' },
      country_code: { type: 'string', required: true, description: 'Country code or name' },
      amount: { type: 'number', required: true, description: 'Amount in original currency' },
      currency: { type: 'string', required: true, description: 'Currency code' },
      amount_gbp: { type: 'number', required: false, description: 'Amount in GBP' },
      transfer_date: { type: 'date', required: true, description: 'Date of transfer' },
      transfer_method: { type: 'enum', required: true, description: 'bank_transfer, wire_transfer, etc.' },
      partner_organization: { type: 'string', required: false, description: 'Partner organization name' }
    }
  }
} as const

export type ImportType = keyof typeof IMPORT_SCHEMAS

// Map CSV columns to schema using AI
export async function mapColumnsWithAI(
  csvData: CSVParseResult,
  importType: ImportType
): Promise<CSVColumnMapping> {
  try {
    const schema = IMPORT_SCHEMAS[importType]
    const schemaDescription = Object.entries(schema.fields)
      .map(([field, info]) => 
        `- ${field}: ${info.description} (${info.type}${info.required ? ', required' : ''})`
      )
      .join('\n')
    
    // Prepare sample data for context
    const sampleRows = csvData.sampleData
      .slice(0, 3)
      .map(row => JSON.stringify(row, null, 2))
      .join('\n')
    
    const prompt = fillPrompt(MAPPING_PROMPTS.CSV_COLUMNS, {
      headers: csvData.headers.join(', '),
      schemaFields: schemaDescription
    })
    
    const enhancedPrompt = `${prompt}

Sample data from CSV:
${sampleRows}

Data type analysis:
${JSON.stringify(csvData.dataTypes, null, 2)}

Important: Match columns based on both name similarity and data content.`

    // Call AI for mapping
    const response = await callOpenRouter(async () => {
      return await openrouter.chat.completions.create({
        model: AI_MODELS.FAST,
        messages: [
          {
            role: 'system',
            content: 'You are a data mapping expert. Analyze CSV columns and map them to database schema fields accurately.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 1500
      })
    })

    const result = JSON.parse(response.choices[0]?.message?.content || '{}')
    
    // Validate and enhance mappings
    const enhancedMappings = enhanceMappings(
      result.mappings || {},
      csvData,
      schema.fields
    )
    
    return {
      mappings: enhancedMappings,
      unmapped_columns: result.unmapped_columns || [],
      missing_required: result.missing_required || []
    }
    
  } catch (error) {
    console.error('Column mapping error:', error)
    // Return empty mapping on error
    return {
      mappings: {},
      unmapped_columns: csvData.headers,
      missing_required: Object.entries(IMPORT_SCHEMAS[importType].fields)
        .filter(([, info]) => info.required)
        .map(([field]) => field)
    }
  }
}

// Enhance AI mappings with additional validation
function enhanceMappings(
  mappings: any,
  csvData: CSVParseResult,
  schemaFields: any
): CSVColumnMapping['mappings'] {
  const enhanced: CSVColumnMapping['mappings'] = {}
  
  for (const [targetField, fieldInfo] of Object.entries(schemaFields)) {
    const mapping = mappings[targetField] || {}
    const csvColumn = mapping.csv_column
    
    if (csvColumn && csvData.headers.includes(csvColumn)) {
      // Validate data type compatibility
      const csvDataType = csvData.dataTypes[csvColumn]
      const isCompatible = checkTypeCompatibility(
        csvDataType,
        fieldInfo as any
      )
      
      enhanced[targetField] = {
        csv_column: csvColumn,
        confidence: mapping.confidence || (isCompatible ? 0.8 : 0.5),
        reason: mapping.reason || 'AI-suggested mapping'
      }
    } else {
      enhanced[targetField] = {
        csv_column: null,
        confidence: 0,
        reason: 'No matching column found'
      }
    }
  }
  
  return enhanced
}

// Check if CSV data type is compatible with schema field type
function checkTypeCompatibility(
  csvType: DataTypeInfo,
  schemaField: any
): boolean {
  const typeMap: Record<string, string[]> = {
    string: ['string', 'email', 'phone'],
    number: ['number'],
    date: ['date'],
    boolean: ['boolean'],
    enum: ['string']
  }
  
  const compatibleTypes = typeMap[schemaField.type] || []
  return compatibleTypes.includes(csvType.type)
}

// Apply column mappings to transform CSV data
export function applyColumnMappings(
  csvRows: any[],
  mappings: CSVColumnMapping['mappings'],
  importType: ImportType
): any[] {
  const schema = IMPORT_SCHEMAS[importType]
  
  return csvRows.map(row => {
    const mappedRow: any = {}
    
    for (const [targetField, mapping] of Object.entries(mappings)) {
      if (mapping.csv_column && row[mapping.csv_column] !== undefined) {
        const value = row[mapping.csv_column]
        const fieldInfo = schema.fields[targetField as keyof typeof schema.fields]
        
        // Transform value based on target type
        mappedRow[targetField] = transformValue(value, fieldInfo.type)
      }
    }
    
    return mappedRow
  })
}

// Transform value to match schema type
function transformValue(value: any, targetType: string): any {
  if (value === null || value === undefined || value === '') {
    return null
  }
  
  switch (targetType) {
    case 'number':
      return parseFloat(String(value).replace(/[£$€¥,]/g, ''))
      
    case 'boolean':
      const lower = String(value).toLowerCase()
      return ['true', 'yes', 'y', '1'].includes(lower)
      
    case 'date':
      const date = new Date(value)
      return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0]
      
    default:
      return String(value).trim()
  }
}

// Get mapping suggestions for a specific column
export async function getSuggestionForColumn(
  columnName: string,
  sampleValues: any[],
  targetFields: string[]
): Promise<string | null> {
  try {
    const prompt = `Given a CSV column named "${columnName}" with these sample values:
${sampleValues.slice(0, 5).join(', ')}

Which of these target fields is the best match?
${targetFields.join(', ')}

Return only the field name or null if no good match.`

    const response = await callOpenRouter(async () => {
      return await openrouter.chat.completions.create({
        model: AI_MODELS.FAST,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 50
      })
    })

    const suggestion = response.choices[0]?.message?.content?.trim()
    return targetFields.includes(suggestion || '') ? suggestion : null
    
  } catch (error) {
    console.error('Failed to get column suggestion:', error)
    return null
  }
}

// Validate mapped data before import
export function validateMappedData(
  mappedRows: any[],
  importType: ImportType
): { valid: boolean; errors: string[] } {
  const schema = IMPORT_SCHEMAS[importType]
  const errors: string[] = []
  
  // Check required fields
  for (const [field, info] of Object.entries(schema.fields)) {
    if (info.required) {
      const missingCount = mappedRows.filter(row => !row[field]).length
      if (missingCount > 0) {
        errors.push(`${missingCount} rows missing required field: ${field}`)
      }
    }
  }
  
  // Type-specific validation
  if (importType === 'safeguarding') {
    // Validate DBS numbers
    const invalidDBS = mappedRows.filter(row => 
      row.dbs_certificate_number && !/^\d{12}$/.test(row.dbs_certificate_number)
    ).length
    if (invalidDBS > 0) {
      errors.push(`${invalidDBS} rows have invalid DBS certificate numbers`)
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Generate a CSV template for a given import type
 */
export function generateCSVTemplate(type: ImportType): string {
  const schema = IMPORT_SCHEMAS[type]
  if (!schema) {
    throw new Error(`Unknown import type: ${type}`)
  }
  
  // Get all field names
  const headers = Object.keys(schema.fields)
  
  // Create sample data rows based on field types
  const sampleRows: string[][] = []
  
  // Add 3 sample rows
  for (let i = 1; i <= 3; i++) {
    const row: string[] = []
    
    for (const [fieldName, fieldDef] of Object.entries(schema.fields)) {
      let sampleValue = ''
      
      // Generate appropriate sample data based on field name and type
      if (fieldName.includes('name')) {
        sampleValue = `Example Person ${i}`
      } else if (fieldName.includes('certificate_number')) {
        sampleValue = '123456789012'
      } else if (fieldName.includes('date')) {
        const date = new Date()
        date.setDate(date.getDate() - i * 30)
        sampleValue = date.toISOString().split('T')[0]
      } else if (fieldName.includes('amount')) {
        sampleValue = (1000 * i).toString()
      } else if (fieldName.includes('email')) {
        sampleValue = `person${i}@example.com`
      } else if (fieldName.includes('phone')) {
        sampleValue = `+44 20 7123 456${i}`
      } else if (fieldName.includes('type') || fieldName.includes('category')) {
        sampleValue = 'Standard'
      } else if (fieldName.includes('country')) {
        sampleValue = i === 1 ? 'Kenya' : i === 2 ? 'India' : 'Uganda'
      } else if (fieldName.includes('currency')) {
        sampleValue = 'GBP'
      } else if (fieldName.includes('reference')) {
        sampleValue = `REF-2024-${String(i).padStart(3, '0')}`
      } else if (fieldDef.type === 'boolean') {
        sampleValue = i % 2 === 0 ? 'Yes' : 'No'
      } else if (fieldDef.type === 'number') {
        sampleValue = (100 * i).toString()
      } else {
        sampleValue = `Sample ${fieldName.replace(/_/g, ' ')} ${i}`
      }
      
      row.push(sampleValue)
    }
    
    sampleRows.push(row)
  }
  
  // Build CSV content
  const csvLines: string[] = []
  
  // Add header row
  csvLines.push(headers.join(','))
  
  // Add sample data rows
  for (const row of sampleRows) {
    csvLines.push(row.map(cell => {
      // Escape values that contain commas or quotes
      if (cell.includes(',') || cell.includes('"')) {
        return `"${cell.replace(/"/g, '""')}"`
      }
      return cell
    }).join(','))
  }
  
  return csvLines.join('\n')
}