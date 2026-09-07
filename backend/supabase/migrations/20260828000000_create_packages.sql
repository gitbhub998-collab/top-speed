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
    coalesce((p_package->>'id')::uuid, gen_random_uuid()),
    p_package->>'name',
    p_package->>'description',
    coalesce((p_package->>'price')::numeric, 0),
    coalesce((p_package->>'discount_percentage')::numeric, 0),
    p_package->>'image_url',
    coalesce((p_package->>'is_active')::boolean, true)
  )
  on conflict (id) do update set
    name = excluded.name,
    description = excluded.description,
    price = excluded.price,
    discount_percentage = excluded.discount_percentage,
    image_url = excluded.image_url,
    is_active = excluded.is_active,
    updated_at = now()
  returning * into package_row;

  delete from public.package_modifications where package_id = package_row.id;
  insert into public.package_modifications (package_id, modification_id, sort_order)
  select package_row.id, modification_id, row_number() over () - 1
  from unnest(coalesce(p_modification_ids, '{}')) as modification_id;

  return package_row;
end;
$$;

alter table public.packages enable row level security;
alter table public.package_modifications enable row level security;

revoke all on function public.upsert_package(jsonb, uuid[]) from public, anon, authenticated;
grant execute on function public.upsert_package(jsonb, uuid[]) to service_role;

do $$
begin
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
      for select using (
        exists (
          select 1 from public.packages
          where packages.id = package_modifications.package_id and packages.is_active = true
        )
      );
  end if;
end
$$;