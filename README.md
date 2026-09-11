# Cavalons Ventes

Plateforme de vente de chevaux et poneys pour quatre publics : **éleveurs**, **particuliers vendeurs**, **professionnels du dépôt-vente** et **acheteurs**. Sous-marque de [Cavalons](https://www.cavalons.fr) (même charte : Poppins, `#155B57`, `#99CBC7`, `#FFACB7`, `#F8F7F2`).

## Ce que fait le site

| Fonction | Détail |
|---|---|
| Annonces | Recherche et filtres (race, sexe, discipline, niveau, région, prix, âge, taille, papiers, radios, essai), fiche détaillée (origines, SIRE, santé déclarée, vidéos), annonces similaires |
| Publication | Assistant en 5 étapes, photos vers Supabase Storage, numéro SIRE obligatoire, mention dépôt-vente, prix HT/TTC pour les pros, brouillon / en ligne / réservé / vendu |
| Visites et essais | **Gratuits** : demande depuis l'annonce, réponse du vendeur depuis son espace, suivi des deux côtés |
| Messagerie et téléphone | Réservés aux abonnés **Contact** (9,90 €/mois) et **Pro** (29 €/mois) via Stripe ; les vendeurs répondent gratuitement ; révélation du téléphone journalisée et contrôlée en base (RLS + fonction `reveal_phone`) |
| Contrats | Générateur en ligne (formulaire + aperçu + impression PDF) : contrat de vente, mandat de dépôt-vente, convention d'essai. Fondés sur le Code civil, le Code rural (vices rédhibitoires, SIRE) et le modèle IDE/IFCE |
| Guides | 10 guides par public (acheteur, vendeur particulier, éleveur, dépôt-vente, arnaques, visite et essai, visite vétérinaire, prix, annonce, après la vente) |
| Confiance | Pacte de bonne conduite accepté à l'inscription, statut du vendeur affiché, badge « Professionnel vérifié » (SIRET), signalement, favoris, annuaire des pros |

Les recherches qui ont servi de base sont dans `docs/` : `benchmark-plateformes.md` (Equirodi, Cheval Annonce, ehorses, Leboncoin, HorseTelex, Fences, Arqana, SHF Market…), `recherche-bonnes-pratiques.md` (forums, presse, IFCE) et `cadre-juridique.md` (textes, jurisprudence, clauses, points à faire valider par un juriste).

## Stack

Next.js 15 (App Router, Server Actions), TypeScript, Tailwind CSS v4, Supabase (Auth, Postgres + RLS, Storage), Stripe (abonnements), lucide-react, zod, marked.

## Démarrer

```bash
npm install
cp .env.example .env.local   # facultatif : sans Supabase, le site tourne en mode démonstration
npm run dev
```

Sans variables Supabase, le site affiche des annonces fictives (`src/lib/demo-data.ts`) et un bandeau « mode démonstration ». Les formulaires (compte, annonce, visite) expliquent qu'il faut configurer Supabase.

## Mise en production

1. **Supabase** : créez un projet, puis exécutez dans l'ordre `supabase/migrations/0001_schema.sql` et `0002_rls.sql` (SQL editor ou `supabase db push`). Le bucket `listing-photos` est créé par la migration. Activez l'authentification par email (confirmation conseillée) et renseignez l'URL de redirection `https://votre-domaine/auth/callback`.
2. **Variables** : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (serveur uniquement), `NEXT_PUBLIC_SITE_URL`.
3. **Stripe** : créez deux prix récurrents mensuels (Contact 9,90 €, Pro 29 €), renseignez `STRIPE_SECRET_KEY`, `STRIPE_PRICE_CONTACT`, `STRIPE_PRICE_PRO`, puis un webhook vers `/api/stripe/webhook` avec les événements `checkout.session.completed`, `customer.subscription.created|updated|deleted` et `STRIPE_WEBHOOK_SECRET`. Activez le portail client Stripe pour la résiliation.
4. **Déploiement** : Vercel ou tout hébergeur Node. `npm run build` puis `npm start`.
5. **Badge vérifié** : passez `profiles.is_verified = true` après contrôle du SIRET (interface d'administration à venir).

## Structure

```
src/app/                 pages (chevaux, vendre, mon-compte, visites, messages, abonnement, contrats, guides, pros, auth…)
src/app/actions/         server actions (auth, annonces, visites, messages, favoris, profil)
src/app/api/stripe/      checkout, portail client, webhook
src/components/          layout, annonces, contrats, formulaires
src/lib/                 constants (référentiels), types, listings (accès données + mode démo), auth, stripe
src/lib/content/         guides (Markdown), contrats (clauses), pages statiques
supabase/migrations/     schéma, RLS, fonctions (reveal_phone, can_contact…)
docs/                    recherches marché, bonnes pratiques, cadre juridique
public/brand/            logo (variantes teal / rose / blanc), mascottes
```

## Modèle économique (état actuel)

- Consultation, publication, visites et essais : gratuits.
- Abonnement **Contact** : messagerie et téléphone des vendeurs.
- Abonnement **Pro** : page vitrine, annonces mises en avant, statistiques, badge vérifié.
- Aucune commission sur les ventes ; pas de mise en avant payante qui noie les annonces des particuliers.

## Points à valider avant lancement

- Relecture juridique des trois contrats, des CGU et de la politique de confidentialité (voir `docs/cadre-juridique.md`, section 14).
- Mentions légales de l'éditeur, médiateur de la consommation.
- Procédure de vérification SIRET et modération (back-office).
- Tarifs SIRE et textes à vérifier à chaque mise à jour des modèles.
