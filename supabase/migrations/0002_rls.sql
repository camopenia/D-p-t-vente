-- Row Level Security

alter table public.ventes_profiles enable row level security;
alter table public.ventes_subscriptions enable row level security;
alter table public.ventes_listings enable row level security;
alter table public.ventes_favorites enable row level security;
alter table public.ventes_visit_requests enable row level security;
alter table public.ventes_conversations enable row level security;
alter table public.ventes_messages enable row level security;
alter table public.ventes_phone_reveals enable row level security;
alter table public.ventes_reports enable row level security;
alter table public.ventes_saved_searches enable row level security;
alter table public.ventes_stripe_events enable row level security;

-- Profils : lecture publique des champs non sensibles via la vue, écriture par le propriétaire
create policy "profiles: lecture publique" on public.ventes_profiles for select using (true);
create policy "profiles: modifier son profil" on public.ventes_profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles: insérer son profil" on public.ventes_profiles for insert with check (auth.uid() = id);

-- Vue publique sans téléphone ni email (le téléphone passe par la fonction reveal_phone)
create view public.ventes_public_profiles with (security_invoker = false) as
  select id, role, display_name, slug, avatar_url, bio, city, region, company_name, website, is_verified, created_at
  from public.ventes_profiles;
grant select on public.ventes_public_profiles to anon, authenticated;

-- Abonnements : lecture par le titulaire, écriture uniquement par le service (webhooks)
create policy "subscriptions: lire le sien" on public.ventes_subscriptions for select using (auth.uid() = user_id);

-- Annonces
create policy "listings: lecture des annonces publiées" on public.ventes_listings for select
  using (status in ('active', 'reserved', 'sold') or seller_id = auth.uid());
create policy "listings: créer" on public.ventes_listings for insert with check (seller_id = auth.uid());
create policy "listings: modifier les siennes" on public.ventes_listings for update using (seller_id = auth.uid()) with check (seller_id = auth.uid());
create policy "listings: supprimer les siennes" on public.ventes_listings for delete using (seller_id = auth.uid());

-- Favoris
create policy "favorites: gérer les siens" on public.ventes_favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Visites : visibles par l'acheteur et le vendeur ; création par l'acheteur (gratuit)
create policy "visits: lire les siennes" on public.ventes_visit_requests for select using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "visits: créer" on public.ventes_visit_requests for insert with check (auth.uid() = buyer_id and auth.uid() <> seller_id);
create policy "visits: répondre (vendeur) ou annuler (acheteur)" on public.ventes_visit_requests for update
  using (auth.uid() = buyer_id or auth.uid() = seller_id) with check (auth.uid() = buyer_id or auth.uid() = seller_id);

-- Conversations : l'acheteur doit être abonné pour ouvrir une conversation
create policy "conversations: lire les siennes" on public.ventes_conversations for select using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "conversations: ouvrir (abonné)" on public.ventes_conversations for insert
  with check (auth.uid() = buyer_id and auth.uid() <> seller_id and public.ventes_can_contact());

-- Messages : membres de la conversation ; l'acheteur doit rester abonné pour écrire
create policy "messages: lire" on public.ventes_messages for select using (public.ventes_is_conversation_member(conversation_id));
create policy "messages: écrire" on public.ventes_messages for insert
  with check (
    sender_id = auth.uid()
    and public.ventes_is_conversation_member(conversation_id)
    and (
      public.ventes_can_contact()
      or exists (select 1 from public.ventes_conversations c where c.id = conversation_id and c.seller_id = auth.uid())
    )
  );
create policy "messages: marquer lu" on public.ventes_messages for update using (public.ventes_is_conversation_member(conversation_id));

-- Téléphone : révélé uniquement aux abonnés, journalisé
create policy "phone_reveals: lire les siens" on public.ventes_phone_reveals for select using (auth.uid() = user_id);

create or replace function public.ventes_reveal_phone(p_listing uuid)
returns text language plpgsql security definer set search_path = public as $$
declare v_phone text; v_seller uuid;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  select seller_id into v_seller from public.ventes_listings where id = p_listing and status in ('active', 'reserved');
  if v_seller is null then raise exception 'LISTING_NOT_FOUND'; end if;
  if v_seller = auth.uid() then
    select phone into v_phone from public.ventes_profiles where id = v_seller; return v_phone;
  end if;
  if not public.ventes_can_contact() then raise exception 'SUBSCRIPTION_REQUIRED'; end if;
  select phone into v_phone from public.ventes_profiles where id = v_seller;
  insert into public.ventes_phone_reveals (user_id, listing_id) values (auth.uid(), p_listing);
  return v_phone;
end;
$$;

-- Signalements : tout utilisateur connecté peut signaler
create policy "reports: créer" on public.ventes_reports for insert with check (auth.uid() = reporter_id);
create policy "reports: lire les siens" on public.ventes_reports for select using (auth.uid() = reporter_id);

-- Recherches sauvegardées
create policy "saved_searches: gérer les siennes" on public.ventes_saved_searches for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Stockage des photos
insert into storage.buckets (id, name, public) values ('ventes-photos', 'ventes-photos', true) on conflict do nothing;
create policy "ventes photos: lecture publique" on storage.objects for select using (bucket_id = 'ventes-photos');
create policy "ventes photos: upload dans son dossier" on storage.objects for insert
  with check (bucket_id = 'ventes-photos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "ventes photos: supprimer les siennes" on storage.objects for delete
  using (bucket_id = 'ventes-photos' and auth.uid()::text = (storage.foldername(name))[1]);
