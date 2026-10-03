alter table public.users
  add column if not exists password_reset_otp_hash text,
  add column if not exists password_reset_attempts integer not null default 0,
  add column if not exists password_reset_expires_at timestamptz,
  add column if not exists password_reset_authorization_hash text,
  add column if not exists password_reset_authorization_expires_at timestamptz,
  add column if not exists password_reset_request_window_started_at timestamptz,
  add column if not exists password_reset_request_count integer not null default 0;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'users_password_reset_attempts_nonnegative_check'
      and conrelid = 'public.users'::regclass
  ) then
    alter table public.users
      add constraint users_password_reset_attempts_nonnegative_check
      check (password_reset_attempts >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'users_password_reset_request_count_nonnegative_check'
      and conrelid = 'public.users'::regclass
  ) then
    alter table public.users
      add constraint users_password_reset_request_count_nonnegative_check
      check (password_reset_request_count >= 0);
  end if;
end
$$;

create unique index if not exists users_password_reset_authorization_hash_idx
  on public.users (password_reset_authorization_hash)
  where password_reset_authorization_hash is not null;