-- Fix: Add missing INSERT policy for organizations table
-- This allows authenticated users to create new organizations during onboarding

CREATE POLICY "Authenticated users can create organizations" ON organizations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);