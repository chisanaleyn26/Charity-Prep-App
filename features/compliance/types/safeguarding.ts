import { z } from 'zod'

// Database types
export interface SafeguardingRecord {
  id: string
  organization_id: string
  person_name: string
  dbs_number: string | null
  issue_date: string | null
  expiry_date: string | null
  dbs_type: 'basic' | 'standard' | 'enhanced' | 'enhanced_barred'
  role: string | null
  department: string | null
  status: 'valid' | 'expired' | 'pending' | null
  created_at: string
  updated_at: string
}

// Form validation schemas
export const dbsRecordSchema = z.object({
  person_name: z.string().min(2, 'Name must be at least 2 characters'),
  dbs_number: z.string().regex(/^\d{12}$/, 'DBS number must be 12 digits').optional().nullable(),
  issue_date: z.string().optional().nullable(),
  expiry_date: z.string().optional().nullable(),
  dbs_type: z.enum(['basic', 'standard', 'enhanced', 'enhanced_barred']),
  role: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
})

export type DBSRecordFormData = z.infer<typeof dbsRecordSchema>

// UI types
export type DBSStatus = 'valid' | 'expiring_soon' | 'expired' | 'pending'

export interface DBSStats {
  total: number
  valid: number
  expiring: number
  expired: number
  pending: number
  complianceRate: number
}

// Helper functions
export function calculateDaysUntilExpiry(expiryDate: string | null): number | null {
  if (!expiryDate) return null
  
  const expiry = new Date(expiryDate)
  const today = new Date()
  const diffTime = expiry.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

export function getDBSStatus(expiryDate: string | null): DBSStatus {
  const days = calculateDaysUntilExpiry(expiryDate)
  
  if (!days) return 'pending'
  if (days < 0) return 'expired'
  if (days <= 30) return 'expiring_soon'
  return 'valid'
}

export function getStatusColor(status: DBSStatus): string {
  switch (status) {
    case 'valid':
      return 'text-success'
    case 'expiring_soon':
      return 'text-warning'
    case 'expired':
      return 'text-error'
    case 'pending':
      return 'text-mist-500'
  }
}

export function getStatusBgColor(status: DBSStatus): string {
  switch (status) {
    case 'valid':
      return 'bg-success/10 text-success-dark border-success/20'
    case 'expiring_soon':
      return 'bg-warning/10 text-warning-dark border-warning/20'
    case 'expired':
      return 'bg-error/10 text-error-dark border-error/20'
    case 'pending':
      return 'bg-mist-100 text-mist-700 border-mist-200'
  }
}