-- Supabase schema for Top Speed
create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('car-images', 'car-images', true)
on conflict (id) do update set public = true;

create table if not exists public.users (
  id uuid primary key,
  name text,
  email text unique not null,
  password_hash text not null,
  role text not null default 'user' check (role in ('user','admin')),
  is_active boolean not null default false,
  is_email_verified boolean not null default false,
  session_version integer not null default 0,
  otp text,
  otp_expires_at timestamptz,
  phone text,
  avatar_url text,
  preferences jsonb not null default '{"theme":"system","language":"en","motion":"full","notifications":{"serviceUpdates":true,"productNews":false}}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users add column if not exists session_version integer not null default 0;
alter table public.users add column if not exists phone text;
alter table public.users add column if not exists avatar_url text;
alter table public.users add column if not exists preferences jsonb not null default '{"theme":"system","language":"en","motion":"full","notifications":{"serviceUpdates":true,"productNews":false}}'::jsonb;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'users_preferences_object_check') then
    alter table public.users add constraint users_preferences_object_check check (jsonb_typeof(preferences) = 'object');
  end if;
end
$$;

create table if not exists public.cars (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  year int,
  horsepower int,
  torque int,
  engine jsonb,
  fuel_type text,
  drivetrain text,
  acceleration numeric,
  top_speed numeric,
  category text,
  external_id text,
  price numeric(12,2),
  description text,
  image_url text,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cars add column if not exists engine jsonb;
alter table public.cars add column if not exists fuel_type text;
alter table public.cars add column if not exists drivetrain text;
alter table public.cars add column if not exists acceleration numeric;
alter table public.cars add column if not exists top_speed numeric;
alter table public.cars add column if not exists category text;
alter table public.cars add column if not exists external_id text;
alter table public.cars add column if not exists image_url text;
alter table public.cars add column if not exists updated_at timestamptz not null default now();

create table if not exists public.modifications (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  type text not null,
  name text not null,
  description text,
  price numeric(12,2),
  horsepower int not null default 0,
  torque int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.modifications add column if not exists compatible_car_ids uuid[] not null default '{}';
alter table public.modifications add column if not exists description text;
alter table public.modifications add column if not exists category text not null default 'Other';
alter table public.modifications add column if not exists price_type text not null default 'fixed';
alter table public.modifications add column if not exists acceleration_delta numeric not null default 0;
alter table public.modifications add column if not exists top_speed_delta numeric not null default 0;
alter table public.modifications add column if not exists weight_delta numeric not null default 0;
alter table public.modifications add column if not exists availability text not null default 'unlimited';
alter table public.modifications add column if not exists stock integer;
alter table public.modifications add column if not exists is_active boolean not null default true;
alter table public.modifications add column if not exists requirements uuid[] not null default '{}';
alter table public.modifications add column if not exists conflicts uuid[] not null default '{}';

update public.modifications
set compatible_car_ids = array[car_id]
where car_id is not null and cardinality(compatible_car_ids) = 0;

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  request_type text not null,
  details text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(12,2) not null default 0 check (price >= 0),
  discount_percentage numeric(5,2) not null default 0 check (discount_percentage >= 0 and discount_percentage <= 100),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.package_modifications (
  package_id uuid not null references public.packages(id) on delete cascade,
  modification_id uuid not null references public.modifications(id) on delete cascade,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  primary key (package_id, modification_id)
);

create index if not exists package_modifications_modification_id_idx
  on public.package_modifications (modification_id);

create or replace function public.upsert_package(
  p_package jsonb,
  p_modification_ids uuid[] default '{}'
)
returns public.packages
language plpgsql
security definer
set search_path = public
as $$
declare
  package_row public.packages;
begin
  insert into public.packages (id, name, description, price, discount_percentage, image_url, is_active)
  values (
    coalesce((p_package->>'id')::uuid, gen_random_uuid()), p_package->>'name', p_package->>'description',
    coalesce((p_package->>'price')::numeric, 0), coalesce((p_package->>'discount_percentage')::numeric, 0),
    p_package->>'image_url', coalesce((p_package->>'is_active')::boolean, true)
  )
  on conflict (id) do update set name = excluded.name, description = excluded.description, price = excluded.price,
    discount_percentage = excluded.discount_percentage, image_url = excluded.image_url, is_active = excluded.is_active, updated_at = now()
  returning * into package_row;
  delete from public.package_modifications where package_id = package_row.id;
  insert into public.package_modifications (package_id, modification_id, sort_order)
  select package_row.id, modification_id, row_number() over () - 1 from unnest(coalesce(p_modification_ids, '{}')) as modification_id;
  return package_row;
end;
$$;

alter table public.users enable row level security;
alter table public.cars enable row level security;
alter table public.modifications enable row level security;
alter table public.service_requests enable row level security;
alter table public.packages enable row level security;
alter table public.package_modifications enable row level security;
revoke all on function public.upsert_package(jsonb, uuid[]) from public, anon, authenticated;
grant execute on function public.upsert_package(jsonb, uuid[]) to service_role;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'cars' and policyname = 'allow_public_read_cars'
  ) then
    create policy allow_public_read_cars on public.cars
      for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'service_requests' and policyname = 'allow_public_insert_service_requests'
  ) then
    create policy allow_public_insert_service_requests on public.service_requests
      for insert with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'packages' and policyname = 'allow_public_read_active_packages'
  ) then
    create policy allow_public_read_active_packages on public.packages
      for select using (is_active = true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'package_modifications' and policyname = 'allow_public_read_package_modifications'
  ) then
    create policy allow_public_read_package_modifications on public.package_modifications
      for select using (exists (select 1 from public.packages where packages.id = package_modifications.package_id and packages.is_active = true));
  end if;
end
$$;
