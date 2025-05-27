export interface Document {
  id: string
  organization_id: string
  file_name: string
  file_size: number
  mime_type: string
  storage_path: string
  document_type: 'policy' | 'certificate' | 'report' | 'form' | 'other'
  category?: string
  description?: string
  tags?: string[]
  uploaded_by?: string
  expires_at?: string
  is_public: boolean
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface DocumentStats {
  totalDocuments: number
  expiringSoon: number
  totalSizeBytes: number
  categoriesCount: number
  documentsByType: Record<string, number>
}

export interface CreateDocumentInput {
  file_name: string
  file_size: number
  mime_type: string
  storage_path: string
  document_type: 'policy' | 'certificate' | 'report' | 'form' | 'other'
  category?: string
  description?: string
  tags?: string[]
  expires_at?: string
  is_public?: boolean
  metadata?: Record<string, any>
  extracted_data?: Record<string, any>
}

export interface UpdateDocumentInput {
  id: string
  file_name?: string
  document_type?: 'policy' | 'certificate' | 'report' | 'form' | 'other'
  category?: string
  description?: string
  tags?: string[]
  expires_at?: string
  is_public?: boolean
  metadata?: Record<string, any>
}

export interface DocumentFilters {
  document_type?: string
  category?: string
  search?: string
  expired?: boolean
  expires_within_days?: number
}