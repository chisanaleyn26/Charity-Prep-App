/**
 * Chat Storage Service
 * Handles all database operations for chat conversations and messages
 */

import { createClient } from '@/lib/supabase/server'
import type { 
  ChatConversation, 
  ChatMessage, 
  ChatMessageMetadata,
  ChatContext 
} from '../types/chat'

/**
 * Create a new chat conversation
 */
export async function createConversation(
  userId: string,
  organizationId: string,
  title?: string
): Promise<ChatConversation> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('chat_conversations')
    .insert({
      user_id: userId,
      organization_id: organizationId,
      title: title || 'New Conversation'
    })
    .select()
    .single()
  
  if (error) {
    console.error('Failed to create conversation:', error)
    throw new Error('Failed to create conversation')
  }
  
  return data
}

/**
 * Get or create a conversation for the user (auto-creates if none exists or if last is too old)
 */
export async function getOrCreateConversation(
  userId: string,
  organizationId: string
): Promise<ChatConversation> {
  const supabase = createClient()
  
  // First try to call the database function
  try {
    const { data, error } = await supabase.rpc('get_or_create_conversation', {
      p_user_id: userId,
      p_organization_id: organizationId
    })
    
    if (error) throw error
    
    // Now get the full conversation details
    const { data: conversation, error: fetchError } = await supabase
      .from('chat_conversations')
      .select()
      .eq('id', data)
      .single()
    
    if (fetchError) throw fetchError
    
    return conversation
  } catch (error) {
    console.error('Failed to get/create conversation via function, falling back:', error)
    
    // Fallback: manual implementation
    const { data: existing, error: selectError } = await supabase
      .from('chat_conversations')
      .select()
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .is('deleted_at', null)
      .gte('last_message_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Within 24 hours
      .order('last_message_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    
    if (selectError) {
      console.error('Failed to check existing conversations:', selectError)
      throw new Error('Failed to access conversations')
    }
    
    if (existing) {
      return existing
    }
    
    // Create new conversation
    return await createConversation(userId, organizationId)
  }
}

/**
 * Get conversation by ID
 */
export async function getConversation(conversationId: string): Promise<ChatConversation | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('chat_conversations')
    .select()
    .eq('id', conversationId)
    .is('deleted_at', null)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    console.error('Failed to get conversation:', error)
    throw new Error('Failed to get conversation')
  }
  
  return data
}

/**
 * Get all conversations for a user
 */
export async function getUserConversations(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<ChatConversation[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('chat_conversations')
    .select()
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('last_message_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (error) {
    console.error('Failed to get user conversations:', error)
    throw new Error('Failed to get conversations')
  }
  
  return data || []
}

/**
 * Update conversation title and summary
 */
export async function updateConversation(
  conversationId: string,
  updates: {
    title?: string
    summary?: string
  }
): Promise<ChatConversation> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('chat_conversations')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', conversationId)
    .select()
    .single()
  
  if (error) {
    console.error('Failed to update conversation:', error)
    throw new Error('Failed to update conversation')
  }
  
  return data
}

/**
 * Soft delete a conversation
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('chat_conversations')
    .update({ 
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', conversationId)
  
  if (error) {
    console.error('Failed to delete conversation:', error)
    throw new Error('Failed to delete conversation')
  }
}

/**
 * Add a message to a conversation
 */
export async function addMessage(
  conversationId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  metadata?: ChatMessageMetadata,
  parentMessageId?: string
): Promise<ChatMessage> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      conversation_id: conversationId,
      role,
      content,
      metadata: metadata || {},
      parent_message_id: parentMessageId
    })
    .select()
    .single()
  
  if (error) {
    console.error('Failed to add message:', error)
    throw new Error('Failed to add message')
  }
  
  return data
}

/**
 * Get messages for a conversation
 */
export async function getConversationMessages(
  conversationId: string,
  limit: number = 50,
  beforeMessageId?: string
): Promise<ChatMessage[]> {
  const supabase = createClient()
  
  let query = supabase
    .from('chat_messages')
    .select()
    .eq('conversation_id', conversationId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
  
  if (beforeMessageId) {
    // Get messages before a specific message (for pagination)
    const { data: beforeMessage } = await supabase
      .from('chat_messages')
      .select('created_at')
      .eq('id', beforeMessageId)
      .single()
    
    if (beforeMessage) {
      query = query.lt('created_at', beforeMessage.created_at)
    }
  }
  
  query = query.limit(limit)
  
  const { data, error } = await query
  
  if (error) {
    console.error('Failed to get conversation messages:', error)
    throw new Error('Failed to get messages')
  }
  
  return data || []
}

/**
 * Update message metadata (for adding sources, feedback, etc.)
 */
export async function updateMessageMetadata(
  messageId: string,
  metadata: Partial<ChatMessageMetadata>
): Promise<ChatMessage> {
  const supabase = createClient()
  
  // Get current metadata and merge
  const { data: current, error: fetchError } = await supabase
    .from('chat_messages')
    .select('metadata')
    .eq('id', messageId)
    .single()
  
  if (fetchError) {
    console.error('Failed to fetch current metadata:', fetchError)
    throw new Error('Failed to fetch message')
  }
  
  const updatedMetadata = {
    ...current.metadata,
    ...metadata
  }
  
  const { data, error } = await supabase
    .from('chat_messages')
    .update({
      metadata: updatedMetadata,
      updated_at: new Date().toISOString()
    })
    .eq('id', messageId)
    .select()
    .single()
  
  if (error) {
    console.error('Failed to update message metadata:', error)
    throw new Error('Failed to update message')
  }
  
  return data
}

/**
 * Soft delete a message
 */
export async function deleteMessage(messageId: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('chat_messages')
    .update({ 
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', messageId)
  
  if (error) {
    console.error('Failed to delete message:', error)
    throw new Error('Failed to delete message')
  }
}

/**
 * Search conversations by content
 */
export async function searchConversations(
  userId: string,
  query: string,
  limit: number = 10
): Promise<{
  conversations: ChatConversation[]
  messages: Array<ChatMessage & { conversation: ChatConversation }>
}> {
  const supabase = createClient()
  
  // Search conversation titles
  const { data: conversationMatches, error: convError } = await supabase
    .from('chat_conversations')
    .select()
    .eq('user_id', userId)
    .is('deleted_at', null)
    .ilike('title', `%${query}%`)
    .order('last_message_at', { ascending: false })
    .limit(limit)
  
  if (convError) {
    console.error('Failed to search conversations:', convError)
  }
  
  // Search message content
  const { data: messageMatches, error: msgError } = await supabase
    .from('chat_messages')
    .select(`
      *,
      chat_conversations!inner(*)
    `)
    .ilike('content', `%${query}%`)
    .eq('chat_conversations.user_id', userId)
    .is('deleted_at', null)
    .is('chat_conversations.deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (msgError) {
    console.error('Failed to search messages:', msgError)
  }
  
  return {
    conversations: conversationMatches || [],
    messages: messageMatches?.map(msg => ({
      ...msg,
      conversation: msg.chat_conversations
    })) || []
  }
}

/**
 * Get conversation statistics for analytics
 */
export async function getConversationStats(
  organizationId: string,
  timeframe: 'day' | 'week' | 'month' = 'week'
): Promise<{
  total_conversations: number
  total_messages: number
  avg_messages_per_conversation: number
  active_users: number
}> {
  const supabase = createClient()
  
  const timeframeDays = timeframe === 'day' ? 1 : timeframe === 'week' ? 7 : 30
  const since = new Date()
  since.setDate(since.getDate() - timeframeDays)
  
  // Get conversation stats
  const { data: convStats, error: convError } = await supabase
    .from('chat_conversations')
    .select('id, user_id, message_count')
    .eq('organization_id', organizationId)
    .gte('created_at', since.toISOString())
    .is('deleted_at', null)
  
  if (convError) {
    console.error('Failed to get conversation stats:', convError)
    throw new Error('Failed to get conversation statistics')
  }
  
  const totalConversations = convStats.length
  const totalMessages = convStats.reduce((sum, conv) => sum + (conv.message_count || 0), 0)
  const activeUsers = new Set(convStats.map(conv => conv.user_id)).size
  const avgMessagesPerConversation = totalConversations > 0 ? totalMessages / totalConversations : 0
  
  return {
    total_conversations: totalConversations,
    total_messages: totalMessages,
    avg_messages_per_conversation: Math.round(avgMessagesPerConversation * 100) / 100,
    active_users: activeUsers
  }
}

/**
 * Export conversation as JSON
 */
export async function exportConversation(conversationId: string): Promise<{
  conversation: ChatConversation
  messages: ChatMessage[]
}> {
  const conversation = await getConversation(conversationId)
  if (!conversation) {
    throw new Error('Conversation not found')
  }
  
  const messages = await getConversationMessages(conversationId, 1000)
  
  return {
    conversation,
    messages
  }
}

/**
 * Cleanup old conversations (called periodically)
 */
export async function cleanupOldConversations(daysOld: number = 90): Promise<{ deleted: number }> {
  const supabase = createClient()
  
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)
  
  const { count, error } = await supabase
    .from('chat_conversations')
    .update({ 
      deleted_at: new Date().toISOString() 
    })
    .lt('last_message_at', cutoffDate.toISOString())
    .is('deleted_at', null)
  
  if (error) {
    console.error('Failed to cleanup old conversations:', error)
    return { deleted: 0 }
  }
  
  return { deleted: count || 0 }
}