// Référentiels métier partagés (formulaires, filtres, affichage)

export const ROLES = {
  acheteur: { label: "Acheteur", short: "Acheteur", description: "Je cherche un cheval ou un poney." },
  particulier: { label: "Particulier vendeur", short: "Particulier", description: "Je vends mon propre cheval." },
  eleveur: { label: "Éleveur", short: "Éleveur", description: "Je vends les produits de mon élevage." },
  pro_depot: { label: "Professionnel dépôt-vente", short: "Pro dépôt-vente", description: "Je vends des chevaux pour le compte de tiers (courtier, écurie de valorisation, marchand)." },
} as const;
export type Role = keyof typeof ROLES;

export const SEXES = {
  jument: "Jument",
  hongre: "Hongre",
  entier: "Entier",
  pouliche: "Pouliche",
  poulain: "Poulain",
} as const;
export type Sex = keyof typeof SEXES;

export const DISCIPLINES = [
  "CSO",
  "Dressage",
  "Complet",
  "Loisir / balade",
  "Randonnée",
  "Endurance",
  "Hunter",
  "Western",
  "Attelage",
  "Voltige",
  "Course",
  "TREC",
  "Équifun / poney club",
  "Élevage / reproduction",
  "Compagnie",
] as const;

export const LEVELS = {
  poulain: "Poulain / jeune non débourré",
  debourre: "Débourré",
  club: "Club",
  amateur: "Amateur",
  pro: "Pro / haut niveau",
  retraite: "Retraite / compagnie",
} as const;
export type Level = keyof typeof LEVELS;

export const BREEDS = [
  "Selle Français",
  "KWPN",
  "BWP",
  "Holsteiner",
  "Hanovrien",
  "Oldenbourg",
  "Anglo-Arabe",
  "Pur-sang Arabe",
  "Pur-sang Anglais",
  "AQPS",
  "Trotteur Français",
  "Lusitanien",
  "PRE (Pure Race Espagnole)",
  "Frison",
  "Quarter Horse",
  "Paint Horse",
  "Appaloosa",
  "Camargue",
  "Comtois",
  "Percheron",
  "Trait Breton",
  "Haflinger",
  "Fjord",
  "Mérens",
  "Connemara",
  "New Forest",
  "Welsh",
  "Poney Français de Selle",
  "Shetland",
  "Irish Cob",
  "Cheval de sport (autre)",
  "Origine constatée (OC)",
  "Origine non constatée (ONC)",
  "Autre",
] as const;

export const COLORS = [
  "Bai",
  "Bai brun",
  "Alezan",
  "Noir",
  "Gris",
  "Isabelle",
  "Palomino",
  "Pie",
  "Rouan",
  "Crème",
  "Souris",
  "Autre",
] as const;

export const REGIONS = [
  "Auvergne-Rhône-Alpes",
  "Bourgogne-Franche-Comté",
  "Bretagne",
  "Centre-Val de Loire",
  "Corse",
  "Grand Est",
  "Hauts-de-France",
  "Île-de-France",
  "Normandie",
  "Nouvelle-Aquitaine",
  "Occitanie",
  "Pays de la Loire",
  "Provence-Alpes-Côte d'Azur",
  "Outre-mer",
  "Belgique",
  "Suisse",
  "Autre pays",
] as const;

export const LISTING_STATUS = {
  draft: "Brouillon",
  pending: "En attente de validation",
  active: "En ligne",
  reserved: "Réservé",
  sold: "Vendu",
  archived: "Archivé",
} as const;
export type ListingStatus = keyof typeof LISTING_STATUS;

export const VISIT_STATUS = {
  pending: "En attente de réponse",
  accepted: "Acceptée",
  declined: "Refusée",
  expired: "Sans réponse (expirée)",
  done: "Effectuée",
  cancelled: "Annulée",
} as const;
export type VisitStatus = keyof typeof VISIT_STATUS;

/** Frais de plateforme par demande de visite ou d'essai, en centimes. */
export const VISIT_FEE_CENTS = 1000;
/** Délai de réponse du vendeur, en heures. */
export const VISIT_RESPONSE_HOURS = 48;
/** Nombre de semaines proposées à l'acheteur pour choisir ses créneaux. */
export const VISIT_WEEKS_AHEAD = 4;

export const WEEKDAYS = [
  [1, "Lundi"],
  [2, "Mardi"],
  [3, "Mercredi"],
  [4, "Jeudi"],
  [5, "Vendredi"],
  [6, "Samedi"],
  [7, "Dimanche"],
] as const;
export const PERIODS = {
  matin: "Matin",
  apres_midi: "Après-midi",
  soiree: "Soirée",
} as const;
export type Period = keyof typeof PERIODS;
/** {"1": ["matin", "soiree"], …} : jour ISO (1 = lundi) → périodes disponibles */
export type VisitAvailability = Partial<Record<string, Period[]>>;
export interface VisitSlot {
  date: string; // AAAA-MM-JJ
  period: Period;
}

export function formatSlot(slot: VisitSlot | null | undefined) {
  if (!slot) return "";
  const d = new Date(slot.date + "T12:00:00");
  return `${d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} · ${PERIODS[slot.period]?.toLowerCase() ?? slot.period}`;
}

/** Créneaux concrets à venir correspondant aux disponibilités hebdomadaires du vendeur. */
export function upcomingSlots(availability: VisitAvailability, weeks = VISIT_WEEKS_AHEAD, from = new Date()): VisitSlot[] {
  const out: VisitSlot[] = [];
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + 1); // à partir de demain
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = ((d.getDay() + 6) % 7) + 1; // 1 = lundi … 7 = dimanche
    const periods = availability[String(iso)] ?? [];
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    for (const p of ["matin", "apres_midi", "soiree"] as Period[]) if (periods.includes(p)) out.push({ date, period: p });
  }
  return out;
}

export const PLANS = {
  free: {
    id: "free",
    name: "Découverte",
    price: 0,
    period: "",
    tagline: "Pour explorer et publier",
    features: [
      "Consultation illimitée des annonces",
      "Publication d'annonces gratuite",
      "Demandes de visite et d'essai : 10 € par demande, remboursés si le vendeur refuse ou ne répond pas sous 48 h",
      "Favoris et alertes",
      "Modèles de contrats et guides",
    ],
    limits: ["Messagerie et téléphone des vendeurs réservés aux abonnés"],
  },
  contact: {
    id: "contact",
    name: "Contact",
    price: 9.9,
    period: "/ mois",
    tagline: "Pour contacter directement les vendeurs",
    features: [
      "Tout Découverte",
      "Messagerie illimitée avec les vendeurs",
      "Accès aux numéros de téléphone",
      "Historique de vos échanges et visites",
      "Sans engagement, résiliable en un clic",
    ],
    limits: [],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 29,
    period: "/ mois",
    tagline: "Pour éleveurs et dépôts-ventes",
    features: [
      "Tout Contact",
      "Page vitrine élevage / écurie",
      "Annonces illimitées, mises en avant",
      "Statistiques de vues et de contacts",
      "Contrats de dépôt-vente pré-remplis",
      "Badge « Professionnel vérifié » après contrôle SIRET",
    ],
    limits: [],
  },
} as const;
export type PlanId = keyof typeof PLANS;

export const PAPERS = {
  sire_full: "Papiers complets (SIRE, carte d'immatriculation)",
  sire_only: "Document d'identification SIRE, carte de propriété à régulariser",
  oc: "Origine constatée",
  onc: "Origine non constatée",
  foreign: "Papiers étrangers (studbook étranger)",
} as const;
export type Papers = keyof typeof PAPERS;

export function formatPrice(price: number | null | undefined, opts?: { hidden?: boolean }) {
  if (opts?.hidden || price == null) return "Prix sur demande";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(price);
}

export function horseAge(birthYear: number | null | undefined) {
  if (!birthYear) return null;
  return new Date().getFullYear() - birthYear;
}

export function ageLabel(birthYear: number | null | undefined) {
  const a = horseAge(birthYear);
  if (a == null) return "Âge inconnu";
  if (a <= 0) return "Foal";
  return `${a} an${a > 1 ? "s" : ""}`;
}

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

/** Offre « Vente accompagnée » : Cavalons gère l'annonce et pré-sélectionne les acheteurs. */
export const ACCOMPAGNEMENT_RATE = 10; // % du prix de vente, dû uniquement si le cheval est vendu
export const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com/cavalons";
