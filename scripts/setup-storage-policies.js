const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupStoragePolicies() {
  console.log('Setting up storage policies for documents bucket...\n');
  
  try {
    // First, ensure the bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('Error listing buckets:', bucketError);
      return;
    }
    
    const documentsBucket = buckets.find(b => b.name === 'documents');
    
    if (!documentsBucket) {
      console.log('Creating documents bucket...');
      const { data, error } = await supabase.storage.createBucket('documents', {
        public: false,
        allowedMimeTypes: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        fileSizeLimit: 52428800 // 50MB
      });
      
      if (error) {
        console.error('Error creating bucket:', error);
        return;
      }
      console.log('✅ Documents bucket created');
    } else {
      console.log('✅ Documents bucket already exists');
    }
    
    // Note: Storage policies in Supabase are managed through SQL RLS policies
    // The actual RLS policies need to be applied via SQL
    console.log('\nStorage RLS policies need to be applied via SQL migration.');
    console.log('Use the Supabase dashboard or apply the following SQL:\n');
    
    const storagePoliciesSQL = `
-- Storage Object Policies for documents bucket
BEGIN;

-- Allow users to upload files to documents bucket
CREATE POLICY "Users can upload documents 1jfj0_0" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid() IN (
    SELECT user_id FROM organization_members 
    WHERE accepted_at IS NOT NULL
  )
);

-- Allow users to view their organization's documents
CREATE POLICY "Users can view organization documents 1jfj0_1" ON storage.objects
FOR SELECT 
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid() IN (
    SELECT user_id FROM organization_members 
    WHERE accepted_at IS NOT NULL
  )
);

-- Allow users to update their own uploads
CREATE POLICY "Users can update own documents 1jfj0_2" ON storage.objects
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid() IN (
    SELECT user_id FROM organization_members 
    WHERE accepted_at IS NOT NULL
  )
);

-- Allow admins to delete documents
CREATE POLICY "Admins can delete documents 1jfj0_3" ON storage.objects
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid() IN (
    SELECT user_id FROM organization_members 
    WHERE role = 'admin' AND accepted_at IS NOT NULL
  )
);

COMMIT;
`;
    
    console.log(storagePoliciesSQL);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

setupStoragePolicies();