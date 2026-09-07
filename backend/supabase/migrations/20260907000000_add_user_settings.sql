alter table public.users
  add column if not exists phone text,
  add column if not exists avatar_url text,
  add column if not exists preferences jsonb not null default '{"theme":"system","language":"en","motion":"full","notifications":{"serviceUpdates":true,"productNews":false}}'::jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'users_preferences_object_check'
  ) then
    alter table public.users
      add constraint users_preferences_object_check
      check (jsonb_typeof(preferences) = 'object');
  end if;
end
$$;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;