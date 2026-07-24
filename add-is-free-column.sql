-- Add is_free column to packs table if it doesn't exist
-- Run this in Supabase SQL Editor

-- Add the column (will fail silently if it already exists)
ALTER TABLE public.packs 
ADD COLUMN IF NOT EXISTS is_free BOOLEAN NOT NULL DEFAULT false;

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'packs' AND column_name = 'is_free';
