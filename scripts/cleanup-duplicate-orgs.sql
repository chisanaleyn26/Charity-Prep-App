-- Script to identify and help clean up duplicate organizations
-- Run these queries to analyze the duplicate organization situation

-- 1. Find users with multiple organizations
SELECT 
  u.id as user_id,
  u.email,
  COUNT(om.id) as org_count,
  array_agg(o.name ORDER BY om.created_at DESC) as org_names,
  array_agg(o.id ORDER BY om.created_at DESC) as org_ids,
  array_agg(o.charity_number ORDER BY om.created_at DESC) as charity_numbers
FROM users u
JOIN organization_members om ON u.id = om.user_id
JOIN organizations o ON om.organization_id = o.id
WHERE om.accepted_at IS NOT NULL
GROUP BY u.id, u.email
HAVING COUNT(om.id) > 1
ORDER BY COUNT(om.id) DESC;

-- 2. Find organizations with same name for same user (likely duplicates)
WITH user_org_duplicates AS (
  SELECT 
    om.user_id,
    o.name as org_name,
    COUNT(*) as duplicate_count,
    array_agg(o.id ORDER BY o.created_at DESC) as org_ids,
    array_agg(o.created_at ORDER BY o.created_at DESC) as created_dates
  FROM organization_members om
  JOIN organizations o ON om.organization_id = o.id
  WHERE om.accepted_at IS NOT NULL
  GROUP BY om.user_id, o.name
  HAVING COUNT(*) > 1
)
SELECT 
  u.email,
  uod.org_name,
  uod.duplicate_count,
  uod.org_ids[1] as newest_org_id,
  uod.org_ids[2:] as older_org_ids,
  uod.created_dates[1] as newest_created,
  uod.created_dates[2] as second_newest_created
FROM user_org_duplicates uod
JOIN users u ON uod.user_id = u.id
ORDER BY uod.duplicate_count DESC;

-- 3. Check which organizations have data
WITH org_data_summary AS (
  SELECT 
    o.id,
    o.name,
    o.created_at,
    (SELECT COUNT(*) FROM safeguarding_records WHERE organization_id = o.id) as safeguarding_count,
    (SELECT COUNT(*) FROM overseas_activities WHERE organization_id = o.id) as overseas_count,
    (SELECT COUNT(*) FROM income_records WHERE organization_id = o.id) as income_count,
    (SELECT COUNT(*) FROM fundraising_events WHERE organization_id = o.id) as events_count,
    (SELECT COUNT(*) FROM documents WHERE organization_id = o.id) as documents_count,
    (SELECT COUNT(*) FROM subscriptions WHERE organization_id = o.id AND status = 'active') as active_subscriptions
  FROM organizations o
)
SELECT 
  ods.*,
  (safeguarding_count + overseas_count + income_count + events_count + documents_count) as total_records,
  om.user_id,
  u.email
FROM org_data_summary ods
JOIN organization_members om ON ods.id = om.organization_id
JOIN users u ON om.user_id = u.id
WHERE om.accepted_at IS NOT NULL
ORDER BY u.email, ods.created_at DESC;

-- 4. Suggested cleanup strategy (DO NOT RUN WITHOUT REVIEW)
-- This identifies which orgs to keep (newest with data) and which to remove

WITH org_rankings AS (
  SELECT 
    o.id,
    o.name,
    om.user_id,
    o.created_at,
    ROW_NUMBER() OVER (PARTITION BY om.user_id ORDER BY 
      -- Prioritize orgs with data
      CASE WHEN EXISTS (SELECT 1 FROM safeguarding_records WHERE organization_id = o.id) THEN 1 ELSE 0 END +
      CASE WHEN EXISTS (SELECT 1 FROM overseas_activities WHERE organization_id = o.id) THEN 1 ELSE 0 END +
      CASE WHEN EXISTS (SELECT 1 FROM income_records WHERE organization_id = o.id) THEN 1 ELSE 0 END +
      CASE WHEN EXISTS (SELECT 1 FROM documents WHERE organization_id = o.id) THEN 1 ELSE 0 END DESC,
      -- Then by newest
      o.created_at DESC
    ) as org_rank
  FROM organizations o
  JOIN organization_members om ON o.id = om.organization_id
  WHERE om.accepted_at IS NOT NULL
)
SELECT 
  u.email,
  or1.id as org_id,
  or1.name,
  or1.created_at,
  CASE WHEN or1.org_rank = 1 THEN 'KEEP' ELSE 'REMOVE' END as suggested_action,
  or1.org_rank
FROM org_rankings or1
JOIN users u ON or1.user_id = u.id
WHERE EXISTS (
  SELECT 1 FROM org_rankings or2 
  WHERE or2.user_id = or1.user_id 
  GROUP BY or2.user_id 
  HAVING COUNT(*) > 1
)
ORDER BY u.email, or1.org_rank;

-- 5. Example cleanup commands (REVIEW CAREFULLY BEFORE RUNNING)
-- These would remove duplicate empty organizations

/*
-- First, verify which orgs would be deleted
SELECT o.id, o.name, u.email, o.created_at
FROM organizations o
JOIN organization_members om ON o.id = om.organization_id
JOIN users u ON om.user_id = u.id
WHERE o.id IN (
  -- List of org IDs to remove from step 4
  'org-id-1',
  'org-id-2'
)
ORDER BY u.email, o.created_at;

-- Then delete memberships first (due to foreign key)
DELETE FROM organization_members 
WHERE organization_id IN ('org-id-1', 'org-id-2');

-- Finally delete the organizations
DELETE FROM organizations 
WHERE id IN ('org-id-1', 'org-id-2');
*/