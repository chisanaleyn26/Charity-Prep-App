-- Comprehensive RLS fix for onboarding flow
-- This migration ensures all necessary policies are in place for organization creation

-- First, let's check and drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;
DROP POLICY IF EXISTS "Admins can update their organizations" ON organizations;
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;

DROP POLICY IF EXISTS "Users can view themselves" ON users;
DROP POLICY IF EXISTS "Users can update themselves" ON users;
DROP POLICY IF EXISTS "Users can create their profile" ON users;

DROP POLICY IF EXISTS "Members can view their organization members" ON organization_members;
DROP POLICY IF EXISTS "Admins can manage organization members" ON organization_members;
DROP POLICY IF EXISTS "Users can add themselves as members" ON organization_members;

DROP POLICY IF EXISTS "Admins can create subscriptions" ON subscriptions;

-- ORGANIZATIONS POLICIES
-- Allow authenticated users to create organizations
CREATE POLICY "organizations_insert_policy" ON organizations
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);

-- Allow users to view organizations they belong to
CREATE POLICY "organizations_select_policy" ON organizations
    FOR SELECT 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organizations.id
            AND om.user_id = auth.uid()
        )
    );

-- Allow admins to update their organizations
CREATE POLICY "organizations_update_policy" ON organizations
    FOR UPDATE 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organizations.id
            AND om.user_id = auth.uid()
            AND om.role = 'admin'
        )
    );

-- USERS POLICIES
-- Allow users to insert their own profile
CREATE POLICY "users_insert_policy" ON users
    FOR INSERT 
    TO authenticated
    WITH CHECK (id = auth.uid());

-- Allow users to view their own profile
CREATE POLICY "users_select_policy" ON users
    FOR SELECT 
    TO authenticated
    USING (id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "users_update_policy" ON users
    FOR UPDATE 
    TO authenticated
    USING (id = auth.uid());

-- ORGANIZATION MEMBERS POLICIES
-- Allow users to add themselves as members during org creation
CREATE POLICY "members_insert_policy" ON organization_members
    FOR INSERT 
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Allow members to view their organization's members
CREATE POLICY "members_select_policy" ON organization_members
    FOR SELECT 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.user_id = auth.uid()
        )
    );

-- Allow admins to manage members
CREATE POLICY "members_update_policy" ON organization_members
    FOR UPDATE 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.user_id = auth.uid()
            AND om.role = 'admin'
        )
    );

CREATE POLICY "members_delete_policy" ON organization_members
    FOR DELETE 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.user_id = auth.uid()
            AND om.role = 'admin'
        )
    );

-- SUBSCRIPTIONS POLICIES
-- Allow creation of subscriptions for new organizations
CREATE POLICY "subscriptions_insert_policy" ON subscriptions
    FOR INSERT 
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = subscriptions.organization_id
            AND om.user_id = auth.uid()
            AND om.role = 'admin'
        )
    );

-- Allow viewing subscriptions
CREATE POLICY "subscriptions_select_policy" ON subscriptions
    FOR SELECT 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = subscriptions.organization_id
            AND om.user_id = auth.uid()
        )
    );

-- Grant necessary permissions to authenticated users
GRANT ALL ON organizations TO authenticated;
GRANT ALL ON users TO authenticated;
GRANT ALL ON organization_members TO authenticated;
GRANT ALL ON subscriptions TO authenticated;

-- Ensure sequences are accessible
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;