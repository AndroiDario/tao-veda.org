-- Formazione Tao Veda: nome del profilo e richieste per corsi a pagamento.

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

  insert into public.enrollments (user_id, course_id, status)
  values (new.id, 'via-tao-veda', 'active')
  on conflict (user_id, course_id) do nothing;

  return new;
end;
$$;

create policy "own enrollment request"
  on public.enrollments for insert
  with check (
    auth.uid() = user_id
    and status = 'pending_payment'
  );
