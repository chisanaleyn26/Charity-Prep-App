-- Create compliance history table for tracking scores over time
CREATE TABLE IF NOT EXISTS compliance_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  breakdown JSONB, -- Store detailed breakdown for historical analysis
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_compliance_history_org_date 
ON compliance_history(organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_compliance_history_date 
ON compliance_history(created_at DESC);

-- Enable RLS
ALTER TABLE compliance_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view compliance history for their organization" 
ON compliance_history FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "System can insert compliance history" 
ON compliance_history FOR INSERT 
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'member')
  )
);

-- Add helpful comments
COMMENT ON TABLE compliance_history IS 'Stores historical compliance scores for trend analysis';
COMMENT ON COLUMN compliance_history.score IS 'Overall compliance score (0-100)';
COMMENT ON COLUMN compliance_history.breakdown IS 'Detailed breakdown of score components';