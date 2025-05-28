import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // First, let's create the calendar_events table from the migration
    const createTableSQL = `
      -- Calendar events for deadline tracking (from 005_missing_tables.sql)
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
    `

    // Add deadline-specific fields (from 016_add_deadline_fields.sql)
    const addDeadlineFieldsSQL = `
      ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low'));
      ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'overdue', 'completed'));
      ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS deadline_type TEXT CHECK (deadline_type IN ('dbs_expiry', 'annual_return', 'policy_review', 'training', 'other'));
      ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS related_url TEXT;
    `

    // Create indexes
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_calendar_events_organization_id ON calendar_events(organization_id);
      CREATE INDEX IF NOT EXISTS idx_calendar_events_start_date ON calendar_events(start_date);
      CREATE INDEX IF NOT EXISTS idx_calendar_events_event_type ON calendar_events(event_type);
      CREATE INDEX IF NOT EXISTS idx_calendar_events_priority ON calendar_events(priority);
      CREATE INDEX IF NOT EXISTS idx_calendar_events_status ON calendar_events(status);
      CREATE INDEX IF NOT EXISTS idx_calendar_events_deadline_type ON calendar_events(deadline_type);
    `

    // Enable RLS
    const enableRLSSQL = `
      ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
    `

    // Create RLS policies
    const createPoliciesSQL = `
      DROP POLICY IF EXISTS "Users can view calendar events in their organization" ON calendar_events;
      DROP POLICY IF EXISTS "Members can manage calendar events" ON calendar_events;
      
      CREATE POLICY "Users can view calendar events in their organization" ON calendar_events
          FOR SELECT USING (
              EXISTS (
                  SELECT 1 FROM organization_members om
                  WHERE om.organization_id = calendar_events.organization_id
                  AND om.user_id = auth.uid()
              )
          );

      CREATE POLICY "Members can manage calendar events" ON calendar_events
          FOR ALL USING (
              EXISTS (
                  SELECT 1 FROM organization_members om
                  WHERE om.organization_id = calendar_events.organization_id
                  AND om.user_id = auth.uid()
                  AND om.role IN ('admin', 'member')
              )
          );
    `

    // Execute all SQL
    const steps = [
      { name: 'Create table', sql: createTableSQL },
      { name: 'Add deadline fields', sql: addDeadlineFieldsSQL },
      { name: 'Create indexes', sql: createIndexesSQL },
      { name: 'Enable RLS', sql: enableRLSSQL },
      { name: 'Create policies', sql: createPoliciesSQL }
    ]

    const results = []

    for (const step of steps) {
      try {
        const { error } = await supabase.rpc('execute_sql', { sql: step.sql })
        if (error) {
          // Try alternative method
          const { error: altError } = await supabase
            .from('_migration_log')
            .insert({ step: step.name, error: error.message })
            .select()
            .single()
          
          results.push({ 
            step: step.name, 
            success: false, 
            error: error.message,
            alternativeError: altError?.message
          })
        } else {
          results.push({ step: step.name, success: true })
        }
      } catch (err) {
        results.push({ 
          step: step.name, 
          success: false, 
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({ 
      message: 'Migration attempted',
      results
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}