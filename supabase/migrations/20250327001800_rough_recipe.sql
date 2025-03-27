/*
  # Add contact information to advice requests

  1. Changes
    - Add contact information columns to advice_requests table:
      - reporter_name (text)
      - reporter_email (text)
      - reporter_phone (text)
      - noted_by (text)

  2. Data Migration
    - Set default values for existing records
*/

ALTER TABLE advice_requests
ADD COLUMN reporter_name text,
ADD COLUMN reporter_email text,
ADD COLUMN reporter_phone text,
ADD COLUMN noted_by text;

-- Set default values for existing records
UPDATE advice_requests
SET 
  reporter_name = 'Unknown',
  reporter_email = 'unknown@example.com',
  reporter_phone = '00000000',
  noted_by = 'system@example.com'
WHERE reporter_name IS NULL;

-- Make the new columns required for future records
ALTER TABLE advice_requests
ALTER COLUMN reporter_name SET NOT NULL,
ALTER COLUMN reporter_email SET NOT NULL,
ALTER COLUMN reporter_phone SET NOT NULL,
ALTER COLUMN noted_by SET NOT NULL;