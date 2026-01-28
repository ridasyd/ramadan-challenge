-- 1. Add is_admin to profiles
alter table public.profiles 
add column if not exists is_admin boolean default false;

-- 2. Update tasks table for recurring logic
alter table public.tasks
add column if not exists day_of_week int, -- 0 = Sunday, 1 = Monday, etc.
add column if not exists is_recurring boolean default false;

-- 3. Update Policies for Tasks table

-- Allow Read access to everyone (already exists, but ensuring)
drop policy if exists "Enable read access for all users" on tasks;
create policy "Enable read access for all users" on tasks for select using (true);

-- Allow Insert/Update/Delete ONLY for Admins
create policy "Admins can insert tasks" on tasks for insert 
with check (
  exists ( select 1 from profiles where id = auth.uid() and is_admin = true )
);

create policy "Admins can update tasks" on tasks for update
using (
  exists ( select 1 from profiles where id = auth.uid() and is_admin = true )
);

create policy "Admins can delete tasks" on tasks for delete
using (
  exists ( select 1 from profiles where id = auth.uid() and is_admin = true )
);

-- 4. Set current user as Admin (IMPORTANT: Replace email with your actual email if running manually, 
-- or we can provide a helper function).
-- For now, we will create a function to claim admin for the current user for ease of setup.
create or replace function claim_admin_access()
returns void
language plpgsql
security definer
as $$
begin
  update public.profiles
  set is_admin = true
  where id = auth.uid();
end;
$$;
