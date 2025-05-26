-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE safeguarding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE overseas_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE overseas_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_records ENABLE ROW LEVEL SECURITY;

-- Helper function to check organization membership
CREATE OR REPLACE FUNCTION user_organization_role(org_id UUID, user_id UUID)
RETURNS user_role AS $$
    SELECT role FROM organization_members
    WHERE organization_id = org_id
    AND organization_members.user_id = $2
    LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Organizations policies
CREATE POLICY "Users can view their organizations" ON organizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = id
            AND om.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can update their organizations" ON organizations
    FOR UPDATE USING (
        user_organization_role(id, auth.uid()) = 'admin'
    );

-- Users policies
CREATE POLICY "Users can view themselves" ON users
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update themselves" ON users
    FOR UPDATE USING (id = auth.uid());

-- Organization members policies
CREATE POLICY "Members can view their organization members" ON organization_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage organization members" ON organization_members
    FOR ALL USING (
        user_organization_role(organization_id, auth.uid()) = 'admin'
    );

-- Safeguarding policies
CREATE POLICY "Users can view safeguarding records" ON safeguarding_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = safeguarding_records.organization_id
            AND om.user_id = auth.uid()
        )
    );

CREATE POLICY "Members can create safeguarding records" ON safeguarding_records
    FOR INSERT WITH CHECK (
        user_organization_role(organization_id, auth.uid()) IN ('admin', 'member')
    );

CREATE POLICY "Members can update safeguarding records" ON safeguarding_records
    FOR UPDATE USING (
        user_organization_role(organization_id, auth.uid()) IN ('admin', 'member')
    );

CREATE POLICY "Admins can delete safeguarding records" ON safeguarding_records
    FOR DELETE USING (
        user_organization_role(organization_id, auth.uid()) = 'admin'
    );

-- Similar policies for other compliance tables
CREATE POLICY "Users can view overseas activities" ON overseas_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = overseas_activities.organization_id
            AND om.user_id = auth.uid()
        )
    );

CREATE POLICY "Members can manage overseas activities" ON overseas_activities
    FOR ALL USING (
        user_organization_role(organization_id, auth.uid()) IN ('admin', 'member')
    );

-- Income records policies
CREATE POLICY "Users can view income records" ON income_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = income_records.organization_id
            AND om.user_id = auth.uid()
        )
    );

CREATE POLICY "Members can manage income records" ON income_records
    FOR ALL USING (
        user_organization_role(organization_id, auth.uid()) IN ('admin', 'member')
    );