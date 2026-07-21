-- Formazione Tao Veda — migration 002: nome profilo e richieste di iscrizione
-- ARCHIVIO STORICO: la fonte canonica è ora
-- supabase/migrations/20260713000200_formazione_profili_iscrizioni.sql.
-- Non eseguire questo file su un progetto già configurato.
-- Da eseguire dopo formazione-001-registrazione.sql.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), '')
  )
  on conflict (id) do nothing;

  -- Il percorso fondativo è accessibile con registrazione e donazione libera.
  insert into public.enrollments (user_id, course_id, status)
  values (new.id, 'via-tao-veda', 'active')
  on conflict (user_id, course_id) do nothing;

  return new;
end;
$$;

-- Un utente autenticato può richiedere un proprio corso a pagamento.
-- Lo stato può nascere soltanto come pending_payment; active, completed e
-- revoked restano gestiti dalla dashboard Supabase.
drop policy if exists "own enrollment request" on public.enrollments;

create policy "own enrollment request"
  on public.enrollments for insert
  with check (
    auth.uid() = user_id
    and status = 'pending_payment'
  );
