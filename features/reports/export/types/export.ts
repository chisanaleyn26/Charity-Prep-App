import { z } from 'zod'

// Export data sources
export type DataSourceType = 
  | 'compliance-scores'
  | 'fundraising-events'
  | 'safeguarding-incidents'
  | 'overseas-activities'
  | 'income-sources'
  | 'documents'
  | 'annual-return'
  | 'board-pack'
  | 'all-data'

// Export formats
export type ExportFormat = 'csv' | 'excel' | 'json' | 'pdf' | 'xml'

// Export configuration
export interface ExportConfig {
  id: string
  name: string
  description: string
  dataSource: DataSourceType
  format: ExportFormat
  filters?: ExportFilters
  columns?: ExportColumn[]
  schedule?: ExportSchedule
  recipients?: string[]
  createdAt: Date
  updatedAt: Date
}

// Export filters
export interface ExportFilters {
  dateRange?: {
    start: Date
    end: Date
  }
  status?: string[]
  categories?: string[]
  customFilters?: Record<string, any>
}

// Export columns configuration
export interface ExportColumn {
  field: string
  label: string
  type: 'string' | 'number' | 'date' | 'boolean'
  format?: string
  transform?: 'uppercase' | 'lowercase' | 'capitalize' | 'currency' | 'percentage'
  width?: number
  visible: boolean
  order: number
}

// Export schedule
export interface ExportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  dayOfWeek?: number // 0-6 for weekly
  dayOfMonth?: number // 1-31 for monthly
  time?: string // HH:MM format
  timezone: string
  enabled: boolean
  lastRun?: Date
  nextRun?: Date
}

// Export job
export interface ExportJob {
  id: string
  configId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  totalRows?: number
  processedRows?: number
  fileUrl?: string
  fileName?: string
  fileSize?: number
  error?: string
  startedAt: Date
  completedAt?: Date
}

// Data source metadata
export interface DataSourceMetadata {
  type: DataSourceType
  name: string
  description: string
  icon: string
  availableFormats: ExportFormat[]
  defaultColumns: ExportColumn[]
  supportedFilters: {
    field: string
    label: string
    type: 'date' | 'select' | 'multiselect' | 'text' | 'number'
    options?: { value: string; label: string }[]
  }[]
}

// Export templates
export interface ExportTemplate {
  id: string
  name: string
  description: string
  dataSource: DataSourceType
  format: ExportFormat
  config: Partial<ExportConfig>
  isPublic: boolean
  createdBy: string
  createdAt: Date
}

// Zod schemas
export const ExportFilterSchema = z.object({
  dateRange: z.object({
    start: z.date(),
    end: z.date()
  }).optional(),
  status: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  customFilters: z.record(z.any()).optional()
})

export const ExportColumnSchema = z.object({
  field: z.string(),
  label: z.string(),
  type: z.enum(['string', 'number', 'date', 'boolean']),
  format: z.string().optional(),
  transform: z.enum(['uppercase', 'lowercase', 'capitalize', 'currency', 'percentage']).optional(),
  width: z.number().optional(),
  visible: z.boolean(),
  order: z.number()
})

export const ExportScheduleSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly']),
  dayOfWeek: z.number().min(0).max(6).optional(),
  dayOfMonth: z.number().min(1).max(31).optional(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  timezone: z.string(),
  enabled: z.boolean()
})

export const ExportConfigSchema = z.object({
  name: z.string().min(1, 'Export name is required'),
  description: z.string(),
  dataSource: z.enum([
    'compliance-scores',
    'fundraising-events',
    'safeguarding-incidents',
    'overseas-activities',
    'income-sources',
    'documents',
    'annual-return',
    'board-pack',
    'all-data'
  ]),
  format: z.enum(['csv', 'excel', 'json', 'pdf', 'xml']),
  filters: ExportFilterSchema.optional(),
  columns: z.array(ExportColumnSchema).optional(),
  schedule: ExportScheduleSchema.optional(),
  recipients: z.array(z.string().email()).optional()
})

// Default export templates
export const DEFAULT_EXPORT_TEMPLATES: ExportTemplate[] = [
  {
    id: 'compliance-summary',
    name: 'Compliance Summary Report',
    description: 'Monthly compliance scores and trends',
    dataSource: 'compliance-scores',
    format: 'excel',
    config: {
      filters: {
        dateRange: {
          start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
          end: new Date()
        }
      }
    },
    isPublic: true,
    createdBy: 'system',
    createdAt: new Date()
  },
  {
    id: 'fundraising-quarterly',
    name: 'Quarterly Fundraising Report',
    description: 'All fundraising events and income for the quarter',
    dataSource: 'fundraising-events',
    format: 'csv',
    config: {
      filters: {
        dateRange: {
          start: new Date(new Date().setMonth(new Date().getMonth() - 3)),
          end: new Date()
        }
      }
    },
    isPublic: true,
    createdBy: 'system',
    createdAt: new Date()
  },
  {
    id: 'annual-data-export',
    name: 'Annual Data Export',
    description: 'Complete data export for annual reporting',
    dataSource: 'all-data',
    format: 'excel',
    config: {
      filters: {
        dateRange: {
          start: new Date(new Date().getFullYear(), 0, 1),
          end: new Date(new Date().getFullYear(), 11, 31)
        }
      }
    },
    isPublic: true,
    createdBy: 'system',
    createdAt: new Date()
  }
]

// Data source configurations
export const DATA_SOURCE_METADATA: Record<DataSourceType, DataSourceMetadata> = {
  'compliance-scores': {
    type: 'compliance-scores',
    name: 'Compliance Scores',
    description: 'Export compliance scores and category breakdowns',
    icon: 'Shield',
    availableFormats: ['csv', 'excel', 'json', 'pdf'],
    defaultColumns: [
      { field: 'date', label: 'Date', type: 'date', visible: true, order: 1 },
      { field: 'overall_score', label: 'Overall Score', type: 'number', visible: true, order: 2 },
      { field: 'fundraising_score', label: 'Fundraising', type: 'number', visible: true, order: 3 },
      { field: 'safeguarding_score', label: 'Safeguarding', type: 'number', visible: true, order: 4 },
      { field: 'overseas_score', label: 'Overseas', type: 'number', visible: true, order: 5 }
    ],
    supportedFilters: [
      { field: 'dateRange', label: 'Date Range', type: 'date' }
    ]
  },
  'fundraising-events': {
    type: 'fundraising-events',
    name: 'Fundraising Events',
    description: 'Export fundraising events and income data',
    icon: 'DollarSign',
    availableFormats: ['csv', 'excel', 'json', 'pdf'],
    defaultColumns: [
      { field: 'event_name', label: 'Event Name', type: 'string', visible: true, order: 1 },
      { field: 'event_date', label: 'Date', type: 'date', visible: true, order: 2 },
      { field: 'event_type', label: 'Type', type: 'string', visible: true, order: 3 },
      { field: 'amount_raised', label: 'Amount Raised', type: 'number', transform: 'currency', visible: true, order: 4 },
      { field: 'expected_participants', label: 'Participants', type: 'number', visible: true, order: 5 }
    ],
    supportedFilters: [
      { field: 'dateRange', label: 'Date Range', type: 'date' },
      { field: 'event_type', label: 'Event Type', type: 'multiselect', options: [
        { value: 'gala', label: 'Gala' },
        { value: 'auction', label: 'Auction' },
        { value: 'sponsored', label: 'Sponsored Event' },
        { value: 'online', label: 'Online Campaign' }
      ]}
    ]
  },
  'safeguarding-incidents': {
    type: 'safeguarding-incidents',
    name: 'Safeguarding Records',
    description: 'Export safeguarding incidents and compliance data',
    icon: 'Shield',
    availableFormats: ['excel', 'pdf'], // Limited formats for sensitive data
    defaultColumns: [
      { field: 'incident_date', label: 'Date', type: 'date', visible: true, order: 1 },
      { field: 'incident_type', label: 'Type', type: 'string', visible: true, order: 2 },
      { field: 'severity', label: 'Severity', type: 'string', visible: true, order: 3 },
      { field: 'status', label: 'Status', type: 'string', visible: true, order: 4 }
    ],
    supportedFilters: [
      { field: 'dateRange', label: 'Date Range', type: 'date' },
      { field: 'status', label: 'Status', type: 'select', options: [
        { value: 'open', label: 'Open' },
        { value: 'investigating', label: 'Investigating' },
        { value: 'resolved', label: 'Resolved' },
        { value: 'closed', label: 'Closed' }
      ]}
    ]
  },
  'overseas-activities': {
    type: 'overseas-activities',
    name: 'Overseas Activities',
    description: 'Export international operations and compliance data',
    icon: 'Globe',
    availableFormats: ['csv', 'excel', 'json', 'pdf'],
    defaultColumns: [
      { field: 'country', label: 'Country', type: 'string', visible: true, order: 1 },
      { field: 'activity_type', label: 'Activity Type', type: 'string', visible: true, order: 2 },
      { field: 'expenditure', label: 'Expenditure', type: 'number', transform: 'currency', visible: true, order: 3 },
      { field: 'beneficiaries', label: 'Beneficiaries', type: 'number', visible: true, order: 4 },
      { field: 'risk_assessment', label: 'Risk Level', type: 'string', visible: true, order: 5 }
    ],
    supportedFilters: [
      { field: 'country', label: 'Country', type: 'multiselect' },
      { field: 'activity_type', label: 'Activity Type', type: 'multiselect' }
    ]
  },
  'income-sources': {
    type: 'income-sources',
    name: 'Income Sources',
    description: 'Export income data by source and date',
    icon: 'TrendingUp',
    availableFormats: ['csv', 'excel', 'json', 'pdf'],
    defaultColumns: [
      { field: 'date', label: 'Date', type: 'date', visible: true, order: 1 },
      { field: 'source', label: 'Source', type: 'string', visible: true, order: 2 },
      { field: 'amount', label: 'Amount', type: 'number', transform: 'currency', visible: true, order: 3 },
      { field: 'reference', label: 'Reference', type: 'string', visible: true, order: 4 }
    ],
    supportedFilters: [
      { field: 'dateRange', label: 'Date Range', type: 'date' },
      { field: 'source', label: 'Income Source', type: 'multiselect', options: [
        { value: 'donations', label: 'Donations' },
        { value: 'grants', label: 'Grants' },
        { value: 'events', label: 'Events' },
        { value: 'investments', label: 'Investments' }
      ]}
    ]
  },
  'documents': {
    type: 'documents',
    name: 'Documents',
    description: 'Export document metadata and compliance status',
    icon: 'FileText',
    availableFormats: ['csv', 'excel', 'json'],
    defaultColumns: [
      { field: 'name', label: 'Document Name', type: 'string', visible: true, order: 1 },
      { field: 'type', label: 'Type', type: 'string', visible: true, order: 2 },
      { field: 'uploaded_at', label: 'Upload Date', type: 'date', visible: true, order: 3 },
      { field: 'category', label: 'Category', type: 'string', visible: true, order: 4 },
      { field: 'status', label: 'Status', type: 'string', visible: true, order: 5 }
    ],
    supportedFilters: [
      { field: 'dateRange', label: 'Upload Date', type: 'date' },
      { field: 'type', label: 'Document Type', type: 'multiselect' },
      { field: 'category', label: 'Category', type: 'multiselect' }
    ]
  },
  'annual-return': {
    type: 'annual-return',
    name: 'Annual Return Data',
    description: 'Export data formatted for Annual Return submission',
    icon: 'FileSpreadsheet',
    availableFormats: ['excel', 'pdf'],
    defaultColumns: [],
    supportedFilters: [
      { field: 'year', label: 'Financial Year', type: 'select' }
    ]
  },
  'board-pack': {
    type: 'board-pack',
    name: 'Board Pack',
    description: 'Export board pack sections and reports',
    icon: 'Presentation',
    availableFormats: ['pdf', 'excel'],
    defaultColumns: [],
    supportedFilters: [
      { field: 'dateRange', label: 'Report Period', type: 'date' }
    ]
  },
  'all-data': {
    type: 'all-data',
    name: 'Complete Data Export',
    description: 'Export all charity data for backup or migration',
    icon: 'Database',
    availableFormats: ['excel', 'json'],
    defaultColumns: [],
    supportedFilters: [
      { field: 'dateRange', label: 'Date Range', type: 'date' }
    ]
  }
}