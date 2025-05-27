/**
 * Custom hook for managing AI compliance chat functionality
 * Provides complete chat state management with optimistic updates
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import type { 
  ChatMessage, 
  ChatConversation, 
  ChatContext, 
  ChatError, 
  ChatResponse,
  UseChatReturn 
} from '../types/chat'

interface UseComplianceChatOptions {
  context?: Partial<ChatContext>
  autoLoadHistory?: boolean
  maxRetries?: number
}

export function useComplianceChat(options: UseComplianceChatOptions = {}): UseChatReturn {
  const { context: providedContext, autoLoadHistory = true, maxRetries = 3 } = options
  
  // State
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ChatError | null>(null)
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null)
  const [context, setContext] = useState<Partial<ChatContext>>(providedContext || {})
  
  // Refs for managing state
  const retryCount = useRef(0)
  const lastMessage = useRef<string>('')
  const abortController = useRef<AbortController | null>(null)
  
  // Clear error
  const clearError = useCallback(() => {
    setError(null)
    retryCount.current = 0
  }, [])
  
  // Load conversation history
  const loadConversation = useCallback(async (conversationId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`/api/ai/compliance-assistant?conversation_id=${conversationId}`)
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to load conversation')
      }
      
      setMessages(data.messages || [])
      setCurrentConversation({ id: conversationId } as ChatConversation)
    } catch (err) {
      const error: ChatError = {
        type: 'DATABASE_ERROR',
        message: err instanceof Error ? err.message : 'Failed to load conversation'
      }
      setError(error)
      toast.error('Failed to load conversation history')
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  // Send message with optimistic update
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return
    
    // Cancel any existing request
    if (abortController.current) {
      abortController.current.abort()
    }
    abortController.current = new AbortController()
    
    const userMessageId = `temp-${Date.now()}-${Math.random()}`
    const optimisticUserMessage: ChatMessage = {
      id: userMessageId,
      conversation_id: currentConversation?.id || '',
      role: 'user',
      content: message.trim(),
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // Optimistic update - add user message immediately
    setMessages(prev => [...prev, optimisticUserMessage])
    setIsLoading(true)
    setError(null)
    lastMessage.current = message
    
    try {
      const requestBody = {
        message: message.trim(),
        conversation_id: currentConversation?.id,
        context,
        use_cache: true
      }
      
      const response = await fetch('/api/ai/compliance-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': crypto.randomUUID?.() || Math.random().toString(36)
        },
        body: JSON.stringify(requestBody),
        signal: abortController.current.signal
      })
      
      const data: ChatResponse = await response.json()
      
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to get AI response')
      }
      
      // Update conversation ID if we got a new one
      if (data.conversation_id && !currentConversation?.id) {
        setCurrentConversation({ id: data.conversation_id } as ChatConversation)
      }
      
      // Replace optimistic message with real one and add AI response
      setMessages(prev => {
        const withoutOptimistic = prev.filter(msg => msg.id !== userMessageId)
        const realUserMessage: ChatMessage = {
          ...optimisticUserMessage,
          id: `user-${Date.now()}`,
          conversation_id: data.conversation_id || optimisticUserMessage.conversation_id
        }
        
        return data.message 
          ? [...withoutOptimistic, realUserMessage, data.message]
          : [...withoutOptimistic, realUserMessage]
      })
      
      // Show cache hit notification if enabled
      if (data.cached && data.metadata?.cache_hit) {
        toast.success('Response retrieved from cache', { duration: 2000 })
      }
      
      // Reset retry count on success
      retryCount.current = 0
      
    } catch (err) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== userMessageId))
      
      // Handle specific error types
      let chatError: ChatError
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          return // Request was cancelled, don't show error
        }
        
        if (err.message.includes('rate limit') || err.message.includes('429')) {
          chatError = {
            type: 'RATE_LIMITED',
            message: 'Too many requests. Please wait a moment before trying again.',
            retry_after: 60
          }
        } else if (err.message.includes('network') || err.message.includes('fetch')) {
          chatError = {
            type: 'NETWORK_ERROR',
            message: 'Network error. Please check your connection and try again.'
          }
        } else if (err.message.includes('unauthorized')) {
          chatError = {
            type: 'UNAUTHORIZED',
            message: 'Authentication error. Please refresh the page and try again.'
          }
        } else {
          chatError = {
            type: 'API_ERROR',
            message: err.message || 'Failed to get response. Please try again.'
          }
        }
      } else {
        chatError = {
          type: 'API_ERROR',
          message: 'An unexpected error occurred. Please try again.'
        }
      }
      
      setError(chatError)
      
      // Show appropriate toast message
      if (chatError.type === 'RATE_LIMITED') {
        toast.error('Please wait before sending another message', { duration: 5000 })
      } else if (chatError.type === 'NETWORK_ERROR') {
        toast.error('Connection problem. Please check your internet and try again.')
      } else {
        toast.error('Failed to send message. Please try again.')
      }
    } finally {
      setIsLoading(false)
      abortController.current = null
    }
  }, [isLoading, currentConversation?.id, context])
  
  // Retry last message
  const retryLastMessage = useCallback(async () => {
    if (!lastMessage.current || retryCount.current >= maxRetries) return
    
    retryCount.current++
    await sendMessage(lastMessage.current)
  }, [sendMessage, maxRetries])
  
  // Start new conversation
  const startNewConversation = useCallback(async () => {
    setMessages([])
    setCurrentConversation(null)
    setError(null)
    retryCount.current = 0
    lastMessage.current = ''
    
    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: `welcome-${Date.now()}`,
      conversation_id: '',
      role: 'assistant',
      content: `Hello! I'm your charity compliance assistant. I can help you understand:

• DBS check requirements and safeguarding policies
• Annual reporting obligations and deadlines
• Fundraising regulations and best practices
• Overseas activity compliance requirements
• Gift Aid rules and procedures
• Trustee responsibilities and duties

What compliance topic would you like to explore today?`,
      metadata: {
        sources: [{
          type: 'guidance',
          title: 'Charity Commission Guidance',
          url: 'https://www.gov.uk/government/organisations/charity-commission',
          confidence: 1.0
        }]
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    setMessages([welcomeMessage])
  }, [])
  
  // Delete conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    // This would typically call an API to delete the conversation
    // For now, just start a new conversation
    await startNewConversation()
    toast.success('Conversation deleted')
  }, [startNewConversation])
  
  // Load context if not provided
  useEffect(() => {
    if (!providedContext) {
      // Load context from API or local storage
      // This would typically be implemented as a separate hook
      // For now, use a basic context
      setContext({
        organization_id: 'demo-org',
        organization_name: 'Demo Organization',
        works_with_children: false,
        works_with_vulnerable_adults: false,
        has_overseas_activities: false,
        is_fundraising_charity: true
      })
    }
  }, [providedContext])

  // Initialize with welcome message
  useEffect(() => {
    if (autoLoadHistory && messages.length === 0) {
      startNewConversation()
    }
  }, [autoLoadHistory, messages.length, startNewConversation])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort()
      }
    }
  }, [])
  
  return {
    messages,
    isLoading,
    error,
    currentConversation,
    sendMessage,
    startNewConversation,
    loadConversation,
    deleteConversation,
    retryLastMessage,
    clearError
  }
}

/**
 * Hook for managing chat history/conversations list
 */
export function useChatHistory() {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // This would call an API to get user's conversations
      // For now, return empty array
      setConversations([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations')
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  const searchConversations = useCallback((query: string): ChatConversation[] => {
    return conversations.filter(conv => 
      conv.title.toLowerCase().includes(query.toLowerCase()) ||
      conv.summary?.toLowerCase().includes(query.toLowerCase())
    )
  }, [conversations])
  
  return {
    conversations,
    isLoading,
    error,
    loadConversations,
    searchConversations
  }
}