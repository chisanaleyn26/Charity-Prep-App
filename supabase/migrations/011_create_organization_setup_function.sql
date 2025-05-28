-- Migration: Create organization setup function
-- Description: RPC function to create organization and ensure user membership with proper details

BEGIN;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS create_organization_with_setup;

-- Create the function that the onboarding page is calling
CREATE OR REPLACE FUNCTION create_organization_with_setup(
  p_name VARCHAR,
  p_charity_number VARCHAR DEFAULT NULL,
  p_income_band VARCHAR,
  p_financial_year_end DATE,
  p_primary_email VARCHAR,
  p_phone VARCHAR DEFAULT NULL,
  p_website VARCHAR DEFAULT NULL,
  p_address_line1 VARCHAR DEFAULT NULL,
  p_city VARCHAR DEFAULT NULL,
  p_postcode VARCHAR DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_org_id UUID;
  v_subscription_id UUID;
  v_error_message TEXT;
BEGIN
  -- Get the current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not authenticated'
    );
  END IF;
  
  -- Get user email from auth
  SELECT email INTO v_user_email 
  FROM auth.users 
  WHERE id = v_user_id;
  
  -- Start transaction
  BEGIN
    -- Ensure user record exists in public.users table
    INSERT INTO users (id, email, created_at, updated_at)
    VALUES (v_user_id, v_user_email, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE
    SET 
      email = EXCLUDED.email,
      updated_at = NOW(),
      last_login_at = NOW();
    
    -- Create the organization
    INSERT INTO organizations (
      name,
      charity_number,
      income_band,
      financial_year_end,
      primary_email,
      phone,
      website,
      address_line1,
      city,
      postcode,
      created_at,
      updated_at
    ) VALUES (
      p_name,
      NULLIF(p_charity_number, ''),
      p_income_band::organization_size,
      p_financial_year_end,
      p_primary_email,
      NULLIF(p_phone, ''),
      NULLIF(p_website, ''),
      NULLIF(p_address_line1, ''),
      NULLIF(p_city, ''),
      NULLIF(p_postcode, ''),
      NOW(),
      NOW()
    ) RETURNING id INTO v_org_id;
    
    -- Create organization membership (user as admin)
    INSERT INTO organization_members (
      organization_id,
      user_id,
      role,
      accepted_at,
      created_at,
      updated_at
    ) VALUES (
      v_org_id,
      v_user_id,
      'admin'::user_role,
      NOW(),
      NOW(),
      NOW()
    );
    
    -- Create trial subscription
    INSERT INTO subscriptions (
      organization_id,
      tier,
      status,
      trial_ends_at,
      current_period_start,
      current_period_end,
      created_at,
      updated_at
    ) VALUES (
      v_org_id,
      'essentials'::subscription_tier,
      'trialing'::subscription_status,
      NOW() + INTERVAL '14 days',
      NOW(),
      NOW() + INTERVAL '14 days',
      NOW(),
      NOW()
    ) RETURNING id INTO v_subscription_id;
    
    -- Return success with organization details
    RETURN jsonb_build_object(
      'success', true,
      'organization_id', v_org_id,
      'subscription_id', v_subscription_id,
      'user_role', 'admin',
      'trial_ends_at', (NOW() + INTERVAL '14 days')::TEXT
    );
    
  EXCEPTION
    WHEN unique_violation THEN
      GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Organization with this charity number already exists'
      );
    WHEN check_violation THEN
      GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
      IF v_error_message LIKE '%chk_charity_number_format%' THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', 'Invalid charity number format. Must be 6-8 digits, optionally followed by hyphen and 1-2 digits'
        );
      ELSIF v_error_message LIKE '%chk_year_end_valid%' THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', 'Financial year end must be on the 1st or 31st of a month'
        );
      ELSE
        RETURN jsonb_build_object(
          'success', false,
          'error', v_error_message
        );
      END IF;
    WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
      -- Rollback will happen automatically
      RETURN jsonb_build_object(
        'success', false,
        'error', v_error_message
      );
  END;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_organization_with_setup TO authenticated;

-- Create a function to get user's organizations with role
CREATE OR REPLACE FUNCTION get_user_organizations(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  organization_id UUID,
  organization_name VARCHAR,
  charity_number VARCHAR,
  user_role user_role,
  joined_at TIMESTAMPTZ,
  subscription_tier subscription_tier,
  subscription_status subscription_status
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.name,
    o.charity_number,
    om.role,
    om.accepted_at,
    s.tier,
    s.status
  FROM organizations o
  JOIN organization_members om ON o.id = om.organization_id
  LEFT JOIN subscriptions s ON o.id = s.organization_id
  WHERE om.user_id = COALESCE(p_user_id, auth.uid())
    AND o.deleted_at IS NULL
    AND om.accepted_at IS NOT NULL
  ORDER BY om.created_at DESC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_organizations TO authenticated;

-- Create helper function to check if user is member of organization
CREATE OR REPLACE FUNCTION is_organization_member(
  p_organization_id UUID,
  p_user_id UUID DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM organization_members 
    WHERE organization_id = p_organization_id
      AND user_id = COALESCE(p_user_id, auth.uid())
      AND accepted_at IS NOT NULL
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_organization_member TO authenticated;

COMMIT;