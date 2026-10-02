# Banque photos et vidéos (Google Drive « photo cheval »)

Dossier : https://drive.google.com/drive/folders/12buJQ2b-iqG8_u3uRlkO1mr1zLd_SmsO
ID du dossier : `12buJQ2b-iqG8_u3uRlkO1mr1zLd_SmsO` (partagé en lecture « tous les utilisateurs disposant du lien »).

## Toujours partir du catalogue

Le dossier contient un `CATALOGUE.md` tenu à jour à la main : description de chaque fichier, usage conseillé (CTA, humour, hiver, POV…), fichiers à ne pas publier, consentements à obtenir. **Lisez-le avant de proposer un visuel** ; ne choisissez jamais une image sur son seul nom de fichier.

Avec le connecteur Google Drive :

1. Trouver le catalogue : `search_files` avec `parentId = '12buJQ2b-iqG8_u3uRlkO1mr1zLd_SmsO' and title = 'CATALOGUE.md'`.
2. Le lire : `download_file_content` sur son ID (contenu en base64, à décoder).
3. Trouver l'ID d'un fichier cité : `search_files` avec `parentId = '12buJQ2b-iqG8_u3uRlkO1mr1zLd_SmsO' and title = 'ph_calin_bai_ciel.jpg'`. Les noms du catalogue n'ont pas d'extension : ajouter `.jpg` (photos `ph_*`), `.png` (mascottes `masc_*`), `.mp4` (vidéos Pexels, nom = numéro + résolution, ex. `7880885-uhd_2160_3840_24fps.mp4`).
4. Pour regarder une photo avant de la proposer : `read_file_content` sur son ID (JPEG et PNG pris en charge).

Les ID ne sont pas recopiés ici : ils changent quand un fichier est renommé ou remplacé. Recherchez-les au moment de l'usage.

## Familles de fichiers

| Préfixe / nom | Contenu | Usage |
|---|---|---|
| `ph_*.jpg` | photos de la communauté (cavaliers, chevaux, écurie, concours) | fil, carrousels, stories |
| `masc_*.png` | mascotte Cavalons sur fond transparent | habillage de carrousel, jamais en visuel principal |
| `pexels-*.jpg` | portraits de chevaux sans humain, licence Pexels | couvertures, fonds |
| `<numéro>_<l>_<h>_<fps>.mp4` | vidéos Pexels (V = 9:16, H = 16:9) | B-roll de reels |
| `PXL_*` (photos et `.mov`) | tournage téléphone, cavalière et bai | reels « face cam », coulisses |
| `_sources/` | originaux et doublons des `ph_*` | ne pas utiliser directement |
| `telechargement*.png`, noms en hash (`c28c7d9b…`) | produits de marques, illustrations Adobe Stock, signatures | **ne pas publier** |

## Règles de publication (reprises du catalogue)

- **Liste « A NE PAS PUBLIER » du catalogue : impérative.** Signatures de photographes (`ph_chute_drole`, `ph_cabre_concours`, `ph_dressage_dos`…), filigranes Adobe Stock, images IA, visuels de marques.
- **Consentement.** Photos de membres : accord de la personne reconnaissable avant publication ; **enfant reconnaissable = accord parental** (marqué *enfant* dans le catalogue). Signalez-le à l'utilisatrice à chaque proposition concernée ; ne publiez pas sans sa confirmation explicite.
- **Pexels** : usage commercial libre, crédit facultatif, mais **ne jamais les présenter comme des chevaux de membres Cavalons** ou des chevaux à vendre.
- **À recadrer avant usage** (`ph_recadrer_*`, `ph_alezan_tresse_floute`) : bandes noires, icônes incrustées ou visage flouté. Proposez le recadrage (Canva) plutôt que de publier tel quel.
- **Mascotte** : 2 maximum par carrousel, ~280 px de large au plus, toujours secondaire au texte, posée sur le vert `#155b57`.
- **Charte carrousel** : 1080 × 1350 (export 2160 × 2700), fond `#155b57`, titres Gelasio `#def0ee`, texte Poppins `#99cbc7`.
- **Vidéos en reel** : 9:16, 90 s maximum. Les séries Pexels `7880885 … 7881204` (même cavalière, même alezan) se montent en reel « une journée à l'écurie ».

## Du Drive à une URL publiable

Le connecteur Meta exige une **URL publique** stable. Le Drive n'en fournit pas directement :

1. **Images (≤ 15 Mo)** : `mcp__CAVALONS_META__rehost_image` avec
   `https://drive.usercontent.google.com/download?id=<ID>&export=download&confirm=t`
   puis utiliser l'URL renvoyée dans `publish_*` ou `schedule_post`.
2. **Vidéos** : `rehost_image` accepte les MP4 de moins de 15 Mo seulement. La plupart des vidéos Pexels du dossier font 20 à 214 Mo (4K). Il faut d'abord une version 1080 × 1920 compressée (export Canva, ou `ffmpeg -i in.mp4 -vf scale=1080:1920 -c:v libx264 -crf 28 -an out.mp4`), déposée dans le Drive, puis ré-hébergée.
3. **Si `rehost_image` répond « fetch failed »**, y compris sur une URL publique du site : c'est le service d'hébergement Cavalons qui est en panne, pas le Drive. Ne contournez pas ; dites-le et proposez la page d'envoi du connecteur (`/api/upload`, pour une photo depuis le téléphone) ou de réessayer plus tard.
