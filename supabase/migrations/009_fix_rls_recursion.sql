-- Fix infinite recursion in organization_members RLS policies
-- The issue: policies were using user_organization_role() function which queries organization_members,
-- creating infinite recursion when trying to INSERT/UPDATE organization_members

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Members can view their organization members" ON organization_members;
DROP POLICY IF EXISTS "Admins can manage organization members" ON organization_members;

-- Drop the problematic helper function
DROP FUNCTION IF EXISTS user_organization_role(UUID, UUID);

-- Create new organization_members policies without recursion
-- Allow users to view organization members if they are already a member
CREATE POLICY "Members can view their organization members" ON organization_members
    FOR SELECT USING (
        organization_id IN (
            SELECT DISTINCT organization_id 
            FROM organization_members existing_members
            WHERE existing_members.user_id = auth.uid()
            AND existing_members.accepted_at IS NOT NULL
        )
    );

-- Allow users to insert themselves as members (for onboarding)
CREATE POLICY "Users can create their own membership" ON organization_members
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Allow admins to manage members (using a direct query to avoid recursion)
CREATE POLICY "Admins can manage organization members" ON organization_members
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members admin_check
            WHERE admin_check.organization_id = organization_members.organization_id
            AND admin_check.role = 'admin'
            AND admin_check.accepted_at IS NOT NULL
        )
    );

-- Update other policies that used the problematic function
-- Drop and recreate policies for organizations table
DROP POLICY IF EXISTS "Admins can update their organizations" ON organizations;

CREATE POLICY "Admins can update their organizations" ON organizations
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members
            WHERE organization_id = organizations.id
            AND role = 'admin'
            AND accepted_at IS NOT NULL
        )
    );

-- Fix policies for other tables that used user_organization_role function
DROP POLICY IF EXISTS "Members can create safeguarding records" ON safeguarding_records;
DROP POLICY IF EXISTS "Members can update safeguarding records" ON safeguarding_records;
DROP POLICY IF EXISTS "Admins can delete safeguarding records" ON safeguarding_records;
DROP POLICY IF EXISTS "Members can manage overseas activities" ON overseas_activities;
DROP POLICY IF EXISTS "Members can manage income records" ON income_records;

-- Recreate without the problematic function
CREATE POLICY "Members can create safeguarding records" ON safeguarding_records
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM organization_members
            WHERE organization_id = safeguarding_records.organization_id
            AND role IN ('admin', 'member')
            AND accepted_at IS NOT NULL
        )
    );

CREATE POLICY "Members can update safeguarding records" ON safeguarding_records
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members
            WHERE organization_id = safeguarding_records.organization_id
            AND role IN ('admin', 'member')
            AND accepted_at IS NOT NULL
        )
    );

CREATE POLICY "Admins can delete safeguarding records" ON safeguarding_records
    FOR DELETE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members
            WHERE organization_id = safeguarding_records.organization_id
            AND role = 'admin'
            AND accepted_at IS NOT NULL
        )
    );

CREATE POLICY "Members can manage overseas activities" ON overseas_activities
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members
            WHERE organization_id = overseas_activities.organization_id
            AND role IN ('admin', 'member')
            AND accepted_at IS NOT NULL
        )
    );

CREATE POLICY "Members can manage income records" ON income_records
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members
            WHERE organization_id = income_records.organization_id
            AND role IN ('admin', 'member')
            AND accepted_at IS NOT NULL
        )
    );