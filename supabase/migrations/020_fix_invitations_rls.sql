-- Fix invitations RLS policy to work with server-side API calls
BEGIN;

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Admins can create invitations" ON invitations;

-- Create a more flexible insert policy that works with both client and server contexts
CREATE POLICY "Admins can create invitations" ON invitations
FOR INSERT
WITH CHECK (
  -- Either the user is creating the invitation directly (client-side)
  (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
    AND invited_by = auth.uid()
  )
  OR
  -- Or the invitation is being created on behalf of an admin (server-side)
  (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = invited_by 
      AND role = 'admin'
    )
  )
);

-- Also ensure RLS is enabled
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

COMMIT;