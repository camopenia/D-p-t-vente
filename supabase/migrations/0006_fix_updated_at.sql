-- Correctif appliqué le 14/09/2026 : la fonction ventes_set_updated_at référençait new.status sur des tables
-- sans colonne status (profils, abonnements, visites), ce qui faisait échouer toute mise à jour.
create or replace function public.ventes_set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create or replace function public.ventes_listing_publish_stamp()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  if new.status = 'active' and (old.status is distinct from 'active') then
    new.published_at = now();
  end if;
  return new;
end;
$$;
revoke execute on function public.ventes_listing_publish_stamp() from public, anon;
drop trigger if exists listings_updated on public.ventes_listings;
create trigger listings_updated before update on public.ventes_listings for each row execute procedure public.ventes_listing_publish_stamp();

-- La protection des drapeaux de profil ne s'applique qu'aux membres connectés (auth.uid() non nul),
-- pas aux opérations serveur (SQL editor, clé service).
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
