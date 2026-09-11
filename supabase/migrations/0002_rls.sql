-- Row Level Security

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.listings enable row level security;
alter table public.favorites enable row level security;
alter table public.visit_requests enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.phone_reveals enable row level security;
alter table public.reports enable row level security;
alter table public.saved_searches enable row level security;
alter table public.stripe_events enable row level security;

-- Profils : lecture publique des champs non sensibles via la vue, écriture par le propriétaire
create policy "profiles: lecture publique" on public.profiles for select using (true);
create policy "profiles: modifier son profil" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles: insérer son profil" on public.profiles for insert with check (auth.uid() = id);

-- Vue publique sans téléphone ni email (le téléphone passe par la fonction reveal_phone)
create view public.public_profiles with (security_invoker = false) as
  select id, role, display_name, slug, avatar_url, bio, city, region, company_name, website, is_verified, created_at
  from public.profiles;
grant select on public.public_profiles to anon, authenticated;

-- Abonnements : lecture par le titulaire, écriture uniquement par le service (webhooks)
create policy "subscriptions: lire le sien" on public.subscriptions for select using (auth.uid() = user_id);

-- Annonces
create policy "listings: lecture des annonces publiées" on public.listings for select
  using (status in ('active', 'reserved', 'sold') or seller_id = auth.uid());
create policy "listings: créer" on public.listings for insert with check (seller_id = auth.uid());
create policy "listings: modifier les siennes" on public.listings for update using (seller_id = auth.uid()) with check (seller_id = auth.uid());
create policy "listings: supprimer les siennes" on public.listings for delete using (seller_id = auth.uid());

-- Favoris
create policy "favorites: gérer les siens" on public.favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Visites : visibles par l'acheteur et le vendeur ; création par l'acheteur (gratuit)
create policy "visits: lire les siennes" on public.visit_requests for select using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "visits: créer" on public.visit_requests for insert with check (auth.uid() = buyer_id and auth.uid() <> seller_id);
create policy "visits: répondre (vendeur) ou annuler (acheteur)" on public.visit_requests for update
  using (auth.uid() = buyer_id or auth.uid() = seller_id) with check (auth.uid() = buyer_id or auth.uid() = seller_id);

-- Conversations : l'acheteur doit être abonné pour ouvrir une conversation
create policy "conversations: lire les siennes" on public.conversations for select using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "conversations: ouvrir (abonné)" on public.conversations for insert
  with check (auth.uid() = buyer_id and auth.uid() <> seller_id and public.can_contact());

-- Messages : membres de la conversation ; l'acheteur doit rester abonné pour écrire
create policy "messages: lire" on public.messages for select using (public.is_conversation_member(conversation_id));
create policy "messages: écrire" on public.messages for insert
  with check (
    sender_id = auth.uid()
    and public.is_conversation_member(conversation_id)
    and (
      public.can_contact()
      or exists (select 1 from public.conversations c where c.id = conversation_id and c.seller_id = auth.uid())
    )
  );
create policy "messages: marquer lu" on public.messages for update using (public.is_conversation_member(conversation_id));

-- Téléphone : révélé uniquement aux abonnés, journalisé
create policy "phone_reveals: lire les siens" on public.phone_reveals for select using (auth.uid() = user_id);

create or replace function public.reveal_phone(p_listing uuid)
returns text language plpgsql security definer set search_path = public as $$
declare v_phone text; v_seller uuid;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  select seller_id into v_seller from public.listings where id = p_listing and status in ('active', 'reserved');
  if v_seller is null then raise exception 'LISTING_NOT_FOUND'; end if;
  if v_seller = auth.uid() then
    select phone into v_phone from public.profiles where id = v_seller; return v_phone;
  end if;
  if not public.can_contact() then raise exception 'SUBSCRIPTION_REQUIRED'; end if;
  select phone into v_phone from public.profiles where id = v_seller;
  insert into public.phone_reveals (user_id, listing_id) values (auth.uid(), p_listing);
  return v_phone;
end;
$$;

-- Signalements : tout utilisateur connecté peut signaler
create policy "reports: créer" on public.reports for insert with check (auth.uid() = reporter_id);
create policy "reports: lire les siens" on public.reports for select using (auth.uid() = reporter_id);

-- Recherches sauvegardées
create policy "saved_searches: gérer les siennes" on public.saved_searches for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Stockage des photos
insert into storage.buckets (id, name, public) values ('listing-photos', 'listing-photos', true) on conflict do nothing;
create policy "photos: lecture publique" on storage.objects for select using (bucket_id = 'listing-photos');
create policy "photos: upload dans son dossier" on storage.objects for insert
  with check (bucket_id = 'listing-photos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "photos: supprimer les siennes" on storage.objects for delete
  using (bucket_id = 'listing-photos' and auth.uid()::text = (storage.foldername(name))[1]);
