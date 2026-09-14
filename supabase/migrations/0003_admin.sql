-- Back-office de modération : rôle admin, journal, politiques RLS élargies

alter table public.ventes_profiles add column if not exists is_admin boolean not null default false;
alter table public.ventes_profiles add column if not exists is_blocked boolean not null default false;
alter table public.ventes_profiles add column if not exists verification_note text;

create or replace function public.ventes_is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.ventes_profiles where id = auth.uid()), false);
$$;

-- Journal des actions de modération
create table if not exists public.ventes_moderation_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.ventes_profiles (id) on delete set null,
  target_type text not null check (target_type in ('listing', 'profile', 'report', 'user')),
  target_id uuid not null,
  action text not null,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists moderation_log_target on public.ventes_moderation_log (target_type, target_id, created_at desc);
alter table public.ventes_moderation_log enable row level security;
create policy "moderation_log: admins" on public.ventes_moderation_log for all using (public.ventes_is_admin()) with check (public.ventes_is_admin());

-- Motif de refus visible par le vendeur
alter table public.ventes_listings add column if not exists moderation_note text;

-- Annonces : les admins voient et modifient tout
create policy "listings: admin lecture" on public.ventes_listings for select using (public.ventes_is_admin());
create policy "listings: admin modification" on public.ventes_listings for update using (public.ventes_is_admin()) with check (true);
create policy "listings: admin suppression" on public.ventes_listings for delete using (public.ventes_is_admin());

-- Profils : les admins peuvent vérifier / bloquer ; les membres ne peuvent pas s'auto-promouvoir
create policy "profiles: admin modification" on public.ventes_profiles for update using (public.ventes_is_admin()) with check (true);

create or replace function public.ventes_protect_profile_flags()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.ventes_is_admin() then
    new.is_admin := old.is_admin;
    new.is_verified := old.is_verified;
    new.is_blocked := old.is_blocked;
    new.verification_note := old.verification_note;
  end if;
  return new;
end;
$$;
drop trigger if exists profiles_protect_flags on public.ventes_profiles;
create trigger profiles_protect_flags before update on public.ventes_profiles for each row execute procedure public.ventes_protect_profile_flags();

-- Signalements : les admins lisent et traitent tout
create policy "reports: admin lecture" on public.ventes_reports for select using (public.ventes_is_admin());
create policy "reports: admin modification" on public.ventes_reports for update using (public.ventes_is_admin()) with check (true);
alter table public.ventes_reports add column if not exists resolved_by uuid references public.ventes_profiles (id) on delete set null;
alter table public.ventes_reports add column if not exists resolved_at timestamptz;
alter table public.ventes_reports add column if not exists resolution_note text;

-- Abonnements et visites : lecture admin
create policy "subscriptions: admin lecture" on public.ventes_subscriptions for select using (public.ventes_is_admin());
create policy "visits: admin lecture" on public.ventes_visit_requests for select using (public.ventes_is_admin());
create policy "phone_reveals: admin lecture" on public.ventes_phone_reveals for select using (public.ventes_is_admin());

-- Un membre bloqué ne peut plus publier ni écrire
create or replace function public.ventes_is_blocked()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_blocked from public.ventes_profiles where id = auth.uid()), false);
$$;
drop policy if exists "listings: créer" on public.ventes_listings;
create policy "listings: créer" on public.ventes_listings for insert with check (seller_id = auth.uid() and not public.ventes_is_blocked());
drop policy if exists "visits: créer" on public.ventes_visit_requests;
create policy "visits: créer" on public.ventes_visit_requests for insert with check (auth.uid() = buyer_id and auth.uid() <> seller_id and not public.ventes_is_blocked());

-- Vue statistiques pour le tableau de bord admin
create or replace view public.ventes_admin_stats with (security_invoker = true) as
  select
    (select count(*) from public.ventes_profiles) as users,
    (select count(*) from public.ventes_profiles where role in ('eleveur', 'pro_depot')) as pros,
    (select count(*) from public.ventes_profiles where role in ('eleveur', 'pro_depot') and siret is not null and not is_verified) as pros_to_verify,
    (select count(*) from public.ventes_listings where status = 'pending') as listings_pending,
    (select count(*) from public.ventes_listings where status = 'active') as listings_active,
    (select count(*) from public.ventes_listings where status = 'sold') as listings_sold,
    (select count(*) from public.ventes_reports where status = 'open') as reports_open,
    (select count(*) from public.ventes_subscriptions where plan <> 'free' and status in ('active', 'trialing')) as paid_subscriptions,
    (select count(*) from public.ventes_visit_requests where created_at > now() - interval '30 days') as visits_30d;
grant select on public.ventes_admin_stats to authenticated;

-- Pour nommer le premier administrateur, exécuter :
-- update public.ventes_profiles set is_admin = true where email = 'contact@cavalons.fr';
