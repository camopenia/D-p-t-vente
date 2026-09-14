-- Visites et essais : disponibilités du vendeur, créneaux proposés, frais de plateforme, délai de réponse 48 h

-- (1) À exécuter seul, dans une transaction séparée :
--     alter type ventes_visit_status add value if not exists 'expired';
-- (2) Puis le reste :

-- Disponibilités hebdomadaires type du vendeur : {"1":["matin","apres_midi"],"6":["soiree"]} (1 = lundi … 7 = dimanche)
alter table public.ventes_listings add column if not exists visit_availability jsonb not null default '{}'::jsonb;

alter table public.ventes_visit_requests
  add column if not exists slots jsonb not null default '[]'::jsonb,
  add column if not exists chosen_slot jsonb,
  add column if not exists expires_at timestamptz,
  add column if not exists fee_cents integer not null default 1000,
  add column if not exists payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'waived', 'refunded')),
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists paid_at timestamptz;
create index if not exists ventes_visit_requests_expires on public.ventes_visit_requests (status, expires_at) where status = 'pending';

drop policy if exists "visits: lire les siennes" on public.ventes_visit_requests;
create policy "visits: lire les siennes" on public.ventes_visit_requests for select
  using (auth.uid() = buyer_id or (auth.uid() = seller_id and payment_status in ('paid', 'waived')));

create or replace function public.ventes_expire_visit_requests()
returns setof public.ventes_visit_requests language sql security definer set search_path = public as $$
  update public.ventes_visit_requests
     set status = 'expired', seller_reply = coalesce(seller_reply, 'Sans réponse du vendeur dans le délai de 48 h.')
   where status = 'pending' and expires_at is not null and expires_at < now() and payment_status in ('paid', 'waived')
  returning *;
$$;
revoke execute on function public.ventes_expire_visit_requests() from public, anon;
