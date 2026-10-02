---
name: instagram
description: "Gérer le compte Instagram Cavalons : publier une photo, un carrousel, une story ou un reel, programmer des publications, lister ou annuler les posts programmés, lire les commentaires et y répondre, commenter un post du compte, masquer ou supprimer un commentaire, consulter les statistiques d'un post, choisir les photos et vidéos dans la banque Google Drive « photo cheval ». À utiliser dès que la demande parle d'Instagram, de post, de story, de reel, de carrousel, de légende, de planning ou de calendrier de publication, de « programmer pour… », de commentaires ou de réponses aux abonnés, de photo ou vidéo à poster, même sans nommer l'outil."
metadata:
  author: cavalons
  version: "0.2.0"
---

# Instagram Cavalons

Deux outils complémentaires :

| Besoin | Outil |
|---|---|
| Publier tout de suite (photo, carrousel, story, reel) | Connecteur MCP `CAVALONS_META` |
| Programmer, lister, annuler une publication | Connecteur MCP `CAVALONS_META` |
| Statistiques d'un post ou d'une story | Connecteur MCP `CAVALONS_META` |
| Lire les commentaires, répondre, commenter, masquer, supprimer | Script `scripts/ig.mjs` (API Instagram) |
| Trouver une photo ou une vidéo à publier | Banque Google Drive « photo cheval » ([references/banque-media.md](references/banque-media.md)) |

Les outils du connecteur sont souvent différés : chargez-les avec `ToolSearch` (« instagram », « schedule post ») avant de dire qu'ils manquent.

## Règles communes

1. **PIN obligatoire.** Toute écriture via le connecteur (`publish_*`, `schedule_post`, `cancel_scheduled_post`) exige le code PIN de l'utilisatrice. Demandez-le dans la conversation ; ne le devinez jamais, ne le réutilisez pas d'une demande sur l'autre sans son accord, ne l'écrivez dans aucun fichier.
2. **Validation avant envoi.** Avant de publier, programmer ou répondre, montrez le texte exact (légende, commentaire), les images et la date, puis attendez un « ok ». Une publication est publique dès qu'elle part.
3. **Images.** Uniquement des URLs publiques (JPEG de préférence). Une image locale ou privée passe d'abord par `mcp__CAVALONS_META__rehost_image`. Ratios : 4:5 ou 1:1 pour le fil, 9:16 pour story et reel ; un carrousel garde le même ratio sur toutes ses images (2 à 10).
4. **Légende.** 2 200 caractères maximum, 30 hashtags maximum (viser 5 à 10, pertinents : #cheval #equitation #chevalavendre…). Ton Cavalons : chaleureux, précis, tutoiement évité. Pour une annonce de cheval : nom, race, âge, taille, discipline, région, et le lien `vente.cavalons.fr` (non cliquable en légende : renvoyer vers « lien en bio »).

## Visuels : la banque Drive d'abord

Quand la demande n'apporte pas son propre visuel, piochez dans le dossier Drive « photo cheval » : lisez son `CATALOGUE.md`, proposez 2 ou 3 fichiers adaptés au sujet avec la raison du choix, et signalez les consentements à obtenir (personne ou enfant reconnaissable). Tout est détaillé dans [references/banque-media.md](references/banque-media.md) : ID du dossier, recherche des fichiers, liste à ne jamais publier, charte, passage du Drive à une URL publique.

## Publier et programmer (connecteur)

- Photo seule : `publish_instagram` (`image_url`, `caption`, `pin`).
- Carrousel : `publish_instagram_carousel` (`image_urls` dans l'ordre).
- Story : `publish_story` ; reel : `publish_reel` (URL MP4 publique).
- Programmer : `schedule_post` avec `platform` (`instagram`, `facebook` ou `both`), `kind` (`post`, `story`, `reel`), `image_urls`, `caption`, `publish_at`, `pin`.
  - `publish_at` en ISO 8601 **avec fuseau** : heure de Paris = `+02:00` l'été (fin mars → fin octobre), `+01:00` l'hiver. Ex. 18 h le 15 octobre 2026 → `2026-10-15T18:00:00+02:00`.
  - Instagram et stories passent par une file interne : publication entre H et H+10 min.
  - Créneaux qui marchent bien pour un public équestre : en semaine 12 h-13 h et 18 h-21 h, le week-end en matinée. Proposez, l'utilisatrice tranche.
- Vérifier ou modifier un planning : `list_scheduled_posts`, puis `cancel_scheduled_post` (avec PIN) et reprogrammer — il n'y a pas de modification en place.
- Après une publication : `get_recent_posts` pour récupérer l'ID et le lien, `get_post_insights` pour les stats.

## Commentaires (script)

Le connecteur ne gère pas les commentaires : utilisez `scripts/ig.mjs` (Node 18+, sans dépendance).

Prérequis (variables d'environnement, jamais committées) :

- `IG_ACCESS_TOKEN` : jeton longue durée avec `instagram_basic`, `instagram_manage_comments`, `pages_show_list`, `pages_read_engagement` (et `instagram_content_publish` pour `publish`).
- `IG_USER_ID` : ID du compte Instagram professionnel lié à la page Facebook.
- `IG_GRAPH_HOST` : `graph.facebook.com` par défaut ; `graph.instagram.com` si le jeton vient de « Connexion Instagram ».

Si une variable manque, ne bricolez pas : expliquez comment l'obtenir (Meta for Developers → app → Explorateur de l'API Graph → jeton de page, puis `GET /me/accounts?fields=instagram_business_account`).

```bash
S=.agents/skills/instagram/scripts/ig.mjs
node $S me                                     # vérifie le jeton
node $S media --limit 10                       # derniers posts + nb de commentaires
node $S comments <media_id>                    # commentaires et réponses
node $S reply <comment_id> --message "Merci !" # aperçu (rien n'est envoyé)
node $S reply <comment_id> --message "Merci !" --yes   # envoi réel
node $S comment <media_id> --message "..." --yes
node $S hide <comment_id> --yes                # --unhide pour réafficher
node $S delete-comment <comment_id> --yes
node $S mentions                               # posts où le compte est identifié
```

Sans `--yes`, les commandes d'écriture n'envoient rien et affichent l'aperçu : faites toujours l'aperçu, faites valider, puis relancez avec `--yes`.

Limites de l'API : on ne peut commenter que les posts **du compte** (ou répondre aux commentaires reçus dessus) ; commenter le post d'un autre compte n'est pas possible par l'API, il faut le faire depuis l'application Instagram. Les messages privés ne sont pas couverts.

### Répondre aux commentaires

1. `media` puis `comments` sur les posts récents ayant des commentaires sans réponse du compte.
2. Proposer une réponse par commentaire, regroupées dans un tableau (auteur, commentaire, réponse proposée).
3. Questions sur un cheval (prix, âge, visite) : répondre brièvement et renvoyer vers la fiche ou la messagerie du site, jamais de numéro de téléphone en public.
4. Spam, arnaque (« contactez-moi en privé pour gagner… ») ou insulte : proposer de **masquer** plutôt que supprimer.
5. Envoyer avec `--yes` seulement ce qui a été validé.

## Réseau

Si `graph.facebook.com` est refusé par le proxy de l'environnement, le script ne peut pas tourner ici : dites-le, et proposez d'autoriser le domaine dans la politique réseau de l'environnement ou de lancer le script en local.
