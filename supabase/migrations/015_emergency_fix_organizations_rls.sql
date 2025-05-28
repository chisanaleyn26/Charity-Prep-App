-- EMERGENCY FIX: Allow all authenticated users to create organizations
-- Run this immediately in Supabase SQL editor

-- Drop ALL existing policies on organizations to start fresh
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'organizations' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON organizations', pol.policyname);
    END LOOP;
END $$;

-- Create a single, simple policy that allows everything for authenticated users
CREATE POLICY "authenticated_users_all_operations" ON organizations
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Verify the policy was created
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'organizations'
AND schemaname = 'public';

-- Also ensure the sequences and functions work
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;