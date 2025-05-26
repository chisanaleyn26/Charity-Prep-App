// Application constants

export const APP_NAME = 'Charity Prep'
export const APP_DESCRIPTION = 'Compliance management for UK charities'
export const SUPPORT_EMAIL = 'support@charityprep.uk'

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  essentials: {
    name: 'Essentials',
    price: 9,
    features: [
      'Up to 10 team members',
      'Basic compliance tracking',
      'Email support',
      'Monthly reports'
    ],
    limits: {
      users: 10,
      storage: 1024 * 1024 * 1024, // 1GB
      documents: 100
    }
  },
  standard: {
    name: 'Standard',
    price: 29,
    features: [
      'Up to 50 team members',
      'Advanced compliance features',
      'Priority support',
      'Weekly reports',
      'API access'
    ],
    limits: {
      users: 50,
      storage: 5 * 1024 * 1024 * 1024, // 5GB
      documents: 1000
    }
  },
  premium: {
    name: 'Premium',
    price: 79,
    features: [
      'Unlimited team members',
      'All features included',
      'Dedicated support',
      'Custom reports',
      'Multi-charity management',
      'White-label options'
    ],
    limits: {
      users: -1, // unlimited
      storage: 50 * 1024 * 1024 * 1024, // 50GB
      documents: -1 // unlimited
    }
  }
} as const

// Compliance thresholds
export const COMPLIANCE_THRESHOLDS = {
  dbs: {
    expiryWarningDays: 30,
    expiryUrgentDays: 7
  },
  overseas: {
    highRiskReportingDays: 30,
    sanctionsCheckDays: 90
  },
  income: {
    majorDonorThreshold: 5000,
    relatedPartyThreshold: 1000
  }
} as const

// File upload limits
export const FILE_UPLOAD = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.csv', '.xls', '.xlsx']
} as const

// Annual Return field mappings
export const ANNUAL_RETURN_FIELDS = {
  safeguarding: {
    'A1': 'Total staff with valid DBS checks',
    'A2': 'Total volunteers with valid DBS checks',
    'A3': 'Safeguarding policy last updated',
    'A4': 'Safeguarding training completion rate'
  },
  overseas: {
    'B1': 'Total countries operated in',
    'B2': 'Total overseas expenditure (GBP)',
    'B3': 'High-risk country activities',
    'B4': 'Due diligence completed'
  },
  income: {
    'C1': 'Total donations received',
    'C2': 'Gift Aid claimed',
    'C3': 'Restricted funds',
    'C4': 'Related party transactions'
  }
} as const

// Compliance score weights
export const COMPLIANCE_WEIGHTS = {
  safeguarding: 0.4,
  overseas: 0.3,
  income: 0.3
} as const

// Risk levels
export const RISK_LEVELS = {
  low: { label: 'Low Risk', color: 'success' },
  medium: { label: 'Medium Risk', color: 'warning' },
  high: { label: 'High Risk', color: 'error' }
} as const