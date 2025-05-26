import { parse } from 'csv-parse/sync'
import type { CSVColumnMapping } from '../types/extraction'

export interface CSVParseResult {
  headers: string[]
  rows: any[]
  rowCount: number
  sampleData: any[]
  dataTypes: Record<string, DataTypeInfo>
}

export interface DataTypeInfo {
  type: 'string' | 'number' | 'date' | 'boolean' | 'email' | 'phone' | 'mixed'
  format?: string
  nullable: boolean
  examples: any[]
  confidence: number
}

// Parse CSV file
export async function parseCSVFile(
  file: File,
  options?: {
    delimiter?: string
    encoding?: string
    maxRows?: number
  }
): Promise<CSVParseResult> {
  try {
    const text = await file.text()
    
    // Parse CSV
    const records = parse(text, {
      delimiter: options?.delimiter || ',',
      columns: true, // Use first row as headers
      skip_empty_lines: true,
      trim: true,
      cast: false, // Keep as strings for type inference
      max_record_size: 1000000
    })
    
    // Get headers
    const headers = Object.keys(records[0] || {})
    
    // Limit rows if specified
    const rows = options?.maxRows 
      ? records.slice(0, options.maxRows)
      : records
      
    // Get sample data (first 5 rows)
    const sampleData = rows.slice(0, 5)
    
    // Infer data types
    const dataTypes = inferDataTypes(headers, rows)
    
    return {
      headers,
      rows,
      rowCount: records.length,
      sampleData,
      dataTypes
    }
  } catch (error) {
    console.error('CSV parsing error:', error)
    throw new Error('Failed to parse CSV file')
  }
}

// Infer data types from column values
function inferDataTypes(
  headers: string[],
  rows: any[]
): Record<string, DataTypeInfo> {
  const dataTypes: Record<string, DataTypeInfo> = {}
  
  for (const header of headers) {
    const values = rows
      .map(row => row[header])
      .filter(val => val !== null && val !== undefined && val !== '')
      
    if (values.length === 0) {
      dataTypes[header] = {
        type: 'string',
        nullable: true,
        examples: [],
        confidence: 0
      }
      continue
    }
    
    // Check for various data types
    const typeChecks = {
      email: values.filter(v => isEmail(v)).length,
      phone: values.filter(v => isPhone(v)).length,
      date: values.filter(v => isDate(v)).length,
      number: values.filter(v => isNumber(v)).length,
      boolean: values.filter(v => isBoolean(v)).length
    }
    
    // Find dominant type
    const totalValues = values.length
    let dominantType: DataTypeInfo['type'] = 'string'
    let maxCount = 0
    let format: string | undefined
    
    for (const [type, count] of Object.entries(typeChecks)) {
      const percentage = count / totalValues
      if (percentage > 0.8 && count > maxCount) {
        dominantType = type as DataTypeInfo['type']
        maxCount = count
      }
    }
    
    // Special handling for dates to detect format
    if (dominantType === 'date') {
      format = detectDateFormat(values)
    }
    
    dataTypes[header] = {
      type: dominantType,
      format,
      nullable: values.length < rows.length,
      examples: values.slice(0, 3),
      confidence: maxCount / totalValues
    }
  }
  
  return dataTypes
}

// Type checking functions
function isEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value)
}

function isPhone(value: string): boolean {
  // Remove common separators
  const cleaned = value.replace(/[\s\-\(\)\.]/g, '')
  // Check if it's mostly digits and reasonable length
  return /^\+?\d{10,15}$/.test(cleaned)
}

function isDate(value: string): boolean {
  // Try common date formats
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/,           // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}$/,         // MM/DD/YYYY or DD/MM/YYYY
    /^\d{2}-\d{2}-\d{4}$/,           // MM-DD-YYYY or DD-MM-YYYY
    /^\d{1,2}\/\d{1,2}\/\d{2,4}$/,  // M/D/YY or D/M/YYYY
  ]
  
  if (!datePatterns.some(pattern => pattern.test(value))) {
    return false
  }
  
  // Try to parse as date
  const date = new Date(value)
  return !isNaN(date.getTime())
}

function isNumber(value: string): boolean {
  // Remove common thousand separators
  const cleaned = value.replace(/,/g, '')
  // Check for currency symbols and remove
  const withoutCurrency = cleaned.replace(/[£$€¥]/g, '')
  
  return !isNaN(parseFloat(withoutCurrency)) && isFinite(Number(withoutCurrency))
}

function isBoolean(value: string): boolean {
  const lower = value.toLowerCase()
  return ['true', 'false', 'yes', 'no', 'y', 'n', '1', '0'].includes(lower)
}

// Detect date format from samples
function detectDateFormat(values: string[]): string {
  const formats: Record<string, number> = {
    'YYYY-MM-DD': 0,
    'DD/MM/YYYY': 0,
    'MM/DD/YYYY': 0,
    'DD-MM-YYYY': 0,
    'MM-DD-YYYY': 0
  }
  
  for (const value of values.slice(0, 10)) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) formats['YYYY-MM-DD']++
    else if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      // Try to determine if DD/MM or MM/DD
      const parts = value.split('/')
      const first = parseInt(parts[0])
      const second = parseInt(parts[1])
      
      if (first > 12) formats['DD/MM/YYYY']++
      else if (second > 12) formats['MM/DD/YYYY']++
      else formats['DD/MM/YYYY']++ // Default to DD/MM for ambiguous
    }
  }
  
  // Return the most common format
  return Object.entries(formats)
    .sort(([, a], [, b]) => b - a)[0][0]
}

// Validate CSV structure
export function validateCSV(
  result: CSVParseResult,
  requirements?: {
    requiredHeaders?: string[]
    minRows?: number
    maxRows?: number
  }
): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Check required headers
  if (requirements?.requiredHeaders) {
    const missingHeaders = requirements.requiredHeaders.filter(
      h => !result.headers.includes(h)
    )
    if (missingHeaders.length > 0) {
      errors.push(`Missing required columns: ${missingHeaders.join(', ')}`)
    }
  }
  
  // Check row count
  if (requirements?.minRows && result.rowCount < requirements.minRows) {
    errors.push(`Too few rows. Minimum required: ${requirements.minRows}`)
  }
  
  if (requirements?.maxRows && result.rowCount > requirements.maxRows) {
    errors.push(`Too many rows. Maximum allowed: ${requirements.maxRows}`)
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Clean and normalize CSV data
export function normalizeCSVData(
  rows: any[],
  dataTypes: Record<string, DataTypeInfo>
): any[] {
  return rows.map(row => {
    const normalized: any = {}
    
    for (const [key, value] of Object.entries(row)) {
      const typeInfo = dataTypes[key]
      
      if (!value || value === '') {
        normalized[key] = null
        continue
      }
      
      switch (typeInfo?.type) {
        case 'number':
          normalized[key] = parseFloat(String(value).replace(/[£$€¥,]/g, ''))
          break
          
        case 'boolean':
          const lower = String(value).toLowerCase()
          normalized[key] = ['true', 'yes', 'y', '1'].includes(lower)
          break
          
        case 'date':
          normalized[key] = new Date(value).toISOString().split('T')[0]
          break
          
        default:
          normalized[key] = String(value).trim()
      }
    }
    
    return normalized
  })
}