-- Fix Streak Logic to be 0-indexed (Day 1 = 0) and reset correctly
create or replace function increment_points(row_id uuid, points_to_add int)
returns void
language plpgsql
security definer
as $$
declare
  user_last_active timestamp with time zone;
  user_streak int;
begin
  -- Get current user stats
  select last_active_at, current_streak into user_last_active, user_streak
  from public.profiles
  where id = row_id;
  
  -- Logic change requested:
  -- Day 1 of challenge = Streak 0
  -- Day 2 (Consecutive) = Streak 1
  -- Missed day = Reset to 0

  if user_last_active is null then
    -- Brand new user
    user_streak := 0; 
  elsif user_last_active::date = current_date then
    -- Already active today, keep streak as is
    user_streak := user_streak; 
  elsif user_last_active::date = (current_date - interval '1 day')::date then
    -- Was active yesterday, increment!
    user_streak := user_streak + 1;
  else
    -- Missed a day (or more), reset to 0 (Day 1 of new streak)
    user_streak := 0;
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
