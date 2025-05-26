'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth, requireOrgAccess } from './utils'

export interface BackupMetadata {
  id: string
  organization_id: string
  backup_type: 'manual' | 'scheduled' | 'pre_migration'
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  size_bytes: number
  tables_included: string[]
  created_by?: string
  created_at: Date
  completed_at?: Date
  storage_path?: string
  download_url?: string
  expires_at?: Date
  error_message?: string
}

export interface BackupData {
  version: string
  created_at: string
  organization: {
    id: string
    name: string
    charity_number?: string
  }
  data: {
    safeguarding_records: any[]
    overseas_activities: any[]
    income_records: any[]
    documents: any[]
    notifications: any[]
    activity_logs: any[]
  }
  metadata: {
    record_counts: Record<string, number>
    backup_type: string
    app_version: string
  }
}

/**
 * Create a backup of organization data
 */
export async function createBackup(
  organizationId: string,
  options?: {
    type?: 'manual' | 'scheduled' | 'pre_migration'
    includeLogs?: boolean
    includeDocuments?: boolean
  }
): Promise<{ backup?: BackupMetadata; error?: string }> {
  try {
    const supabase = await createClient()
    const user = await requireAuth()
    await requireOrgAccess(organizationId)
    
    // Create backup record
    const { data: backupRecord, error: insertError } = await supabase
      .from('backups')
      .insert({
        organization_id: organizationId,
        backup_type: options?.type || 'manual',
        status: 'in_progress',
        created_by: user.id,
        tables_included: getIncludedTables(options)
      })
      .select()
      .single()
    
    if (insertError || !backupRecord) {
      throw new Error('Failed to create backup record')
    }
    
    try {
      // Get organization details
      const { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single()
      
      // Fetch all data
      const [
        { data: safeguarding },
        { data: overseas },
        { data: income },
        { data: documents },
        { data: notifications },
        { data: activityLogs }
      ] = await Promise.all([
        supabase.from('safeguarding_records').select('*').eq('organization_id', organizationId),
        supabase.from('overseas_activities').select('*').eq('organization_id', organizationId),
        supabase.from('income_records').select('*').eq('organization_id', organizationId),
        options?.includeDocuments !== false 
          ? supabase.from('documents').select('*').eq('organization_id', organizationId)
          : Promise.resolve({ data: [] }),
        supabase.from('notifications').select('*').eq('organization_id', organizationId),
        options?.includeLogs 
          ? supabase.from('activity_logs').select('*').eq('organization_id', organizationId)
          : Promise.resolve({ data: [] })
      ])
      
      // Create backup data structure
      const backupData: BackupData = {
        version: '1.0',
        created_at: new Date().toISOString(),
        organization: {
          id: org?.id || organizationId,
          name: org?.name || 'Unknown',
          charity_number: org?.charity_number
        },
        data: {
          safeguarding_records: safeguarding || [],
          overseas_activities: overseas || [],
          income_records: income || [],
          documents: documents || [],
          notifications: notifications || [],
          activity_logs: activityLogs || []
        },
        metadata: {
          record_counts: {
            safeguarding_records: safeguarding?.length || 0,
            overseas_activities: overseas?.length || 0,
            income_records: income?.length || 0,
            documents: documents?.length || 0,
            notifications: notifications?.length || 0,
            activity_logs: activityLogs?.length || 0
          },
          backup_type: options?.type || 'manual',
          app_version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
        }
      }
      
      // Convert to JSON and calculate size
      const backupJson = JSON.stringify(backupData, null, 2)
      const sizeBytes = new TextEncoder().encode(backupJson).length
      
      // Upload to storage
      const fileName = `backup-${organizationId}-${Date.now()}.json`
      const { error: uploadError } = await supabase
        .storage
        .from('backups')
        .upload(`${organizationId}/${fileName}`, backupJson, {
          contentType: 'application/json',
          cacheControl: '3600'
        })
      
      if (uploadError) throw uploadError
      
      // Generate signed URL (24 hour expiry)
      const { data: urlData } = await supabase
        .storage
        .from('backups')
        .createSignedUrl(`${organizationId}/${fileName}`, 86400)
      
      // Update backup record
      const { error: updateError } = await supabase
        .from('backups')
        .update({
          status: 'completed',
          size_bytes: sizeBytes,
          completed_at: new Date().toISOString(),
          storage_path: `${organizationId}/${fileName}`,
          download_url: urlData?.signedUrl,
          expires_at: new Date(Date.now() + 86400000).toISOString() // 24 hours
        })
        .eq('id', backupRecord.id)
      
      if (updateError) throw updateError
      
      return {
        backup: {
          ...backupRecord,
          status: 'completed',
          size_bytes: sizeBytes,
          created_at: new Date(backupRecord.created_at),
          completed_at: new Date(),
          download_url: urlData?.signedUrl,
          expires_at: new Date(Date.now() + 86400000)
        }
      }
      
    } catch (error) {
      // Update backup record with error
      await supabase
        .from('backups')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', backupRecord.id)
      
      throw error
    }
    
  } catch (error) {
    console.error('Create backup error:', error)
    return { error: 'Failed to create backup' }
  }
}

/**
 * Restore from backup
 */
export async function restoreFromBackup(
  backupId: string,
  options?: {
    clearExisting?: boolean
    tables?: string[]
  }
): Promise<{ success?: boolean; summary?: string; error?: string }> {
  try {
    const supabase = await createClient()
    const user = await requireAuth()
    
    // Get backup record
    const { data: backup } = await supabase
      .from('backups')
      .select('*')
      .eq('id', backupId)
      .single()
    
    if (!backup) {
      return { error: 'Backup not found' }
    }
    
    await requireOrgAccess(backup.organization_id)
    
    // Download backup file
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('backups')
      .download(backup.storage_path)
    
    if (downloadError || !fileData) {
      return { error: 'Failed to download backup file' }
    }
    
    // Parse backup data
    const backupText = await fileData.text()
    const backupData: BackupData = JSON.parse(backupText)
    
    // Validate backup version
    if (backupData.version !== '1.0') {
      return { error: 'Incompatible backup version' }
    }
    
    // Clear existing data if requested
    if (options?.clearExisting) {
      const tablesToClear = options.tables || Object.keys(backupData.data)
      
      for (const table of tablesToClear) {
        await supabase
          .from(table)
          .delete()
          .eq('organization_id', backup.organization_id)
      }
    }
    
    // Restore data
    const results: Record<string, { success: number; failed: number }> = {}
    const tablesToRestore = options?.tables || Object.keys(backupData.data)
    
    for (const table of tablesToRestore) {
      const records = backupData.data[table as keyof typeof backupData.data]
      results[table] = { success: 0, failed: 0 }
      
      if (!records || records.length === 0) continue
      
      // Restore in batches to avoid size limits
      const batchSize = 100
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize)
        
        // Remove system fields that shouldn't be restored
        const cleanedBatch = batch.map(record => {
          const { id, created_at, updated_at, ...rest } = record
          return rest
        })
        
        const { error } = await supabase
          .from(table)
          .insert(cleanedBatch)
        
        if (error) {
          results[table].failed += batch.length
          console.error(`Failed to restore ${table} batch:`, error)
        } else {
          results[table].success += batch.length
        }
      }
    }
    
    // Create restore activity log
    await supabase
      .from('activity_logs')
      .insert({
        organization_id: backup.organization_id,
        user_id: user.id,
        action: 'backup_restored',
        resource_type: 'backup',
        resource_id: backupId,
        metadata: {
          backup_created_at: backupData.created_at,
          tables_restored: tablesToRestore,
          results
        }
      })
    
    // Generate summary
    const summary = Object.entries(results)
      .map(([table, result]) => 
        `${table}: ${result.success} restored${result.failed > 0 ? `, ${result.failed} failed` : ''}`
      )
      .join('; ')
    
    return { success: true, summary }
    
  } catch (error) {
    console.error('Restore backup error:', error)
    return { error: 'Failed to restore backup' }
  }
}

/**
 * List available backups
 */
export async function listBackups(
  organizationId: string,
  options?: {
    type?: BackupMetadata['backup_type']
    status?: BackupMetadata['status']
    limit?: number
  }
): Promise<{ backups?: BackupMetadata[]; error?: string }> {
  try {
    const supabase = await createClient()
    await requireOrgAccess(organizationId)
    
    let query = supabase
      .from('backups')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
    
    if (options?.type) {
      query = query.eq('backup_type', options.type)
    }
    
    if (options?.status) {
      query = query.eq('status', options.status)
    }
    
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    
    const { data: backups, error } = await query
    
    if (error) throw error
    
    return {
      backups: backups?.map(b => ({
        ...b,
        created_at: new Date(b.created_at),
        completed_at: b.completed_at ? new Date(b.completed_at) : undefined,
        expires_at: b.expires_at ? new Date(b.expires_at) : undefined
      })) || []
    }
    
  } catch (error) {
    console.error('List backups error:', error)
    return { error: 'Failed to list backups' }
  }
}

/**
 * Delete old backups
 */
export async function cleanupOldBackups(
  organizationId: string,
  keepDays: number = 30
): Promise<{ deleted?: number; error?: string }> {
  try {
    const supabase = await createClient()
    await requireOrgAccess(organizationId)
    
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - keepDays)
    
    // Get old backups
    const { data: oldBackups } = await supabase
      .from('backups')
      .select('*')
      .eq('organization_id', organizationId)
      .lt('created_at', cutoffDate.toISOString())
    
    if (!oldBackups || oldBackups.length === 0) {
      return { deleted: 0 }
    }
    
    // Delete files from storage
    for (const backup of oldBackups) {
      if (backup.storage_path) {
        await supabase
          .storage
          .from('backups')
          .remove([backup.storage_path])
      }
    }
    
    // Delete backup records
    const { error } = await supabase
      .from('backups')
      .delete()
      .eq('organization_id', organizationId)
      .lt('created_at', cutoffDate.toISOString())
    
    if (error) throw error
    
    return { deleted: oldBackups.length }
    
  } catch (error) {
    console.error('Cleanup old backups error:', error)
    return { error: 'Failed to cleanup backups' }
  }
}

/**
 * Schedule automatic backups
 */
export async function scheduleBackups(
  organizationId: string,
  schedule: 'daily' | 'weekly' | 'monthly' | 'disabled'
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    await requireOrgAccess(organizationId)
    
    // Update organization settings
    const { error } = await supabase
      .from('organizations')
      .update({
        backup_schedule: schedule,
        backup_settings: {
          schedule,
          last_backup: new Date().toISOString(),
          retention_days: 30,
          include_logs: false,
          include_documents: true
        }
      })
      .eq('id', organizationId)
    
    if (error) throw error
    
    // Create cron job entry (would be handled by backend service)
    if (schedule !== 'disabled') {
      await supabase
        .from('scheduled_jobs')
        .upsert({
          organization_id: organizationId,
          job_type: 'backup',
          schedule,
          enabled: true,
          next_run: getNextRunDate(schedule)
        })
    } else {
      // Disable scheduled backups
      await supabase
        .from('scheduled_jobs')
        .update({ enabled: false })
        .eq('organization_id', organizationId)
        .eq('job_type', 'backup')
    }
    
    return { success: true }
    
  } catch (error) {
    console.error('Schedule backups error:', error)
    return { error: 'Failed to schedule backups' }
  }
}

// Helper functions

function getIncludedTables(options?: { includeLogs?: boolean; includeDocuments?: boolean }): string[] {
  const tables = [
    'safeguarding_records',
    'overseas_activities',
    'income_records',
    'notifications'
  ]
  
  if (options?.includeDocuments !== false) {
    tables.push('documents')
  }
  
  if (options?.includeLogs) {
    tables.push('activity_logs')
  }
  
  return tables
}

function getNextRunDate(schedule: 'daily' | 'weekly' | 'monthly'): string {
  const now = new Date()
  const next = new Date()
  
  switch (schedule) {
    case 'daily':
      next.setDate(next.getDate() + 1)
      next.setHours(2, 0, 0, 0) // 2 AM
      break
    case 'weekly':
      next.setDate(next.getDate() + (7 - next.getDay())) // Next Sunday
      next.setHours(2, 0, 0, 0)
      break
    case 'monthly':
      next.setMonth(next.getMonth() + 1)
      next.setDate(1) // First of month
      next.setHours(2, 0, 0, 0)
      break
  }
  
  return next.toISOString()
}