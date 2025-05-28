-- Relax the charity_number constraint to allow empty values and more flexible formats

-- First, drop the existing constraint
ALTER TABLE organizations 
DROP CONSTRAINT IF EXISTS chk_charity_number_format;

-- Add a new constraint that allows NULL or empty string, or valid charity numbers
ALTER TABLE organizations 
ADD CONSTRAINT chk_charity_number_format 
CHECK (
    charity_number IS NULL 
    OR charity_number = '' 
    OR charity_number ~ '^\d{6,8}(-\d{1,2})?$'
);