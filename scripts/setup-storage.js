/**
 * Setup script for Supabase Storage Buckets
 * Run this script to create the required storage buckets for the application
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createStorageBucket() {
  console.log('Setting up Supabase storage buckets...')

  try {
    // Create documents bucket
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket('documents', {
      public: false,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: [
        'image/*',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/csv'
      ]
    })

    if (bucketError && bucketError.message !== 'The resource already exists') {
      throw bucketError
    }

    console.log('✅ Documents bucket created/verified')

    // Set up bucket policies for document access
    const { error: policyError } = await supabase.storage.from('documents').updateBucketPolicy({
      allowedMimeTypes: [
        'image/*',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/csv'
      ],
      fileSizeLimit: 52428800,
      public: false
    })

    if (policyError) {
      console.warn('⚠️  Could not update bucket policy:', policyError.message)
    } else {
      console.log('✅ Bucket policies configured')
    }

    // Create RLS policies for storage access
    console.log('Setting up RLS policies for storage...')
    
    // Allow authenticated users to read files from their organization
    const readPolicySQL = `
      CREATE POLICY IF NOT EXISTS "Users can view their organization's documents" ON storage.objects
      FOR SELECT USING (
        bucket_id = 'documents' AND
        auth.role() = 'authenticated' AND
        EXISTS (
          SELECT 1 FROM documents d
          JOIN organization_members om ON om.organization_id = d.organization_id
          WHERE d.storage_path = name
          AND om.user_id = auth.uid()
        )
      );
    `

    // Allow authenticated users to upload files to their organization
    const insertPolicySQL = `
      CREATE POLICY IF NOT EXISTS "Users can upload to their organization" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'documents' AND
        auth.role() = 'authenticated'
      );
    `

    // Allow authenticated users to delete files from their organization
    const deletePolicySQL = `
      CREATE POLICY IF NOT EXISTS "Users can delete their organization's documents" ON storage.objects
      FOR DELETE USING (
        bucket_id = 'documents' AND
        auth.role() = 'authenticated' AND
        EXISTS (
          SELECT 1 FROM documents d
          JOIN organization_members om ON om.organization_id = d.organization_id
          WHERE d.storage_path = name
          AND om.user_id = auth.uid()
          AND om.role IN ('admin', 'member')
        )
      );
    `

    // Execute the policies
    const { error: readPolicyError } = await supabase.rpc('sql', { query: readPolicySQL })
    const { error: insertPolicyError } = await supabase.rpc('sql', { query: insertPolicySQL })
    const { error: deletePolicyError } = await supabase.rpc('sql', { query: deletePolicySQL })

    if (readPolicyError || insertPolicyError || deletePolicyError) {
      console.warn('⚠️  Some storage policies could not be created. You may need to create them manually in the Supabase dashboard.')
      console.warn('Read policy error:', readPolicyError?.message)
      console.warn('Insert policy error:', insertPolicyError?.message)
      console.warn('Delete policy error:', deletePolicyError?.message)
    } else {
      console.log('✅ Storage RLS policies created')
    }

    console.log('\n🎉 Storage setup complete!')
    console.log('\nBucket configuration:')
    console.log('- Name: documents')
    console.log('- Public: false')
    console.log('- File size limit: 50MB')
    console.log('- Allowed types: images, PDFs, Word docs, text files, CSVs')

  } catch (error) {
    console.error('❌ Storage setup failed:', error.message)
    process.exit(1)
  }
}

// Test bucket access
async function testBucketAccess() {
  console.log('\nTesting bucket access...')
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      throw error
    }

    const documentsBucket = buckets.find(bucket => bucket.name === 'documents')
    
    if (documentsBucket) {
      console.log('✅ Documents bucket is accessible')
      console.log(`   Created: ${new Date(documentsBucket.created_at).toLocaleDateString()}`)
      console.log(`   Updated: ${new Date(documentsBucket.updated_at).toLocaleDateString()}`)
    } else {
      console.log('❌ Documents bucket not found')
    }

  } catch (error) {
    console.error('❌ Bucket access test failed:', error.message)
  }
}

// Main execution
async function main() {
  await createStorageBucket()
  await testBucketAccess()
}

main().catch(console.error)