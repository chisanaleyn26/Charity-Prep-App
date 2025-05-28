# Deadlines System Setup Guide

## Database Setup

The deadlines system requires the `calendar_events` table with additional deadline fields. Follow these steps:

### Step 1: Go to Supabase Dashboard
1. Open your Supabase project dashboard
2. Navigate to the SQL Editor

### Step 2: Run the Migration SQL
Copy and paste this SQL into the editor and execute:

```sql
-- Step 1: Create calendar_events table
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('deadline', 'reminder', 'review', 'renewal', 'meeting')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    all_day BOOLEAN DEFAULT false,
    location TEXT,
    attendees TEXT[],
    related_record_type TEXT,
    related_record_id UUID,
    reminder_minutes INTEGER[],
    is_recurring BOOLEAN DEFAULT false,
    recurrence_rule TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Add deadline-specific fields
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low'));
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'overdue', 'completed'));
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS deadline_type TEXT CHECK (deadline_type IN ('dbs_expiry', 'annual_return', 'policy_review', 'training', 'other'));
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS related_url TEXT;

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_calendar_events_organization_id ON calendar_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_date ON calendar_events(start_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_event_type ON calendar_events(event_type);
CREATE INDEX IF NOT EXISTS idx_calendar_events_priority ON calendar_events(priority);
CREATE INDEX IF NOT EXISTS idx_calendar_events_status ON calendar_events(status);
CREATE INDEX IF NOT EXISTS idx_calendar_events_deadline_type ON calendar_events(deadline_type);

-- Step 4: Enable RLS
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies
CREATE POLICY IF NOT EXISTS "Users can view calendar events in their organization" ON calendar_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = calendar_events.organization_id
            AND om.user_id = auth.uid()
        )
    );

CREATE POLICY IF NOT EXISTS "Members can manage calendar events" ON calendar_events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = calendar_events.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('admin', 'member')
        )
    );
```

### Step 3: Verify Setup
1. Go to `/debug-deadlines` in your app
2. Click "Check What Tables Exist"
3. Click "Test Deadlines API" 
4. Click "Test Create Event"

All tests should pass once the migration is complete.

## Features

Once set up, the deadlines system provides:

- **Create Deadlines**: Add new compliance deadlines with type, priority, and date
- **View Calendar**: See deadlines on a visual calendar with color coding
- **Filter & Search**: Filter deadlines by type, status, and priority
- **Complete Tasks**: Mark deadlines as completed
- **Persistent Storage**: All data is stored in Supabase database
- **Organization Scoped**: Each organization sees only their deadlines
- **Role-based Access**: Only admins and members can create/edit deadlines

## API Endpoints

- `GET /api/v1/deadlines` - Fetch all deadlines for user's organizations
- `POST /api/v1/deadlines` - Create new deadline
- `PATCH /api/v1/deadlines/[id]` - Update deadline
- `DELETE /api/v1/deadlines/[id]` - Delete deadline

## Troubleshooting

If deadlines aren't showing:
1. Check browser console for errors
2. Verify you're logged in and have an organization
3. Run the debug tests at `/debug-deadlines`
4. Ensure the database migration was applied successfully