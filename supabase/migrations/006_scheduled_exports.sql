-- Create scheduled_exports table
CREATE TABLE IF NOT EXISTS scheduled_exports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  options JSONB NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  recipients TEXT[] NOT NULL DEFAULT '{}',
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE scheduled_exports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see/manage their organization's scheduled exports
CREATE POLICY "Users can view own org scheduled exports" ON scheduled_exports
  FOR SELECT
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create scheduled exports for own org" ON scheduled_exports
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update own org scheduled exports" ON scheduled_exports
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete own org scheduled exports" ON scheduled_exports
  FOR DELETE
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE created_by = auth.uid()
    )
  );

-- Create index for performance
CREATE INDEX idx_scheduled_exports_org_id ON scheduled_exports(organization_id);
CREATE INDEX idx_scheduled_exports_next_run ON scheduled_exports(next_run) WHERE is_active = true;