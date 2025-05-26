export type SafeguardingRoleType = 'employee' | 'volunteer' | 'trustee' | 'contractor'
export type DBSCheckType = 'basic' | 'standard' | 'enhanced' | 'enhanced_barred'

export interface SafeguardingRecord {
  id: string
  organization_id: string
  person_name: string
  role_title: string
  role_type: SafeguardingRoleType
  department: string | null
  dbs_certificate_number: string | null
  dbs_check_type: DBSCheckType
  issue_date: Date
  expiry_date: Date
  reference_checks_completed: boolean | null
  training_completed: boolean | null
  training_date: Date | null
  works_with_children: boolean | null
  works_with_vulnerable_adults: boolean | null
  unsupervised_access: boolean | null
  certificate_document_id: string | null
  is_active: boolean | null
  notes: string | null
  created_at: Date
  updated_at: Date
  created_by: string | null
  updated_by: string | null
  deleted_at: Date | null
}

export interface CreateSafeguardingRecordInput {
  person_name: string
  role_title: string
  role_type: SafeguardingRoleType
  department?: string | null
  dbs_certificate_number?: string | null
  dbs_check_type: DBSCheckType
  issue_date: Date
  expiry_date: Date
  reference_checks_completed?: boolean | null
  training_completed?: boolean | null
  training_date?: Date | null
  works_with_children?: boolean | null
  works_with_vulnerable_adults?: boolean | null
  unsupervised_access?: boolean | null
  certificate_document_id?: string | null
  is_active?: boolean | null
  notes?: string | null
}

export interface UpdateSafeguardingRecordInput extends Partial<CreateSafeguardingRecordInput> {
  id: string
}