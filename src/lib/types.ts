import type { Level, ListingStatus, Papers, PlanId, Role, Sex, VisitStatus } from "./constants";

export interface Profile {
  id: string;
  role: Role;
  display_name: string;
  slug: string | null;
  avatar_url: string | null;
  phone: string | null;
  email: string | null;
  bio: string | null;
  city: string | null;
  postal_code: string | null;
  region: string | null;
  siret: string | null;
  company_name: string | null;
  website: string | null;
  is_verified: boolean;
  is_admin: boolean;
  is_blocked: boolean;
  verification_note: string | null;
  charter_accepted_at: string | null;
  created_at: string;
}

export interface Listing {
  id: string;
  slug: string;
  seller_id: string;
  seller?: Pick<Profile, "id" | "display_name" | "role" | "is_verified" | "city" | "region" | "avatar_url" | "slug" | "company_name"> | null;
  status: ListingStatus;
  is_depot_vente: boolean;
  owner_name: string | null;
  title: string;
  horse_name: string;
  breed: string;
  sex: Sex;
  birth_year: number;
  height_cm: number | null;
  color: string | null;
  disciplines: string[];
  level: Level;
  description: string;
  temperament: string | null;
  sire_number: string | null;
  papers: Papers;
  studbook_approved: boolean;
  sire_name: string | null;
  dam_name: string | null;
  dam_sire_name: string | null;
  price: number | null;
  price_hidden: boolean;
  price_negotiable: boolean;
  vat_included: boolean;
  city: string;
  postal_code: string | null;
  region: string;
  photos: string[];
  video_urls: string[];
  vet_check_available: boolean;
  xrays_available: boolean;
  trial_available: boolean;
  visit_available: boolean;
  competition_results: string | null;
  health_notes: string | null;
  known_vices: string | null;
  featured: boolean;
  moderation_note: string | null;
  views_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface VisitRequest {
  id: string;
  listing_id: string;
  listing?: Pick<Listing, "id" | "slug" | "title" | "horse_name" | "photos" | "city"> | null;
  buyer_id: string;
  buyer?: Pick<Profile, "id" | "display_name" | "role"> | null;
  seller_id: string;
  seller?: Pick<Profile, "id" | "display_name" | "role"> | null;
  kind: "visite" | "essai";
  preferred_date: string | null;
  message: string;
  status: VisitStatus;
  seller_reply: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  listing_id: string | null;
  listing?: Pick<Listing, "id" | "slug" | "title" | "horse_name" | "photos"> | null;
  buyer_id: string;
  seller_id: string;
  buyer?: Pick<Profile, "id" | "display_name" | "role" | "avatar_url"> | null;
  seller?: Pick<Profile, "id" | "display_name" | "role" | "avatar_url"> | null;
  last_message_at: string;
  last_message_preview: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: PlanId;
  status: "active" | "trialing" | "past_due" | "canceled" | "incomplete";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export interface Favorite {
  listing_id: string;
  user_id: string;
  created_at: string;
}

export interface ListingFilters {
  q?: string;
  breed?: string;
  sex?: Sex | "";
  discipline?: string;
  level?: Level | "";
  region?: string;
  priceMin?: number;
  priceMax?: number;
  ageMin?: number;
  ageMax?: number;
  heightMin?: number;
  heightMax?: number;
  papers?: Papers | "";
  sellerRole?: Role | "";
  xrays?: boolean;
  trial?: boolean;
  sort?: "recent" | "price_asc" | "price_desc" | "age_asc";
  page?: number;
}
