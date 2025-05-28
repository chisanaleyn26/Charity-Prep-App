-- Create a secure function to handle the entire onboarding process
-- This bypasses RLS issues by using SECURITY DEFINER

CREATE OR REPLACE FUNCTION create_organization_with_setup(
    p_name VARCHAR,
    p_charity_number VARCHAR,
    p_income_band organization_size,
    p_financial_year_end DATE,
    p_primary_email VARCHAR,
    p_phone VARCHAR DEFAULT NULL,
    p_website VARCHAR DEFAULT NULL,
    p_address_line1 VARCHAR DEFAULT NULL,
    p_city VARCHAR DEFAULT NULL,
    p_postcode VARCHAR DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT;
    v_org_id UUID;
    v_result JSON;
BEGIN
    -- Get the current user ID
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    
    -- Get user email
    SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;
    
    -- Start transaction
    BEGIN
        -- 1. Ensure user profile exists
        INSERT INTO users (id, email, created_at)
        VALUES (v_user_id, v_user_email, NOW())
        ON CONFLICT (id) DO NOTHING;
        
        -- 2. Create the organization
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
            postcode
        ) VALUES (
            p_name,
            NULLIF(p_charity_number, ''),
            p_income_band,
            p_financial_year_end,
            p_primary_email,
            NULLIF(p_phone, ''),
            NULLIF(p_website, ''),
            NULLIF(p_address_line1, ''),
            NULLIF(p_city, ''),
            NULLIF(p_postcode, '')
        ) RETURNING id INTO v_org_id;
        
        -- 3. Create admin membership
        INSERT INTO organization_members (
            organization_id,
            user_id,
            role,
            accepted_at
        ) VALUES (
            v_org_id,
            v_user_id,
            'admin',
            NOW()
        );
        
        -- 4. Create trial subscription
        INSERT INTO subscriptions (
            organization_id,
            tier,
            status,
            current_period_start,
            current_period_end,
            trial_ends_at
        ) VALUES (
            v_org_id,
            'essentials',
            'trialing',
            NOW(),
            NOW() + INTERVAL '14 days',
            NOW() + INTERVAL '14 days'
        );
        
        -- Build success response
        v_result := json_build_object(
            'success', true,
            'organization_id', v_org_id,
            'message', 'Organization created successfully'
        );
        
        RETURN v_result;
        
    EXCEPTION
        WHEN OTHERS THEN
            -- Rollback happens automatically
            RETURN json_build_object(
                'success', false,
                'error', SQLERRM,
                'detail', SQLSTATE
            );
    END;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_organization_with_setup TO authenticated;

-- Also create a simple version for testing
CREATE OR REPLACE FUNCTION test_auth_context()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN json_build_object(
        'user_id', auth.uid(),
        'user_email', auth.email(),
        'is_authenticated', auth.uid() IS NOT NULL
    );
END;
$$;

GRANT EXECUTE ON FUNCTION test_auth_context TO authenticated;