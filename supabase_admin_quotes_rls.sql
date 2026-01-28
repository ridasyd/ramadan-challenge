-- Fix RLS policies for daily_quotes to allow Admin access

-- 1. Enable RLS on daily_quotes (just in case)
alter table public.daily_quotes enable row level security;

-- 2. Drop existing policies to be clean
drop policy if exists "Enable read access for all users" on daily_quotes;
drop policy if exists "Admins can insert quotes" on daily_quotes;
drop policy if exists "Admins can delete quotes" on daily_quotes;

-- 3. Re-create Read Policy (Everyone can read)
create policy "Enable read access for all users" on daily_quotes
for select using (true);

-- 4. Create Write Policies (Only Admins)
create policy "Admins can insert quotes" on daily_quotes for insert 
with check (
  exists ( select 1 from profiles where id = auth.uid() and is_admin = true )
);

create policy "Admins can update quotes" on daily_quotes for update
using (
  exists ( select 1 from profiles where id = auth.uid() and is_admin = true )
);

create policy "Admins can delete quotes" on daily_quotes for delete
using (
  exists ( select 1 from profiles where id = auth.uid() and is_admin = true )
);
