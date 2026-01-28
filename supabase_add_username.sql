-- 1. Add username column (nullable first)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username text;

-- 2. Backfill existing users with a unique default
-- We use a combination of 'user_' and the first 8 chars of their UUID to ensure uniqueness
UPDATE public.profiles 
SET username = 'user_' || substr(id::text, 1, 8) 
WHERE username IS NULL;

-- 3. Add Unique Constraint
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_username_key UNIQUE (username);

-- 4. Set a Default Value so strictly defined Triggers don't fail on Insert
-- This generates a random 'user_xyz' backup if not provided
ALTER TABLE public.profiles 
ALTER COLUMN username SET DEFAULT 'user_' || substr(md5(random()::text), 1, 8);

-- 5. Now we can safely make it NOT NULL
ALTER TABLE public.profiles 
ALTER COLUMN username SET NOT NULL;
