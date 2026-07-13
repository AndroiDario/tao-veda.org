-- Formazione Tao Veda — migration 001: registrazione e iscrizioni
-- Da eseguire nel SQL Editor del progetto Supabase (una sola volta).
-- Modello: profili minimi + iscrizioni per corso con stato.
-- Il corso gratuito via-tao-veda viene attivato automaticamente alla
-- creazione dell'utente; con il magic link la sessione nasce solo dopo
-- il clic sul link email, quindi l'accesso richiede email verificata.

create type public.enrollment_status as enum (
  'pending_payment',
  'active',
  'completed',
  'revoked'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  display_name text
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id text not null,
  status public.enrollment_status not null default 'pending_payment',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  note text,
  unique (user_id, course_id)
);

alter table public.profiles enable row level security;
alter table public.enrollments enable row level security;

-- Gli utenti leggono solo le proprie righe. Nessuna policy di
-- scrittura utente: le scritture avvengono via trigger (security
-- definer) e dalla dashboard Supabase (service role).
create policy "own profile read"
  on public.profiles for select
  using (auth.uid() = id);

create policy "own profile update"
  on public.profiles for update
  using (auth.uid() = id);

create policy "own enrollments read"
  on public.enrollments for select
  using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  -- Corso gratuito: iscrizione attiva alla registrazione.
  insert into public.enrollments (user_id, course_id, status)
  values (new.id, 'via-tao-veda', 'active');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger enrollments_touch_updated_at
  before update on public.enrollments
  for each row execute function public.touch_updated_at();
