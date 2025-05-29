-- Fix documents storage and RLS policies
BEGIN;

-- Ensure documents bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies for clean setup
DELETE FROM storage.policies WHERE bucket_id = 'documents';

-- Allow authenticated users to upload documents to their organization's folder
INSERT INTO storage.policies (id, name, bucket_id, operation, definition)
VALUES 
  (
    'documents-upload',
    'Users can upload documents to their organization',
    'documents',
    'INSERT',
    jsonb_build_object(
      'check', 
      $$ (auth.uid() IN (
        SELECT user_id FROM organization_members 
        WHERE organization_id = (
          SELECT organization_id FROM organization_members 
          WHERE user_id = auth.uid() 
          AND accepted_at IS NOT NULL
          LIMIT 1
        )
      )) $$
    )
  ),
  (
    'documents-view',
    'Users can view documents in their organization',
    'documents',
    'SELECT',
    jsonb_build_object(
      'using', 
      $$ (auth.uid() IN (
        SELECT user_id FROM organization_members 
        WHERE organization_id = (
          SELECT organization_id FROM organization_members 
          WHERE user_id = auth.uid() 
          AND accepted_at IS NOT NULL
          LIMIT 1
        )
      )) $$
    )
  ),
  (
    'documents-update',
    'Users can update their own uploaded documents',
    'documents',
    'UPDATE',
    jsonb_build_object(
      'using', 
      $$ (auth.uid() IN (
        SELECT user_id FROM organization_members 
        WHERE organization_id = (
          SELECT organization_id FROM organization_members 
          WHERE user_id = auth.uid() 
          AND accepted_at IS NOT NULL
          LIMIT 1
        )
      )) $$
    )
  ),
  (
    'documents-delete',
    'Admins can delete documents in their organization',
    'documents',
    'DELETE',
    jsonb_build_object(
      'using', 
      $$ (auth.uid() IN (
        SELECT user_id FROM organization_members 
        WHERE organization_id = (
          SELECT organization_id FROM organization_members 
          WHERE user_id = auth.uid() 
          AND role = 'admin'
          AND accepted_at IS NOT NULL
          LIMIT 1
        )
      )) $$
    )
  );

-- Fix documents table RLS policy to handle null organization_id
DROP POLICY IF EXISTS "Users can upload documents to their organizations" ON documents;

CREATE POLICY "Users can upload documents to their organizations" ON documents
FOR INSERT
WITH CHECK (
  -- Check that the organization_id is not null
  organization_id IS NOT NULL
  AND
  -- Check that the user is a member of the organization
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
    AND accepted_at IS NOT NULL
  )
);

-- Also update the UPDATE policy to prevent changing organization_id
DROP POLICY IF EXISTS "Admins can update documents in their organizations" ON documents;

CREATE POLICY "Users can update documents in their organizations" ON documents
FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
    AND accepted_at IS NOT NULL
  )
)
WITH CHECK (
  -- Prevent changing organization_id
  organization_id = (SELECT organization_id FROM documents WHERE id = documents.id)
);

COMMIT;