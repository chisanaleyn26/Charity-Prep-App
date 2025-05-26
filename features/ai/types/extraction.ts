import { z } from 'zod'

// AI Task Status
export type AITaskStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'

// AI Task Types
export type AITaskType = 
  | 'email_extraction'
  | 'document_ocr'
  | 'csv_mapping'
  | 'narrative_generation'
  | 'compliance_check'
  | 'search_query'

// Base AI Task
export interface AITask {
  id: string
  organization_id: string
  type: AITaskType
  status: AITaskStatus
  input_data: Record<string, any>
  output_data?: Record<string, any>
  error_message?: string
  confidence_score?: number
  created_at: Date
  updated_at: Date
  processed_at?: Date
}

// Extraction Results
export interface ExtractionResult<T = any> {
  success: boolean
  data?: T
  confidence: number
  fields?: ExtractionField[]
  error?: string
  requires_review: boolean
}

export interface ExtractionField {
  field_name: string
  value: any
  confidence: number
  location?: {
    page?: number
    x?: number
    y?: number
    width?: number
    height?: number
  }
}

// DBS Certificate Extraction
export const DBSExtractionSchema = z.object({
  person_name: z.string().nullable(),
  dbs_certificate_number: z.string().regex(/^\d{12}$/).nullable(),
  issue_date: z.string().nullable(),
  dbs_check_type: z.enum(['basic', 'standard', 'enhanced', 'enhanced_barred']).nullable(),
  expiry_date: z.string().nullable(),
  confidence: z.number().min(0).max(1)
})

export type DBSExtraction = z.infer<typeof DBSExtractionSchema>

// Receipt/Expense Extraction
export const ReceiptExtractionSchema = z.object({
  vendor_name: z.string().nullable(),
  amount: z.number().nullable(),
  currency: z.string().default('GBP'),
  transaction_date: z.string().nullable(),
  category: z.string().nullable(),
  reference_number: z.string().nullable(),
  confidence: z.number().min(0).max(1)
})

export type ReceiptExtraction = z.infer<typeof ReceiptExtractionSchema>

// Donation Email Extraction
export const DonationExtractionSchema = z.object({
  donor_name: z.string().nullable(),
  amount: z.number(),
  date_received: z.string(),
  source: z.enum(['online', 'cash', 'cheque', 'bank_transfer', 'other']).default('other'),
  donor_type: z.enum(['individual', 'corporate', 'foundation', 'trust', 'government', 'other']).default('individual'),
  is_anonymous: z.boolean().default(false),
  restricted_funds: z.boolean().default(false),
  restriction_details: z.string().nullable(),
  gift_aid_eligible: z.boolean().default(false),
  reference_number: z.string().nullable(),
  confidence: z.number().min(0).max(1)
})

export type DonationExtraction = z.infer<typeof DonationExtractionSchema>

// Overseas Transfer Extraction
export const OverseasTransferExtractionSchema = z.object({
  country_name: z.string(),
  amount: z.number(),
  currency: z.string(),
  amount_gbp: z.number().nullable(),
  transfer_method: z.enum(['bank_transfer', 'wire_transfer', 'cash_courier', 'other']).default('bank_transfer'),
  transfer_date: z.string(),
  activity_description: z.string().nullable(),
  partner_organization: z.string().nullable(),
  confidence: z.number().min(0).max(1)
})

export type OverseasTransferExtraction = z.infer<typeof OverseasTransferExtractionSchema>

// CSV Column Mapping
export interface CSVColumnMapping {
  mappings: Record<string, {
    csv_column: string | null
    confidence: number
    reason: string
  }>
  unmapped_columns: string[]
  missing_required: string[]
}

// Document Processing
export interface DocumentProcessingRequest {
  id: string
  file_url: string
  file_type: 'pdf' | 'image' | 'email' | 'csv'
  document_type?: 'dbs_certificate' | 'receipt' | 'donation_letter' | 'bank_statement' | 'other'
  metadata?: Record<string, any>
}

export interface DocumentProcessingResult {
  request_id: string
  status: 'success' | 'failed' | 'partial'
  extractions: ExtractionResult[]
  processing_time_ms: number
  error?: string
}

// Search Query Parsing
export interface ParsedSearchQuery {
  context: 'safeguarding' | 'overseas' | 'fundraising' | 'all'
  filters: Array<{
    field: string
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between'
    value: any
  }>
  sort?: {
    field: string
    direction: 'asc' | 'desc'
  }
  interpretation: string
}

// Narrative Generation
export interface NarrativeRequest {
  topic: string
  data_context: Record<string, any>
  tone?: 'formal' | 'friendly' | 'professional'
  length?: 'short' | 'medium' | 'long'
  include_recommendations?: boolean
}

export interface NarrativeResult {
  content: string
  word_count: number
  sections: Array<{
    title: string
    content: string
  }>
  recommendations?: string[]
}

// Compliance Q&A
export interface ComplianceQuestion {
  question: string
  context?: string
  category?: 'governance' | 'financial' | 'fundraising' | 'safeguarding' | 'general'
}

export interface ComplianceAnswer {
  answer: string
  confidence: number
  sources: Array<{
    title: string
    reference: string
    url?: string
  }>
  related_questions: string[]
  action_items?: string[]
}

// Validation helpers
export function isHighConfidence(confidence: number): boolean {
  return confidence >= 0.8
}

export function requiresManualReview(result: ExtractionResult): boolean {
  return result.confidence < 0.5 || result.requires_review
}

export function getExtractionStatus(result: ExtractionResult): 'auto_approved' | 'needs_review' | 'manual_entry' {
  if (result.confidence >= 0.8 && !result.requires_review) {
    return 'auto_approved'
  }
  if (result.confidence >= 0.5) {
    return 'needs_review'
  }
  return 'manual_entry'
}