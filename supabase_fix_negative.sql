create or replace function increment_points(row_id uuid, points_to_add int)
returns void
language plpgsql
security definer
as $$
declare
  user_last_active timestamp with time zone;
  user_streak int;
  is_consecutive_day boolean;
  current_total_points int;
begin
  -- Get current user stats
  select last_active_at, current_streak, total_points into user_last_active, user_streak, current_total_points
  from public.profiles
  where id = row_id;
  
  -- Handle Streak Logic (ONLY if adding points, i.e., completing a task)
  if points_to_add > 0 then
      if user_last_active is null then
        user_streak := 1;
      elsif user_last_active::date = current_date then
        user_streak := user_streak; 
      elsif user_last_active::date = (current_date - interval '1 day')::date then
        user_streak := user_streak + 1;
      else
        user_streak := 1;
      end if;
  end if;

  -- Update the profile
  -- Ensure points don't go below 0
  update public.profiles
  set 
    total_points = greatest(0, total_points + points_to_add),
    current_streak = coalesce(user_streak, current_streak),
    last_active_at = case when points_to_add > 0 then now() else last_active_at end
  where id = row_id;
end;
$$;
