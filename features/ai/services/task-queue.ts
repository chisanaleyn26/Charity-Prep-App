'use server'

import { createClient, getCurrentUserOrganization } from '@/lib/supabase/server'
import type { AITask, AITaskStatus, AITaskType } from '../types/extraction'

// Create an AI task
export async function createAITask(
  type: AITaskType,
  inputData: Record<string, any>,
  metadata?: Record<string, any>
): Promise<AITask> {
  const supabase = await createClient()
  
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Not authenticated')
  
  const organizationId = userData.user.user_metadata?.organization_id
  if (!organizationId) throw new Error('No organization found')
  
  const taskData = {
    organization_id: organizationId,
    type,
    status: 'pending' as AITaskStatus,
    input_data: inputData,
    metadata: metadata || {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  const { data, error } = await supabase
    .from('ai_tasks')
    .insert(taskData)
    .select()
    .single()
    
  if (error) {
    console.error('Error creating AI task:', error)
    throw new Error('Failed to create AI task')
  }
  
  // Process task asynchronously
  processTaskAsync(data.id)
  
  return data
}

// Get AI tasks for the organization
export async function getAITasks(
  filters?: {
    type?: AITaskType
    status?: AITaskStatus
    limit?: number
  }
): Promise<AITask[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('ai_tasks')
    .select('*')
    .order('created_at', { ascending: false })
    
  if (filters?.type) {
    query = query.eq('type', filters.type)
  }
  
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching AI tasks:', error)
    throw new Error('Failed to fetch AI tasks')
  }
  
  return data || []
}

// Update task status
export async function updateTaskStatus(
  taskId: string,
  status: AITaskStatus,
  outputData?: Record<string, any>,
  error?: string
): Promise<void> {
  const supabase = await createClient()
  
  const updates: any = {
    status,
    updated_at: new Date().toISOString()
  }
  
  if (outputData) {
    updates.output_data = outputData
  }
  
  if (error) {
    updates.error_message = error
  }
  
  if (status === 'completed' || status === 'failed') {
    updates.processed_at = new Date().toISOString()
  }
  
  const { error: updateError } = await supabase
    .from('ai_tasks')
    .update(updates)
    .eq('id', taskId)
    
  if (updateError) {
    console.error('Error updating task status:', updateError)
    throw new Error('Failed to update task status')
  }
}

// Process task asynchronously (placeholder - would be a background job)
async function processTaskAsync(taskId: string): Promise<void> {
  // In a real implementation, this would:
  // 1. Queue the task in a job queue (Bull, BullMQ, etc.)
  // 2. Process in a background worker
  // 3. Handle retries and timeouts
  
  // For now, we'll just mark it as ready for processing
  setTimeout(() => {
    console.log(`Task ${taskId} ready for processing`)
  }, 100)
}

// Get pending tasks for processing
export async function getPendingTasks(limit: number = 10): Promise<AITask[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('ai_tasks')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(limit)
    
  if (error) {
    console.error('Error fetching pending tasks:', error)
    return []
  }
  
  return data || []
}

// Cancel a task
export async function cancelTask(taskId: string): Promise<void> {
  await updateTaskStatus(taskId, 'cancelled')
}

// Retry a failed task
export async function retryTask(taskId: string): Promise<void> {
  const supabase = await createClient()
  
  // Get the original task
  const { data: task, error } = await supabase
    .from('ai_tasks')
    .select('*')
    .eq('id', taskId)
    .single()
    
  if (error || !task) {
    throw new Error('Task not found')
  }
  
  // Reset to pending status
  await updateTaskStatus(taskId, 'pending')
  
  // Reprocess
  processTaskAsync(taskId)
}

// Get task statistics
export async function getTaskStats(): Promise<{
  total: number
  pending: number
  processing: number
  completed: number
  failed: number
}> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('ai_tasks')
    .select('status')
    
  if (error || !data) {
    return {
      total: 0,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0
    }
  }
  
  const stats = data.reduce((acc, task) => {
    acc.total++
    acc[task.status]++
    return acc
  }, {
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    cancelled: 0
  })
  
  return stats
}