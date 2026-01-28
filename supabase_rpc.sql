-- Remote Procedure Call (RPC) to increment points safely
create or replace function increment_points(row_id uuid, points_to_add int)
returns void
language plpgsql
security definer
as $$
begin
  update public.profiles
  set total_points = total_points + points_to_add
  where id = row_id;
end;
$$;
