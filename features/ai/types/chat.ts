/**
 * TypeScript types for the AI Compliance Chat system
 * Comprehensive type definitions for chat functionality
 */

// Core chat message interface
export interface ChatMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata: ChatMessageMetadata
  parent_message_id?: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

// Metadata that can be attached to chat messages
export interface ChatMessageMetadata {
  // AI response metadata
  model_used?: string
  tokens_used?: number
  response_time_ms?: number
  confidence_score?: number
  
  // Sources and references
  sources?: ComplianceSource[]
  
  // Error information
  error_type?: 'rate_limit' | 'api_error' | 'validation_error'
  error_message?: string
  retry_count?: number
  
  // User interaction metadata
  user_agent?: string
  session_id?: string
}

// Chat conversation interface
export interface ChatConversation {
  id: string
  organization_id: string
  user_id: string
  title: string
  summary?: string
  last_message_at: string
  message_count: number
  created_at: string
  updated_at: string
  deleted_at?: string
}

// Sources that can be referenced in responses
export interface ComplianceSource {
  type: 'regulation' | 'guidance' | 'internal_data' | 'case_study'
  title: string
  reference?: string
  url?: string
  section?: string
  confidence?: number
  relevance_score?: number
}

// Context about the user's charity for personalized responses
export interface ChatContext {
  organization_id: string
  organization_name?: string
  charity_number?: string
  organization_type?: string
  income_band?: 'small' | 'medium' | 'large'
  annual_income?: number
  
  // Compliance-specific context
  works_with_children?: boolean
  works_with_vulnerable_adults?: boolean
  has_overseas_activities?: boolean
  is_fundraising_charity?: boolean
  registration_date?: string
  year_end_date?: string
  
  // Current compliance status
  compliance_score?: number
  urgent_actions?: string[]
  upcoming_deadlines?: ComplianceDeadline[]
}

// Compliance deadlines and alerts
export interface ComplianceDeadline {
  type: 'annual_return' | 'accounts' | 'dbs_renewal' | 'policy_review'
  title: string
  description: string
  due_date: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  action_required?: string
}

// AI response cache entry
export interface AiResponseCache {
  id: string
  question_hash: string
  question_text: string
  context_hash?: string
  context_data?: Partial<ChatContext>
  response_content: string
  response_metadata: ChatMessageMetadata
  hit_count: number
  last_accessed_at: string
  expires_at: string
  created_at: string
  updated_at: string
}

// Suggested questions for users
export interface SuggestedQuestion {
  id: string
  text: string
  category: 'dbs' | 'fundraising' | 'overseas' | 'reporting' | 'safeguarding' | 'general'
  relevance_conditions?: {
    requires_children_work?: boolean
    requires_overseas?: boolean
    income_threshold?: number
  }
  priority: number
}

// Chat UI state
export interface ChatUIState {
  isLoading: boolean
  isTyping: boolean
  error: string | null
  currentConversationId: string | null
  showSuggestions: boolean
  sidebarCollapsed: boolean
}

// API request/response types
export interface ChatRequest {
  message: string
  conversation_id?: string
  context?: Partial<ChatContext>
  use_cache?: boolean
}

export interface ChatResponse {
  success: boolean
  message?: ChatMessage
  conversation_id?: string
  cached?: boolean
  error?: {
    code: string
    message: string
    retry_after?: number
  }
  metadata?: {
    response_time_ms: number
    tokens_used: number
    cache_hit: boolean
  }
}

// Error types for better error handling
export type ChatErrorType = 
  | 'RATE_LIMITED'
  | 'API_ERROR' 
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'CACHE_ERROR'
  | 'DATABASE_ERROR'

export interface ChatError {
  type: ChatErrorType
  message: string
  code?: string
  retry_after?: number
  details?: Record<string, any>
}

// Compliance alerts for sidebar
export interface ComplianceAlert {
  id: string
  type: 'info' | 'warning' | 'deadline' | 'urgent'
  category: 'dbs' | 'fundraising' | 'overseas' | 'reporting' | 'safeguarding'
  title: string
  message: string
  action_text?: string
  action_url?: string
  due_date?: string
  dismissible: boolean
  created_at: string
}

// Related guidance for sidebar
export interface RelatedGuidance {
  id: string
  title: string
  summary: string
  category: string
  url?: string
  official_source: boolean
  last_updated?: string
  relevance_score: number
}

// Hook return types
export interface UseChatReturn {
  // State
  messages: ChatMessage[]
  isLoading: boolean
  error: ChatError | null
  currentConversation: ChatConversation | null
  
  // Actions
  sendMessage: (message: string) => Promise<void>
  startNewConversation: () => Promise<void>
  loadConversation: (conversationId: string) => Promise<void>
  deleteConversation: (conversationId: string) => Promise<void>
  retryLastMessage: () => Promise<void>
  clearError: () => void
}

export interface UseChatHistoryReturn {
  conversations: ChatConversation[]
  isLoading: boolean
  error: string | null
  loadConversations: () => Promise<void>
  searchConversations: (query: string) => ChatConversation[]
}

// Configuration types
export interface ChatConfig {
  ai_model: string
  max_tokens: number
  temperature: number
  max_history_messages: number
  cache_ttl_hours: number
  rate_limit_requests_per_minute: number
  retry_attempts: number
  retry_delay_base_ms: number
}