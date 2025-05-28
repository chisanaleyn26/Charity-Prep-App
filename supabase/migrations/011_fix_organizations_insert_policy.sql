-- Fix: Add missing INSERT policy for organizations table
-- This allows authenticated users to create new organizations during onboarding

-- First, drop the existing policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;

-- Create a new INSERT policy that allows authenticated users to create organizations
CREATE POLICY "Users can create organizations" ON organizations
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

-- Also ensure users can insert themselves as members when creating an org
DROP POLICY IF EXISTS "Users can add themselves as members" ON organization_members;

CREATE POLICY "Users can add themselves as members" ON organization_members
    FOR INSERT 
    WITH CHECK (
        auth.uid() = user_id 
        AND role = 'admin'
    );

-- Add policy for users table insert (for profile creation)
DROP POLICY IF EXISTS "Users can create their profile" ON users;

CREATE POLICY "Users can create their profile" ON users
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Allow authenticated users to insert subscriptions for organizations they admin
DROP POLICY IF EXISTS "Admins can create subscriptions" ON subscriptions;

CREATE POLICY "Admins can create subscriptions" ON subscriptions
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = subscriptions.organization_id
            AND organization_members.user_id = auth.uid()
            AND organization_members.role = 'admin'
        )
    );