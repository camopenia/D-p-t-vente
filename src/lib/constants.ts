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
  pending: "En attente",
  accepted: "Acceptée",
  declined: "Refusée",
  done: "Effectuée",
  cancelled: "Annulée",
} as const;
export type VisitStatus = keyof typeof VISIT_STATUS;

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
      "Demandes de visite et d'essai gratuites",
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
