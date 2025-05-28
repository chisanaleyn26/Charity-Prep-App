-- Add deadline-specific fields to calendar_events table
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low'));
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'overdue', 'completed'));
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS deadline_type TEXT CHECK (deadline_type IN ('dbs_expiry', 'annual_return', 'policy_review', 'training', 'other'));
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS related_url TEXT;

-- Add index for deadline queries
CREATE INDEX IF NOT EXISTS idx_calendar_events_priority ON calendar_events(priority);
CREATE INDEX IF NOT EXISTS idx_calendar_events_status ON calendar_events(status);
CREATE INDEX IF NOT EXISTS idx_calendar_events_deadline_type ON calendar_events(deadline_type);

-- Update existing event_type enum to include 'deadline' if not present
-- Note: deadline should already be included from the original schema