import { Tables } from '@/lib/types/database.types'

// Mock compliance data
export const mockComplianceScore = {
  overall_score: 78,
  category_scores: {
    safeguarding: 65,
    overseas_activities: 90,
    fundraising: 85,
    financial_management: 75,
    governance: 80
  },
  trend: 'up' as const,
  lastUpdated: new Date().toISOString()
}

// Mock dashboard KPIs
export const mockKPIs = {
  complianceScore: 78,
  activeIssues: 4,
  upcomingDeadlines: 3,
  documentsExpiring: 2
}

// Mock activity feed
export const mockActivityFeed = [
  {
    id: '1',
    type: 'document_uploaded',
    title: 'DBS Certificate uploaded',
    description: 'Sarah Johnson\'s DBS certificate has been uploaded',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    user: 'John Doe',
    severity: 'info' as const
  },
  {
    id: '2',
    type: 'compliance_update',
    title: 'Safeguarding score improved',
    description: 'Compliance score increased from 60% to 65%',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    user: 'System',
    severity: 'success' as const
  },
  {
    id: '3',
    type: 'deadline_approaching',
    title: 'Annual Return due soon',
    description: 'Annual Return submission deadline in 14 days',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    user: 'System',
    severity: 'warning' as const
  },
  {
    id: '4',
    type: 'overseas_activity',
    title: 'New overseas transfer recorded',
    description: '£5,000 transferred to Kenya Water Project',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    user: 'Jane Smith',
    severity: 'info' as const
  }
]

// Mock compliance trend data (for chart)
export const mockComplianceTrend = [
  { date: '2024-01', score: 65 },
  { date: '2024-02', score: 68 },
  { date: '2024-03', score: 70 },
  { date: '2024-04', score: 72 },
  { date: '2024-05', score: 75 },
  { date: '2024-06', score: 78 }
]

// Mock urgent actions
export const mockUrgentActions = [
  {
    id: '1',
    title: 'DBS Check Expiring',
    description: '3 staff members have DBS checks expiring within 30 days',
    category: 'safeguarding',
    severity: 'high' as const,
    dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days from now
    link: '/compliance/safeguarding'
  },
  {
    id: '2',
    title: 'Annual Return Submission',
    description: 'Annual Return must be submitted to Charity Commission',
    category: 'governance',
    severity: 'medium' as const,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    link: '/reports/annual-return'
  },
  {
    id: '3',
    title: 'Overseas Activity Report',
    description: 'Quarterly overseas activity report due',
    category: 'overseas',
    severity: 'medium' as const,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    link: '/compliance/overseas-activities'
  }
]

// Mock safeguarding records
export const mockSafeguardingRecords: Tables<'safeguarding_records'>[] = [
  {
    id: '1',
    organization_id: 'mock-org-123',
    person_name: 'Sarah Johnson',
    role: 'Youth Worker',
    dbs_required: true,
    dbs_check_date: '2023-06-15',
    dbs_certificate_number: 'DBS123456789',
    dbs_update_service: true,
    training_required: true,
    training_completed: true,
    training_date: '2023-07-20',
    expiry_date: '2024-06-15',
    notes: 'Level 2 safeguarding training completed',
    created_at: '2023-06-15T10:00:00Z',
    updated_at: '2024-01-15T14:30:00Z'
  },
  {
    id: '2',
    organization_id: 'mock-org-123',
    person_name: 'Michael Chen',
    role: 'Volunteer Coordinator',
    dbs_required: true,
    dbs_check_date: '2023-04-10',
    dbs_certificate_number: 'DBS987654321',
    dbs_update_service: false,
    training_required: true,
    training_completed: true,
    training_date: '2023-05-15',
    expiry_date: '2024-04-10',
    notes: 'Renewal due soon',
    created_at: '2023-04-10T09:00:00Z',
    updated_at: '2024-01-10T11:00:00Z'
  },
  {
    id: '3',
    organization_id: 'mock-org-123',
    person_name: 'Emma Williams',
    role: 'Trustee',
    dbs_required: false,
    dbs_check_date: null,
    dbs_certificate_number: null,
    dbs_update_service: false,
    training_required: true,
    training_completed: false,
    training_date: null,
    expiry_date: null,
    notes: 'Training scheduled for next month',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z'
  }
]

// Mock overseas activities
export const mockOverseasActivities: Tables<'overseas_activities'>[] = [
  {
    id: '1',
    organization_id: 'mock-org-123',
    activity_name: 'Kenya Water Project',
    activity_type: 'development',
    country_code: 'KE',
    partner_id: null,
    amount: 15000,
    currency: 'GBP',
    amount_gbp: 15000,
    exchange_rate: 1.0,
    transfer_method: 'bank_transfer',
    transfer_date: '2024-01-15',
    transfer_reference: 'TXN-KE-2024-001',
    financial_year: 2024,
    quarter: 1,
    beneficiaries_count: 500,
    project_code: 'KE-WATER-001',
    description: 'Water well construction project in rural Kenya',
    sanctions_check_completed: true,
    requires_reporting: true,
    reported_to_commission: true,
    receipt_document_id: null,
    created_by: 'mock-user-123',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-15T14:00:00Z',
    deleted_at: null
  },
  {
    id: '2',
    organization_id: 'mock-org-123',
    activity_name: 'Mumbai Education Program',
    activity_type: 'education',
    country_code: 'IN',
    partner_id: null,
    amount: 8500,
    currency: 'GBP',
    amount_gbp: 8500,
    exchange_rate: 1.0,
    transfer_method: 'wire_transfer',
    transfer_date: '2024-02-01',
    transfer_reference: 'TXN-IN-2024-001',
    financial_year: 2024,
    quarter: 1,
    beneficiaries_count: 200,
    project_code: 'IN-EDU-001',
    description: 'Education support program in Mumbai slums',
    sanctions_check_completed: true,
    requires_reporting: true,
    reported_to_commission: false,
    receipt_document_id: null,
    created_by: 'mock-user-123',
    created_at: '2024-01-25T11:00:00Z',
    updated_at: '2024-02-01T15:30:00Z',
    deleted_at: null
  }
]

// Mock fundraising activities
export const mockFundraisingActivities: Tables<'fundraising_activities'>[] = [
  {
    id: '1',
    organization_id: 'mock-org-123',
    activity_type: 'online_campaign',
    campaign_name: 'Spring Appeal 2024',
    start_date: '2024-03-01',
    end_date: '2024-04-30',
    target_amount: 25000,
    amount_raised: 18750,
    platform: 'JustGiving',
    requires_license: false,
    license_obtained: false,
    compliant_with_code: true,
    donor_data_protected: true,
    marketing_materials_approved: true,
    notes: '75% of target achieved so far',
    created_at: '2024-02-15T10:00:00Z',
    updated_at: '2024-03-20T16:00:00Z'
  },
  {
    id: '2',
    organization_id: 'mock-org-123',
    activity_type: 'event',
    campaign_name: 'Annual Charity Gala',
    start_date: '2024-06-15',
    end_date: '2024-06-15',
    target_amount: 50000,
    amount_raised: 0,
    platform: null,
    requires_license: true,
    license_obtained: true,
    compliant_with_code: true,
    donor_data_protected: true,
    marketing_materials_approved: false,
    notes: 'Venue booked, marketing materials under review',
    created_at: '2024-01-30T09:00:00Z',
    updated_at: '2024-03-15T14:00:00Z'
  }
]

// Mock documents
export const mockDocuments: Tables<'documents'>[] = [
  {
    id: '1',
    organization_id: 'mock-org-123',
    file_name: 'Safeguarding_Policy_2024.pdf',
    file_type: 'application/pdf',
    file_size: 245000,
    storage_path: 'mock-org-123/policies/safeguarding_2024.pdf',
    document_type: 'policy',
    category: 'safeguarding',
    description: 'Updated safeguarding policy for 2024',
    tags: ['policy', 'safeguarding', '2024'],
    expiry_date: '2025-01-01',
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-01-05T10:00:00Z',
    uploaded_by: 'mock-user-123'
  },
  {
    id: '2',
    organization_id: 'mock-org-123',
    file_name: 'Annual_Accounts_2023.pdf',
    file_type: 'application/pdf',
    file_size: 1250000,
    storage_path: 'mock-org-123/financial/annual_accounts_2023.pdf',
    document_type: 'financial_report',
    category: 'financial',
    description: 'Audited annual accounts for 2023',
    tags: ['accounts', 'financial', '2023', 'audited'],
    expiry_date: null,
    created_at: '2023-12-20T14:00:00Z',
    updated_at: '2023-12-20T14:00:00Z',
    uploaded_by: 'mock-user-123'
  },
  {
    id: '3',
    organization_id: 'mock-org-123',
    file_name: 'Insurance_Certificate_2024.pdf',
    file_type: 'application/pdf',
    file_size: 180000,
    storage_path: 'mock-org-123/certificates/insurance_2024.pdf',
    document_type: 'certificate',
    category: 'governance',
    description: 'Public liability insurance certificate',
    tags: ['insurance', 'certificate', '2024'],
    expiry_date: '2024-12-31',
    created_at: '2024-01-10T11:00:00Z',
    updated_at: '2024-01-10T11:00:00Z',
    uploaded_by: 'mock-user-123'
  }
]

// Mock risk radar data
export const mockRiskRadarData = [
  { category: 'Safeguarding', risk: 35, fullMark: 100 },
  { category: 'Financial', risk: 25, fullMark: 100 },
  { category: 'Governance', risk: 20, fullMark: 100 },
  { category: 'Overseas', risk: 10, fullMark: 100 },
  { category: 'Fundraising', risk: 15, fullMark: 100 },
  { category: 'Data Protection', risk: 30, fullMark: 100 }
]

// Mock notifications
export const mockNotifications = [
  {
    id: '1',
    type: 'dbs_expiry',
    title: 'DBS Check Expiring Soon',
    message: 'Sarah Johnson\'s DBS check expires in 30 days',
    link: '/compliance/safeguarding',
    severity: 'warning' as const,
    read: false,
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    type: 'document_uploaded',
    title: 'New Document Uploaded',
    message: 'Trustee meeting minutes have been uploaded',
    link: '/documents',
    severity: 'info' as const,
    read: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    type: 'compliance_improvement',
    title: 'Compliance Score Improved',
    message: 'Your overall compliance score has increased to 78%',
    link: '/compliance/score',
    severity: 'success' as const,
    read: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    type: 'annual_return',
    title: 'Annual Return Reminder',
    message: 'Annual Return due in 14 days',
    link: '/reports/annual-return',
    severity: 'warning' as const,
    read: false,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '5',
    type: 'system',
    title: 'System Maintenance',
    message: 'Scheduled maintenance on Sunday 2am-4am GMT',
    link: null,
    severity: 'info' as const,
    read: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
]