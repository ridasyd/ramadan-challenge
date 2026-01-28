-- 1. Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 2. Create Profiles Table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  total_points int default 0,
  current_streak int default 0,
  last_active_at timestamp with time zone,
  timezone text
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 3. Create Trigger to create profile on Signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Create Tasks Table
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  description text not null,
  points int not null default 10,
  active_date date default current_date
);

-- Enable RLS
alter table public.tasks enable row level security;

-- Policies for Tasks
create policy "Tasks are viewable by everyone."
  on tasks for select
  using ( true );

-- 5. Create User_Tasks Table (Tracking completions)
create table public.user_tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  task_id uuid references public.tasks(id) not null,
  completed_at timestamp with time zone default now(),
  unique(user_id, task_id)
);

-- Enable RLS
alter table public.user_tasks enable row level security;

-- Policies for User_Tasks
create policy "Users can see their own completions."
  on user_tasks for select
  using ( auth.uid() = user_id );

create policy "Users can mark tasks as complete."
  on user_tasks for insert
  with check ( auth.uid() = user_id );

-- 6. Insert some dummy tasks for today (optional)
insert into public.tasks (description, points, active_date)
values 
  ('Drink a glass of water', 10, current_date),
  ('Take a 5 minute stretch break', 15, current_date),
  ('Write down 3 things you are grateful for', 20, current_date);
