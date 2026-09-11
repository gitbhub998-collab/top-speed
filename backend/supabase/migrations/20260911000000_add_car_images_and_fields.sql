insert into storage.buckets (id, name, public)
values ('car-images', 'car-images', true)
on conflict (id) do update set public = true;

alter table public.cars add column if not exists engine jsonb;
alter table public.cars add column if not exists fuel_type text;
alter table public.cars add column if not exists drivetrain text;
alter table public.cars add column if not exists acceleration numeric;
alter table public.cars add column if not exists top_speed numeric;
alter table public.cars add column if not exists category text;
alter table public.cars add column if not exists external_id text;
alter table public.cars add column if not exists price numeric(12,2);
alter table public.cars add column if not exists description text;
alter table public.cars add column if not exists image_url text;
alter table public.cars add column if not exists updated_at timestamptz not null default now();