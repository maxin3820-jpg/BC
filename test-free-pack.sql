-- TEST: Mark a pack as free
-- Run this in Supabase SQL Editor to test

-- Step 1: Check current packs and their is_free status
SELECT id, title, price, is_free 
FROM public.packs 
ORDER BY id;

-- Step 2: Update the first pack to be free (change the id if needed)
UPDATE public.packs 
SET is_free = true 
WHERE id = 1;

-- Step 3: Verify the update
SELECT id, title, price, is_free 
FROM public.packs 
WHERE is_free = true;
