# Activity Logging Integration Examples

## 1. Document Upload Example

```typescript
// In /features/documents/components/document-upload-form.tsx

import { logActivity, ActivityTypes } from '@/lib/services/activity-logging.service'

// After successful upload
const handleUpload = async (file: File) => {
  try {
    const startTime = Date.now()
    
    // ... upload logic ...
    
    // Log the activity
    await logActivity({
      activity_type: ActivityTypes.DOCUMENT_UPLOAD,
      resource_type: 'document',
      resource_id: uploadedDoc.id,
      resource_name: file.name,
      metadata: {
        fileSize: file.size,
        fileType: file.type,
        category: selectedCategory
      },
      duration_ms: Date.now() - startTime
    })
    
    toast.success('Document uploaded successfully')
  } catch (error) {
    console.error('Upload failed:', error)
  }
}
```

## 2. Compliance Score Page View

```typescript
// In /app/(app)/compliance/score/page.tsx

'use client'

import { useEffect } from 'react'
import { logActivity, ActivityTypes } from '@/lib/services/activity-logging.service'

export default function ComplianceScorePage() {
  useEffect(() => {
    // Log page view
    logActivity({
      activity_type: ActivityTypes.PAGE_VIEW,
      metadata: { 
        page: 'compliance_score',
        section: 'compliance'
      }
    })
    
    // Log compliance score view
    logActivity({
      activity_type: ActivityTypes.COMPLIANCE_SCORE_VIEW
    })
  }, [])
  
  // ... rest of component
}
```

## 3. Report Generation

```typescript
// In report generation service

import { logActivity, ActivityTypes } from '@/lib/services/activity-logging.service'

export async function generateBoardPack(options: BoardPackOptions) {
  const startTime = Date.now()
  
  try {
    // ... generate report ...
    
    await logActivity({
      activity_type: ActivityTypes.BOARD_PACK_CREATE,
      resource_type: 'report',
      resource_id: report.id,
      resource_name: `Board Pack ${options.period}`,
      metadata: {
        period: options.period,
        sections: options.includedSections,
        format: 'pdf',
        pages: report.pageCount
      },
      duration_ms: Date.now() - startTime
    })
    
    return report
  } catch (error) {
    // Log failed attempt
    await logActivity({
      activity_type: ActivityTypes.REPORT_GENERATE,
      metadata: {
        reportType: 'board_pack',
        error: error.message,
        failed: true
      },
      duration_ms: Date.now() - startTime
    })
    
    throw error
  }
}
```

## 4. AI Chat Integration

```typescript
// In AI chat component

import { logActivity, ActivityTypes } from '@/lib/services/activity-logging.service'

const handleSendMessage = async (message: string) => {
  const startTime = Date.now()
  
  await logActivity({
    activity_type: ActivityTypes.AI_CHAT_MESSAGE,
    metadata: {
      messageLength: message.length,
      hasAttachments: attachments.length > 0,
      topic: detectTopic(message) // 'compliance', 'safeguarding', etc.
    }
  })
  
  try {
    const response = await sendChatMessage(message)
    
    // Log successful interaction
    await logActivity({
      activity_type: ActivityTypes.AI_COMPLIANCE_QUESTION,
      metadata: {
        question: message.substring(0, 100), // First 100 chars
        responseLength: response.length,
        duration_ms: Date.now() - startTime,
        helpful: true // Track if marked as helpful
      }
    })
  } catch (error) {
    console.error('Chat error:', error)
  }
}
```

## 5. Search Tracking

```typescript
// In search component

import { logActivity, ActivityTypes } from '@/lib/services/activity-logging.service'

const handleSearch = async (query: string, filters: SearchFilters) => {
  const results = await performSearch(query, filters)
  
  // Log search activity
  await logActivity({
    activity_type: ActivityTypes.SEARCH_PERFORM,
    metadata: {
      query: query,
      resultsCount: results.length,
      filters: {
        type: filters.type,
        dateRange: filters.dateRange,
        categories: filters.categories
      },
      hasResults: results.length > 0
    }
  })
  
  setSearchResults(results)
}
```

## 6. Login/Logout Tracking

```typescript
// In auth flow

import { logActivity, logAuditEvent, ActivityTypes, AuditActions } from '@/lib/services/activity-logging.service'

// Successful login
export async function handleLogin(email: string) {
  await logActivity({
    activity_type: ActivityTypes.LOGIN,
    metadata: {
      method: 'magic_link',
      email: email
    }
  })
}

// Logout
export async function handleLogout() {
  await logActivity({
    activity_type: ActivityTypes.LOGOUT
  })
}

// Failed login attempts (security)
export async function handleFailedLogin(email: string, reason: string) {
  await logAuditEvent({
    action: AuditActions.UNAUTHORIZED_ACCESS,
    resource_type: 'auth',
    metadata: {
      email: email,
      reason: reason,
      timestamp: new Date().toISOString()
    },
    severity: 'warning'
  })
}
```

## 7. Bulk Operations

```typescript
// In bulk delete handler

import { logAuditEvent, AuditActions } from '@/lib/services/activity-logging.service'

const handleBulkDelete = async (recordIds: string[], recordType: string) => {
  // Get record details before deletion for audit trail
  const records = await fetchRecords(recordIds)
  
  // Perform deletion
  await deleteRecords(recordIds)
  
  // Log audit event
  await logAuditEvent({
    action: AuditActions.BULK_DELETE,
    resource_type: recordType,
    resource_name: `${recordIds.length} ${recordType}`,
    changes: {
      deleted_records: records.map(r => ({
        id: r.id,
        name: r.name,
        deleted_at: new Date().toISOString()
      }))
    },
    severity: 'warning'
  })
}
```

## 8. Data Export Tracking

```typescript
// In export service

import { logActivity, logAuditEvent, ActivityTypes, AuditActions } from '@/lib/services/activity-logging.service'

export async function exportData(exportOptions: ExportOptions) {
  const startTime = Date.now()
  
  // Log the export activity
  await logActivity({
    activity_type: ActivityTypes.DATA_EXPORT,
    resource_type: 'export',
    metadata: {
      format: exportOptions.format,
      dataType: exportOptions.dataType,
      recordCount: exportOptions.recordCount,
      filters: exportOptions.filters
    }
  })
  
  // If exporting sensitive data, create audit log
  if (exportOptions.includesSensitiveData) {
    await logAuditEvent({
      action: AuditActions.DATA_EXPORT_SENSITIVE,
      resource_type: exportOptions.dataType,
      metadata: {
        format: exportOptions.format,
        recordCount: exportOptions.recordCount,
        includedFields: exportOptions.fields,
        exportedBy: user.email
      },
      severity: 'warning'
    })
  }
  
  // Perform export...
  
  // Log completion
  await logActivity({
    activity_type: ActivityTypes.DATA_EXPORT,
    metadata: {
      ...previousMetadata,
      completed: true,
      duration_ms: Date.now() - startTime
    }
  })
}
```

## Best Practices

### 1. Always Include Context
```typescript
// ❌ Bad - No context
await logActivity({
  activity_type: ActivityTypes.PAGE_VIEW
})

// ✅ Good - Includes useful context
await logActivity({
  activity_type: ActivityTypes.PAGE_VIEW,
  metadata: {
    page: 'safeguarding_records',
    section: 'compliance',
    referrer: document.referrer,
    hasFilters: activeFilters.length > 0
  }
})
```

### 2. Track Performance
```typescript
const startTime = Date.now()

// ... perform operation ...

await logActivity({
  activity_type: ActivityTypes.REPORT_GENERATE,
  duration_ms: Date.now() - startTime,
  metadata: { 
    reportType: 'annual_return',
    success: true 
  }
})
```

### 3. Use Consistent Resource Names
```typescript
// When logging activities for the same resource
resource_name: user.full_name || user.email || 'Unknown User'
resource_name: `${doc.title} (${doc.file_name})`
resource_name: `Q${quarter} ${year} Board Pack`
```

### 4. Don't Over-Log
- Focus on meaningful user actions
- Avoid logging every click or hover
- Consider performance impact
- Respect user privacy

### 5. Error Handling
```typescript
try {
  await logActivity({ ... })
} catch (error) {
  // Activity logging should never break the app
  console.error('Activity logging failed:', error)
  // Continue with main operation
}
```