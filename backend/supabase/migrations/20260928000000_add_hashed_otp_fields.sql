alter table public.users
  add column if not exists otp_hash text,
  add column if not exists otp_attempts integer not null default 0;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'users_otp_attempts_nonnegative_check'
      and conrelid = 'public.users'::regclass
  ) then
    alter table public.users
      add constraint users_otp_attempts_nonnegative_check check (otp_attempts >= 0);
  end if;
end
$$;