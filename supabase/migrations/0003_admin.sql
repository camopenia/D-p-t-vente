-- Back-office de modération : rôle admin, journal, politiques RLS élargies

alter table public.profiles add column if not exists is_admin boolean not null default false;
alter table public.profiles add column if not exists is_blocked boolean not null default false;
alter table public.profiles add column if not exists verification_note text;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- Journal des actions de modération
create table if not exists public.moderation_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles (id) on delete set null,
  target_type text not null check (target_type in ('listing', 'profile', 'report', 'user')),
  target_id uuid not null,
  action text not null,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists moderation_log_target on public.moderation_log (target_type, target_id, created_at desc);
alter table public.moderation_log enable row level security;
create policy "moderation_log: admins" on public.moderation_log for all using (public.is_admin()) with check (public.is_admin());

-- Motif de refus visible par le vendeur
alter table public.listings add column if not exists moderation_note text;

-- Annonces : les admins voient et modifient tout
create policy "listings: admin lecture" on public.listings for select using (public.is_admin());
create policy "listings: admin modification" on public.listings for update using (public.is_admin()) with check (true);
create policy "listings: admin suppression" on public.listings for delete using (public.is_admin());

-- Profils : les admins peuvent vérifier / bloquer ; les membres ne peuvent pas s'auto-promouvoir
create policy "profiles: admin modification" on public.profiles for update using (public.is_admin()) with check (true);

create or replace function public.protect_profile_flags()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    new.is_admin := old.is_admin;
    new.is_verified := old.is_verified;
    new.is_blocked := old.is_blocked;
    new.verification_note := old.verification_note;
  end if;
  return new;
end;
$$;
drop trigger if exists profiles_protect_flags on public.profiles;
create trigger profiles_protect_flags before update on public.profiles for each row execute procedure public.protect_profile_flags();

-- Signalements : les admins lisent et traitent tout
create policy "reports: admin lecture" on public.reports for select using (public.is_admin());
create policy "reports: admin modification" on public.reports for update using (public.is_admin()) with check (true);
alter table public.reports add column if not exists resolved_by uuid references public.profiles (id) on delete set null;
alter table public.reports add column if not exists resolved_at timestamptz;
alter table public.reports add column if not exists resolution_note text;

-- Abonnements et visites : lecture admin
create policy "subscriptions: admin lecture" on public.subscriptions for select using (public.is_admin());
create policy "visits: admin lecture" on public.visit_requests for select using (public.is_admin());
create policy "phone_reveals: admin lecture" on public.phone_reveals for select using (public.is_admin());

-- Un membre bloqué ne peut plus publier ni écrire
create or replace function public.is_blocked()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_blocked from public.profiles where id = auth.uid()), false);
$$;
drop policy if exists "listings: créer" on public.listings;
create policy "listings: créer" on public.listings for insert with check (seller_id = auth.uid() and not public.is_blocked());
drop policy if exists "visits: créer" on public.visit_requests;
create policy "visits: créer" on public.visit_requests for insert with check (auth.uid() = buyer_id and auth.uid() <> seller_id and not public.is_blocked());

-- Vue statistiques pour le tableau de bord admin
create or replace view public.admin_stats with (security_invoker = true) as
  select
    (select count(*) from public.profiles) as users,
    (select count(*) from public.profiles where role in ('eleveur', 'pro_depot')) as pros,
    (select count(*) from public.profiles where role in ('eleveur', 'pro_depot') and siret is not null and not is_verified) as pros_to_verify,
    (select count(*) from public.listings where status = 'pending') as listings_pending,
    (select count(*) from public.listings where status = 'active') as listings_active,
    (select count(*) from public.listings where status = 'sold') as listings_sold,
    (select count(*) from public.reports where status = 'open') as reports_open,
    (select count(*) from public.subscriptions where plan <> 'free' and status in ('active', 'trialing')) as paid_subscriptions,
    (select count(*) from public.visit_requests where created_at > now() - interval '30 days') as visits_30d;
grant select on public.admin_stats to authenticated;

-- Pour nommer le premier administrateur, exécuter :
-- update public.profiles set is_admin = true where email = 'contact@cavalons.fr';
