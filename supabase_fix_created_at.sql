-- Add created_at columns for sorting
alter table public.tasks 
add column if not exists created_at timestamp with time zone default now();

alter table public.daily_quotes 
add column if not exists created_at timestamp with time zone default now();
