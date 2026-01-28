-- 1. Create Daily Quotes Table
create table if not exists public.daily_quotes (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  author text,
  active_date date
);

-- Enable RLS
alter table public.daily_quotes enable row level security;

-- Policy: Everyone can read quotes
create policy "Quotes are viewable by everyone."
  on daily_quotes for select
  using ( true );

-- 2. Insert Sample Quotes
insert into public.daily_quotes (content, author) values
  ('Believe you can and you''re halfway there.', 'Theodore Roosevelt'),
  ('Act as if what you do makes a difference. It does.', 'William James'),
  ('Success is not final, failure is not fatal: it is the courage to continue that counts.', 'Winston Churchill'),
  ('Your time is limited, don''t waste it living someone else''s life.', 'Steve Jobs'),
  ('The only way to do great work is to love what you do.', 'Steve Jobs');


-- 3. IMPROVED RPC: Handle Streaks + Points
create or replace function increment_points(row_id uuid, points_to_add int)
returns void
language plpgsql
security definer
as $$
declare
  user_last_active timestamp with time zone;
  user_streak int;
  is_consecutive_day boolean;
begin
  -- Get current user stats
  select last_active_at, current_streak into user_last_active, user_streak
  from public.profiles
  where id = row_id;

  -- Check if last active was yesterday (simple check)
  -- If last_active is null, it's day 1.
  -- If last_active < today - 1 day, reset to 1.
  -- If last_active is today, keep same.
  
  if user_last_active is null then
    user_streak := 1;
  elsif user_last_active::date = current_date then
    -- Already active today, do nothing to streak
    user_streak := user_streak; 
  elsif user_last_active::date = (current_date - interval '1 day')::date then
    -- Was active yesterday, increment!
    user_streak := user_streak + 1;
  else
    -- Missed a day (or more), reset :(
    user_streak := 1;
  end if;

  -- Update the profile
  update public.profiles
  set 
    total_points = total_points + points_to_add,
    current_streak = user_streak,
    last_active_at = now()
  where id = row_id;
end;
$$;
