-- Cavalons Ventes — schéma initial (préfixe ventes_ : cohabite avec la plateforme demi-pension dans le même projet Supabase)
-- Exécuter dans le SQL editor Supabase ou via `supabase db push`.

create extension if not exists "pgcrypto";
create extension if not exists "unaccent";

-- ---------- Types ----------
create type ventes_user_role as enum ('acheteur', 'particulier', 'eleveur', 'pro_depot');
create type ventes_horse_sex as enum ('jument', 'hongre', 'entier', 'pouliche', 'poulain');
create type ventes_horse_level as enum ('poulain', 'debourre', 'club', 'amateur', 'pro', 'retraite');
create type ventes_horse_papers as enum ('sire_full', 'sire_only', 'oc', 'onc', 'foreign');
create type ventes_listing_status as enum ('draft', 'pending', 'active', 'reserved', 'sold', 'archived');
create type ventes_visit_kind as enum ('visite', 'essai');
create type ventes_visit_status as enum ('pending', 'accepted', 'declined', 'done', 'cancelled');
create type ventes_plan_id as enum ('free', 'contact', 'pro');
create type ventes_subscription_status as enum ('active', 'trialing', 'past_due', 'canceled', 'incomplete');

-- ---------- Profils ----------
create table public.ventes_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role ventes_user_role not null default 'acheteur',
  display_name text not null,
  slug text unique,
  avatar_url text,
  phone text,
  email text,
  bio text,
  city text,
  postal_code text,
  region text,
  siret text,
  company_name text,
  website text,
  is_verified boolean not null default false,
  charter_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Création automatique du profil à l'inscription (metadata: display_name, role)
create or replace function public.ventes_handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Ne doit jamais faire échouer une inscription (le projet est partagé avec la plateforme demi-pension).
  begin
    insert into public.ventes_profiles (id, display_name, role, email, charter_accepted_at)
    values (
      new.id,
      coalesce(new.raw_user_meta_data ->> 'display_name', nullif(trim(coalesce(new.raw_user_meta_data ->> 'first_name', '') || ' ' || coalesce(new.raw_user_meta_data ->> 'last_name', '')), ''), split_part(new.email, '@', 1)),
      coalesce((new.raw_user_meta_data ->> 'role')::ventes_user_role, 'acheteur'),
      new.email,
      case when (new.raw_user_meta_data ->> 'charter_accepted') = 'true' then now() else null end
    )
    on conflict (id) do nothing;
    insert into public.ventes_subscriptions (user_id, plan, status) values (new.id, 'free', 'active');
  exception when others then
    raise warning 'ventes_handle_new_user: %', sqlerrm;
  end;
  return new;
end;
$$;

-- ---------- Abonnements ----------
create table public.ventes_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.ventes_profiles (id) on delete cascade,
  plan ventes_plan_id not null default 'free',
  status ventes_subscription_status not null default 'active',
  stripe_customer_id text,
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.ventes_subscriptions (user_id);

create trigger ventes_on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.ventes_handle_new_user();

-- ---------- Annonces ----------
create table public.ventes_listings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  seller_id uuid not null references public.ventes_profiles (id) on delete cascade,
  status ventes_listing_status not null default 'draft',
  is_depot_vente boolean not null default false,
  owner_name text,
  title text not null,
  horse_name text not null,
  breed text not null,
  sex ventes_horse_sex not null,
  birth_year int not null check (birth_year between 1980 and extract(year from now())::int),
  height_cm int check (height_cm between 60 and 220),
  color text,
  disciplines text[] not null default '{}',
  level ventes_horse_level not null default 'club',
  description text not null,
  temperament text,
  sire_number text,
  papers ventes_horse_papers not null default 'sire_full',
  studbook_approved boolean not null default false,
  sire_name text,
  dam_name text,
  dam_sire_name text,
  price numeric(10,2) check (price is null or price >= 0),
  price_hidden boolean not null default false,
  price_negotiable boolean not null default false,
  vat_included boolean not null default true,
  city text not null,
  postal_code text,
  region text not null,
  photos text[] not null default '{}',
  video_urls text[] not null default '{}',
  vet_check_available boolean not null default true,
  xrays_available boolean not null default false,
  trial_available boolean not null default true,
  visit_available boolean not null default true,
  competition_results text,
  health_notes text,
  known_vices text,
  featured boolean not null default false,
  views_count int not null default 0,
  search_vector tsvector generated always as (
    to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(horse_name, '') || ' ' || coalesce(breed, '') || ' ' || coalesce(description, '') || ' ' || coalesce(sire_name, '') || ' ' || coalesce(city, ''))
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);
create index on public.ventes_listings (status, published_at desc);
create index on public.ventes_listings (seller_id);
create index on public.ventes_listings using gin (search_vector);
create index on public.ventes_listings using gin (disciplines);
create index on public.ventes_listings (region);
create index on public.ventes_listings (price);

create or replace function public.ventes_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  if tg_table_name = 'ventes_listings' and new.status = 'active' and (old.status is distinct from 'active') then
    new.published_at = now();
  end if;
  return new;
end;
$$;
create trigger listings_updated before update on public.ventes_listings for each row execute procedure public.ventes_set_updated_at();
create trigger profiles_updated before update on public.ventes_profiles for each row execute procedure public.ventes_set_updated_at();
create trigger subscriptions_updated before update on public.ventes_subscriptions for each row execute procedure public.ventes_set_updated_at();

create or replace function public.ventes_increment_listing_views(p_listing uuid)
returns void language sql security definer set search_path = public as $$
  update public.ventes_listings set views_count = views_count + 1 where id = p_listing;
$$;

-- ---------- Favoris ----------
create table public.ventes_favorites (
  user_id uuid not null references public.ventes_profiles (id) on delete cascade,
  listing_id uuid not null references public.ventes_listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

-- ---------- Demandes de visite / essai (gratuit) ----------
create table public.ventes_visit_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.ventes_listings (id) on delete cascade,
  buyer_id uuid not null references public.ventes_profiles (id) on delete cascade,
  seller_id uuid not null references public.ventes_profiles (id) on delete cascade,
  kind ventes_visit_kind not null default 'visite',
  preferred_date date,
  message text not null,
  status ventes_visit_status not null default 'pending',
  seller_reply text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.ventes_visit_requests (buyer_id);
create index on public.ventes_visit_requests (seller_id);
create trigger visit_requests_updated before update on public.ventes_visit_requests for each row execute procedure public.ventes_set_updated_at();

-- ---------- Messagerie (abonnés) ----------
create table public.ventes_conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.ventes_listings (id) on delete set null,
  buyer_id uuid not null references public.ventes_profiles (id) on delete cascade,
  seller_id uuid not null references public.ventes_profiles (id) on delete cascade,
  last_message_at timestamptz not null default now(),
  last_message_preview text,
  created_at timestamptz not null default now(),
  unique (listing_id, buyer_id, seller_id)
);
create index on public.ventes_conversations (buyer_id, last_message_at desc);
create index on public.ventes_conversations (seller_id, last_message_at desc);

create table public.ventes_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ventes_conversations (id) on delete cascade,
  sender_id uuid not null references public.ventes_profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index on public.ventes_messages (conversation_id, created_at);

create or replace function public.ventes_touch_conversation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.ventes_conversations
     set last_message_at = new.created_at, last_message_preview = left(new.body, 120)
   where id = new.conversation_id;
  return new;
end;
$$;
create trigger messages_touch after insert on public.ventes_messages for each row execute procedure public.ventes_touch_conversation();

-- ---------- Journal des révélations de téléphone ----------
create table public.ventes_phone_reveals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.ventes_profiles (id) on delete cascade,
  listing_id uuid not null references public.ventes_listings (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index on public.ventes_phone_reveals (user_id, created_at desc);

-- ---------- Signalements ----------
create table public.ventes_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.ventes_profiles (id) on delete set null,
  listing_id uuid references public.ventes_listings (id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

-- ---------- Recherches sauvegardées / alertes ----------
create table public.ventes_saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.ventes_profiles (id) on delete cascade,
  name text not null,
  filters jsonb not null default '{}',
  email_alerts boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- Événements Stripe (idempotence) ----------
create table public.ventes_stripe_events (
  id text primary key,
  type text not null,
  received_at timestamptz not null default now()
);

-- ---------- Helpers ----------
create or replace function public.ventes_current_plan()
returns ventes_plan_id language sql stable security definer set search_path = public as $$
  select coalesce(
    (select plan from public.ventes_subscriptions
      where user_id = auth.uid() and status in ('active', 'trialing', 'past_due')
      order by current_period_end desc nulls last limit 1),
    'free'::ventes_plan_id);
$$;

create or replace function public.ventes_can_contact()
returns boolean language sql stable as $$
  select public.ventes_current_plan() in ('contact', 'pro');
$$;

-- Le vendeur peut toujours répondre ; l'acheteur doit être abonné pour initier / écrire.
create or replace function public.ventes_is_conversation_member(p_conversation uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.ventes_conversations c
    where c.id = p_conversation and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
  );
$$;
