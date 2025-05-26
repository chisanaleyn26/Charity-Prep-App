// AI-related types for the database
// These should be included in database.types.ts but are missing

export interface AITask {
  id: string
  organization_id: string
  task_type: 'extract_document' | 'generate_narrative' | 'import_csv' | 'document_ocr' | 'extract'
  priority: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  retry_count: number
  max_retries: number
  input_data: any
  output_data?: any
  error_message?: string
  error_details?: any
  model_used?: string
  tokens_used?: number
  cost_pennies?: number
  created_at: string
  started_at?: string
  completed_at?: string
  requested_by?: string
}

export interface ImportHistory {
  id: string
  organization_id: string
  import_type: 'csv' | 'email' | 'api'
  filename?: string
  source_email?: string
  record_count: number
  success_count: number
  error_count: number
  errors?: any
  mapping_used?: any
  created_at: string
  created_by: string
}

// Extend the Database interface to include AI tables
declare module './database.types' {
  interface Database {
    public: {
      Tables: Database['public']['Tables'] & {
        ai_tasks: {
          Row: AITask
          Insert: Partial<AITask> & Pick<AITask, 'organization_id' | 'task_type' | 'input_data'>
          Update: Partial<AITask>
          Relationships: []
        }
        import_history: {
          Row: ImportHistory
          Insert: Partial<ImportHistory> & Pick<ImportHistory, 'organization_id' | 'import_type' | 'record_count' | 'success_count' | 'error_count' | 'created_by'>
          Update: Partial<ImportHistory>
          Relationships: []
        }
      }
    }
  }
}