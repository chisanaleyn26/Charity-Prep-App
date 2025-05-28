-- Migration: Create test auth function for debugging
-- Description: Simple function to test if user is authenticated

BEGIN;

-- Create simple test function for authentication
CREATE OR REPLACE FUNCTION test_create_org_simple(p_name VARCHAR)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Get user email if authenticated
  IF v_user_id IS NOT NULL THEN
    SELECT email INTO v_user_email 
    FROM auth.users 
    WHERE id = v_user_id;
  END IF;
  
  RETURN jsonb_build_object(
    'is_authenticated', v_user_id IS NOT NULL,
    'user_id', v_user_id,
    'user_email', v_user_email,
    'test_name', p_name,
    'timestamp', NOW()
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION test_create_org_simple TO authenticated;
GRANT EXECUTE ON FUNCTION test_create_org_simple TO anon;

COMMIT;