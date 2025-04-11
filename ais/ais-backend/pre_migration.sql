-- Add a temporary phone column that allows nulls
ALTER TABLE users ADD COLUMN phone VARCHAR;

-- Update existing users with placeholder phone numbers
UPDATE users SET phone = 'temp_' || id || '_' || REPLACE(email, '@', '_at_');

-- Set the non-null constraint after populating data
ALTER TABLE users ALTER COLUMN phone SET NOT NULL;