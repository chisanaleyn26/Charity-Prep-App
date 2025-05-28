-- Test script to check RLS policies
-- Run this in Supabase SQL editor to debug

-- Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('organizations', 'users', 'organization_members', 'subscriptions');

-- List all policies on organizations table
SELECT 
    pol.polname AS policy_name,
    pol.polcmd AS command,
    pol.polroles::regrole[] AS roles,
    CASE 
        WHEN pol.polpermissive THEN 'PERMISSIVE'
        ELSE 'RESTRICTIVE'
    END AS type,
    pg_get_expr(pol.polqual, pol.polrelid) AS using_expression,
    pg_get_expr(pol.polwithcheck, pol.polrelid) AS check_expression
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
JOIN pg_namespace nsp ON cls.relnamespace = nsp.oid
WHERE nsp.nspname = 'public'
AND cls.relname = 'organizations'
ORDER BY pol.polname;

-- Check current user
SELECT auth.uid(), auth.email();

-- Test if current user can insert into organizations
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
INSERT INTO organizations (
    name,
    income_band,
    financial_year_end,
    primary_email
) VALUES (
    'Test Organization',
    'small',
    '2024-03-31',
    'test@example.com'
);