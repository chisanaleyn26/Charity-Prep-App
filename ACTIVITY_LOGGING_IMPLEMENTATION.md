# Activity Logging Implementation Plan

## What I've Implemented

### 1. Database Infrastructure ✅
- Enhanced existing `audit_logs` and `user_activities` tables
- Added missing columns: `user_email`, `resource_name`, `severity`, `duration_ms`
- Created database triggers for automatic audit logging on critical tables:
  - `safeguarding_records`
  - `overseas_activities`
  - `documents`
  - `organization_members`
- Created views for easy querying: `recent_activities`, `recent_audit_logs`
- Set up proper indexes and RLS policies

### 2. Activity Logging Service ✅
Created `/lib/services/activity-logging.service.ts` with:
- `logActivity()` - For general user activities
- `logAuditEvent()` - For critical audit events
- `getRecentActivities()` - Fetch recent activities
- `getRecentAuditLogs()` - Fetch audit logs
- `getActivityStatistics()` - Get activity analytics
- Predefined activity types and audit actions for consistency

### 3. API Endpoint ✅
Created `/app/api/v1/organizations/[orgId]/activities/route.ts`:
- Returns formatted activities for the dashboard
- Supports both activity logs and audit logs
- Transforms data into consistent format for frontend
- Includes proper authorization checks

## What's Already Working

### Automatic Audit Logging (via DB triggers)
When users perform CRUD operations on critical tables, audit logs are automatically created:
```typescript
// This happens automatically when you do:
await supabase.from('safeguarding_records').insert({...})
// Creates audit log: "safeguarding_records.created"

await supabase.from('documents').delete().eq('id', docId)
// Creates audit log: "documents.deleted" with severity: "warning"
```

### Real-time Activity Feed
The existing `realtime-activity-feed.tsx` component will now:
1. Fetch initial activities from the API endpoint ✅
2. Subscribe to real-time changes ✅
3. Display both historical and live activities ✅

## How to Integrate Activity Logging

### 1. Page View Tracking
Add to your page components:
```typescript
import { logActivity, ActivityTypes } from '@/lib/services/activity-logging.service'

// In your page component
useEffect(() => {
  logActivity({
    activity_type: ActivityTypes.PAGE_VIEW,
    metadata: { page: 'compliance_score' }
  })
}, [])
```

### 2. User Action Tracking
Track important user actions:
```typescript
// Document upload
await logActivity({
  activity_type: ActivityTypes.DOCUMENT_UPLOAD,
  resource_type: 'document',
  resource_id: doc.id,
  resource_name: doc.file_name,
  metadata: { 
    fileSize: doc.file_size,
    fileType: doc.content_type 
  }
})

// Report generation
await logActivity({
  activity_type: ActivityTypes.REPORT_GENERATE,
  resource_type: 'report',
  resource_name: 'Q4 Board Pack',
  metadata: { 
    reportType: 'board_pack',
    sections: ['compliance', 'financial'] 
  },
  duration_ms: 3450 // Track performance
})

// AI Chat
await logActivity({
  activity_type: ActivityTypes.AI_CHAT_MESSAGE,
  metadata: { 
    question_length: question.length,
    topic: 'compliance' 
  }
})
```

### 3. Search Tracking
```typescript
// In your search handler
await logActivity({
  activity_type: ActivityTypes.SEARCH_PERFORM,
  metadata: { 
    query: searchTerm,
    results_count: results.length,
    filters: activeFilters 
  }
})
```

### 4. Critical Actions (Manual Audit Logs)
For actions not covered by automatic triggers:
```typescript
import { logAuditEvent, AuditActions } from '@/lib/services/activity-logging.service'

// Bulk delete operation
await logAuditEvent({
  action: AuditActions.BULK_DELETE,
  resource_type: 'safeguarding_records',
  resource_name: `${recordIds.length} records`,
  changes: { deleted_ids: recordIds },
  severity: 'warning'
})

// Sensitive data export
await logAuditEvent({
  action: AuditActions.DATA_EXPORT_SENSITIVE,
  resource_type: 'compliance_data',
  metadata: { 
    export_format: 'csv',
    record_count: 1000 
  },
  severity: 'warning'
})
```

## Implementation Priority

### High Priority (Security & Compliance)
1. ✅ Automatic audit logging for data changes (DONE via triggers)
2. Login/logout tracking
3. Permission changes
4. Data exports
5. Document access

### Medium Priority (Analytics)
1. Page views
2. Feature usage (reports, AI chat)
3. Search queries
4. Performance metrics

### Low Priority (Nice to have)
1. UI interactions (button clicks)
2. Form abandonment
3. Time spent on pages

## Dashboard Integration

The activity feed on the dashboard will show:
```typescript
// Recent activities (user actions)
- "John uploaded Annual Report 2024.pdf"
- "Sarah generated Q4 Board Pack"
- "Mike viewed compliance score"

// Audit logs (critical events - optional toggle)
- "⚠️ 5 safeguarding records deleted"
- "🔒 Admin role assigned to new.user@charity.org"
- "📊 Bulk export of 500 income records"
```

## Next Steps

1. **Integrate middleware** - Add activity tracking to the main middleware
2. **Add tracking to key features**:
   - Login/logout pages
   - Document upload component
   - Report generation functions
   - AI chat component
   - Search functionality
3. **Update dashboard** - Ensure the activity feed uses real data
4. **Add analytics dashboard** - Create a page to view activity statistics
5. **Set up data retention** - Create a cron job to clean old activities

## Performance Considerations

- Activity logging is async and non-blocking
- Uses admin client to bypass RLS for writes
- Indexes ensure fast queries
- Views limit data to recent records
- Consider batching for high-frequency events

## Privacy & Security

- User emails stored for audit trail
- IP addresses can be logged (not implemented yet)
- Sensitive data changes tracked with higher severity
- RLS ensures users only see their org's activities
- Consider GDPR compliance for data retention