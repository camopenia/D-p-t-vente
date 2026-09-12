-- Durcissement suite aux avis de sécurité Supabase (objets ventes_* uniquement)

revoke execute on function public.ventes_handle_new_user() from public, anon;
revoke execute on function public.ventes_touch_conversation() from public, anon;
revoke execute on function public.ventes_protect_profile_flags() from public, anon;
revoke execute on function public.ventes_set_updated_at() from public, anon;

alter function public.ventes_set_updated_at() set search_path = public;
alter function public.ventes_can_contact() set search_path = public;

drop view if exists public.ventes_public_profiles;
create view public.ventes_public_profiles with (security_invoker = true) as
  select id, role, display_name, slug, avatar_url, bio, city, region, company_name, website, is_verified, created_at
  from public.ventes_profiles;
grant select on public.ventes_public_profiles to anon, authenticated;
