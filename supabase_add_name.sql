-- Add display_name column to profiles table
alter table public.profiles 
add column if not exists display_name text;

-- (Optional) Policy update not needed as "Users can update own profile" already covers all columns.
