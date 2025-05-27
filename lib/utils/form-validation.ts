import { z } from 'zod'
import { toast } from 'sonner'

/**
 * Common validation schemas for reuse across forms
 */
export const commonValidations = {
  // Email validation with enhanced checks
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address')
    .max(320, 'Email address is too long')
    .refine((email) => {
      const domain = email.split('@')[1]
      return domain && domain.includes('.')
    }, 'Please enter a valid email domain'),

  // Name validation
  personName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens and apostrophes'),

  // Phone number validation (UK format)
  phoneNumber: z
    .string()
    .optional()
    .refine((phone) => {
      if (!phone) return true
      // UK phone number regex
      return /^(\+44|0)(7\d{9}|[1-9]\d{8,9})$/.test(phone.replace(/\s/g, ''))
    }, 'Please enter a valid UK phone number'),

  // Currency amount validation
  currency: z
    .number()
    .min(0.01, 'Amount must be greater than 0')
    .max(1000000000, 'Amount is too large')
    .refine((amount) => {
      // Check for reasonable decimal places (max 2)
      return Number.isInteger(amount * 100)
    }, 'Amount can have maximum 2 decimal places'),

  // Date validation helpers
  pastDate: (fieldName: string) => z
    .string()
    .min(1, `${fieldName} is required`)
    .refine((date) => {
      const parsed = new Date(date)
      const now = new Date()
      return parsed <= now
    }, `${fieldName} cannot be in the future`),

  futureDate: (fieldName: string) => z
    .string()
    .min(1, `${fieldName} is required`)
    .refine((date) => {
      const parsed = new Date(date)
      const now = new Date()
      return parsed > now
    }, `${fieldName} must be in the future`),

  // DBS certificate number
  dbsCertificate: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{12}$/.test(val), 'DBS certificate number must be exactly 12 digits'),

  // Charity number validation
  charityNumber: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true
      // UK charity number format: 6-8 digits, optionally followed by hyphen and 1-2 digits
      return /^\d{6,8}(-\d{1,2})?$/.test(val)
    }, 'Please enter a valid UK charity number'),

  // Postcode validation (UK)
  postcode: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true
      // UK postcode regex
      return /^([A-Z]{1,2}[0-9R][0-9A-Z]?\s?[0-9][A-Z]{2})$/i.test(val.trim())
    }, 'Please enter a valid UK postcode'),

  // Notes/description with character limit
  notes: (maxLength: number = 1000) => z
    .string()
    .max(maxLength, `Notes must be less than ${maxLength} characters`)
    .optional(),

  // Required string with length limits
  requiredString: (fieldName: string, minLength: number = 1, maxLength: number = 255) => z
    .string()
    .min(minLength, `${fieldName} must be at least ${minLength} character${minLength > 1 ? 's' : ''}`)
    .max(maxLength, `${fieldName} must be less than ${maxLength} characters`)
}

/**
 * Cross-field validation helpers
 */
export const crossFieldValidations = {
  // Validate that end date is after start date
  dateRange: (startField: string, endField: string) => ({
    superRefine: (data: any, ctx: any) => {
      const startDate = new Date(data[startField])
      const endDate = new Date(data[endField])
      
      if (endDate <= startDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'End date must be after start date',
          path: [endField]
        })
      }
    }
  }),

  // Validate conditional required fields
  conditionalRequired: (triggerField: string, requiredField: string, message: string) => ({
    superRefine: (data: any, ctx: any) => {
      if (data[triggerField] && !data[requiredField]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message,
          path: [requiredField]
        })
      }
    }
  })
}

/**
 * Enhanced error handling for forms
 */
export class FormErrorHandler {
  static handleApiError(error: unknown, fallbackMessage: string = 'An error occurred') {
    console.error('Form submission error:', error)
    
    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('Network')) {
        toast.error('Network error. Please check your connection and try again.')
      } else if (error.message.includes('timeout')) {
        toast.error('Request timed out. Please try again.')
      } else if (error.message.includes('validation')) {
        toast.error('Please check your input and try again.')
      } else if (error.message.includes('permission')) {
        toast.error('You don\'t have permission to perform this action.')
      } else if (error.message.includes('duplicate')) {
        toast.error('This record already exists.')
      } else {
        toast.error(error.message)
      }
    } else {
      toast.error(fallbackMessage)
    }
  }

  static handleValidationErrors(errors: any, setError: any) {
    // Handle server-side validation errors
    if (errors && typeof errors === 'object') {
      Object.entries(errors).forEach(([field, message]) => {
        if (typeof message === 'string') {
          setError(field, { type: 'manual', message })
        }
      })
    }
  }

  static showSuccessMessage(action: 'create' | 'update' | 'delete', entity: string) {
    const messages = {
      create: `${entity} created successfully`,
      update: `${entity} updated successfully`,
      delete: `${entity} deleted successfully`
    }
    toast.success(messages[action])
  }
}

/**
 * Form state management helpers
 */
export class FormStateManager {
  static getLoadingMessage(action: 'create' | 'update' | 'delete'): string {
    const messages = {
      create: 'Creating...',
      update: 'Updating...',
      delete: 'Deleting...'
    }
    return messages[action]
  }

  static getSubmitLabel(isSubmitting: boolean, isEdit: boolean): string {
    if (isSubmitting) {
      return isEdit ? 'Updating...' : 'Creating...'
    }
    return isEdit ? 'Update' : 'Create'
  }
}

/**
 * Custom validation rules for specific business logic
 */
export const businessValidations = {
  // Validate financial year
  financialYear: z
    .number()
    .min(2000, 'Financial year must be 2000 or later')
    .max(new Date().getFullYear() + 1, 'Financial year cannot be more than 1 year in the future'),

  // Validate that DBS expiry is reasonable (not more than 3 years from issue)
  dbsExpiryRange: (issueDate: string, expiryDate: string) => {
    const issue = new Date(issueDate)
    const expiry = new Date(expiryDate)
    const diffYears = (expiry.getTime() - issue.getTime()) / (1000 * 60 * 60 * 24 * 365)
    
    return diffYears <= 3 && diffYears > 0
  },

  // Validate that training date is not too far in the past for active records
  trainingDateRelevance: (trainingDate: string, isActive: boolean) => {
    if (!isActive) return true
    
    const training = new Date(trainingDate)
    const now = new Date()
    const diffYears = (now.getTime() - training.getTime()) / (1000 * 60 * 60 * 24 * 365)
    
    return diffYears <= 5 // Training should be within last 5 years for active records
  }
}

/**
 * Form data transformation helpers
 */
export class FormDataTransformer {
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount)
  }

  static parseCurrency(value: string): number {
    // Remove currency symbols and parse
    const cleaned = value.replace(/[£,$\s]/g, '')
    return parseFloat(cleaned) || 0
  }

  static formatDate(date: Date): string {
    return date.toISOString().split('T')[0]
  }

  static formatPhoneNumber(phone: string): string {
    // Format UK phone number
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('44')) {
      return `+44 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`
    } else if (cleaned.startsWith('0')) {
      return `${cleaned.slice(0, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`
    }
    return phone
  }
}