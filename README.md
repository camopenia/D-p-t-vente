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
| Back-office | `/admin` : validation des annonces (modération a priori avec check-list SIRE / prix / photos / mots-clés), signalements, badge « Professionnel vérifié » (lien annuaire des entreprises), blocage de comptes, journal `ventes_moderation_log` |
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

## Base de données (état actuel)

Cavalons Ventes est hébergé dans le projet Supabase **`cavalons-platform`** (`ikrhxxamqffmlmxfhtwn`, région Paris). Ce projet a été nettoyé le 14/09/2026 : il ne contient plus que les objets de Ventes, tous préfixés `ventes_` (tables, vues, types, fonctions), et le bucket `ventes-photos`. L'ancienne plateforme demi-pension de démonstration a été sauvegardée puis supprimée (voir `supabase/migrations/0005_nettoyage_demi_pension.sql`).

Les migrations `supabase/migrations/0001` à `0004` ont été appliquées le 12/09/2026. Un compte de démonstration (`admin@demo.cavalons.fr`, administrateur Ventes) et une annonce de démonstration ont été créés.

## Mise en production

1. **Supabase** : le schéma est déjà en place (voir ci-dessus). Pour un projet dédié plus tard, exécutez dans l'ordre `supabase/migrations/0001_schema.sql`, `0002_rls.sql`, `0003_admin.sql`, `0004_hardening.sql`. Activez l'authentification par email et ajoutez l'URL de redirection `https://votre-domaine/auth/callback` dans Authentication → URL Configuration.
2. **Variables** : `NEXT_PUBLIC_SUPABASE_URL=https://ikrhxxamqffmlmxfhtwn.supabase.co`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (clé publique `sb_publishable_…` visible dans Project Settings → API Keys), `SUPABASE_SERVICE_ROLE_KEY` (serveur uniquement, pour le webhook Stripe), `NEXT_PUBLIC_SITE_URL`.
3. **Stripe** : créez deux prix récurrents mensuels (Contact 9,90 €, Pro 29 €), renseignez `STRIPE_SECRET_KEY`, `STRIPE_PRICE_CONTACT`, `STRIPE_PRICE_PRO`, puis un webhook vers `/api/stripe/webhook` avec les événements `checkout.session.completed`, `customer.subscription.created|updated|deleted` et `STRIPE_WEBHOOK_SECRET`. Activez le portail client Stripe pour la résiliation.
4. **Déploiement** : Vercel ou tout hébergeur Node. `npm run build` puis `npm start`.
5. **Premier administrateur** : après votre inscription, exécutez `update public.ventes_profiles set is_admin = true where email = 'votre@email';` puis ouvrez `/admin`. Les administrateurs suivants se nomment depuis le back-office.
6. **Modération** : toute nouvelle annonce publiée passe en « En attente de validation » et apparaît dans `/admin/annonces` ; le vendeur voit le motif en cas de refus.

## Structure

```
src/app/                 pages (chevaux, vendre, mon-compte, visites, messages, abonnement, contrats, guides, pros, auth…)
src/app/actions/         server actions (auth, annonces, visites, messages, favoris, profil)
src/app/api/stripe/      checkout, portail client, webhook
src/components/          layout, annonces, contrats, formulaires
src/lib/                 constants (référentiels), types, listings (accès données + mode démo), auth, stripe
src/lib/content/         guides (Markdown), contrats (clauses), pages statiques
supabase/migrations/     schéma, RLS, admin, durcissement (objets préfixés ventes_)
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
