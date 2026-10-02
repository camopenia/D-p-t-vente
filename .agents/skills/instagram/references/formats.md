# Formats types

Formats validés par Cavalons, à décliner. Pour chacun : la structure, le ton, et comment le produire.

## « Texte du vendredi » (reel texte)

Modèle d'origine : reel de 22 s envoyé par l'équipe le 2 octobre 2026. Vertical 9:16, **sans image et sans son**, texte blanc en serif centré sur un aplat gris, une phrase par carte, environ 3 s par carte.

### Structure (5 à 7 cartes, 20 à 30 s)

| Carte | Rôle | Exemple d'origine |
|---|---|---|
| 1 | Salut familier, très court (accroche) | « Bonjour bordel » |
| 2 | Le contexte qui parle à tout le monde | « On est vendredi et si vous avez passé une semaine de merde, ça se termine ce soir à 18h » |
| 3 | Élargir à tous | « ou peu importe l'heure à laquelle vous finissez ce soir, » |
| 4 | Le déclic | « vous remettez les compteurs à zéro, et vous vous préparez à kiffer votre week-end » |
| 5 | La morale, tenue plus longtemps (2 cartes, ~6 s) | « on a tous des phases de moins bien mais le principal c'est de savoir les laisser de côté et de se dire que des jours meilleurs arrivent » |

### Adaptation Cavalons

- **Ton** : le modèle jure (« bordel », « semaine de merde »). Proposez par défaut une version sans gros mots, avec du vocabulaire d'écurie (« une semaine comme une reprise sans étriers », « laisser ça au vestiaire », « balade, pansage et câlins au box »). La version crue ne se publie que si l'utilisatrice la valide explicitement.
- **Visuel** : aplat vert `#155b57` et texte `#def0ee` (charte), ou une vidéo de cheval de la banque Drive en fond, assombrie (B-roll Pexels vertical, « V » dans le catalogue). Pas d'émoji dans les cartes : ils s'affichent mal en vidéo ; mettez-les dans la légende.
- **Son** : le reel sort muet. Recommandez d'ajouter un son tendance dans l'application Instagram avant de partager, ou publiez muet en connaissance de cause (moins de portée).
- **Quand** : chaque vendredi, publication vers 17 h 30-17 h 45 (heure de Paris), juste avant la fin de journée annoncée par le texte. Programmable avec `schedule_post` (`kind: "reel"`).
- **Légende** : courte, une question pour faire réagir (« Et vous, ce week-end, c'est balade ou concours ? »), 3 à 5 hashtags (#vendredi #weekend #equitation #cheval #ecurie).
- **Varier** : changer l'image de la carte 2 chaque semaine (concours raté, pluie, boue, cheval qui boite, réveil à 6 h pour nourrir…) pour ne pas lasser.

### Produire la vidéo

`scripts/texte-reel.py` génère le MP4 (ffmpeg requis) à partir d'un fichier texte, un paragraphe par carte :

```text
[2.5] Bonjour l'écurie

On est vendredi. Si ta semaine a été une longue reprise sans étriers, elle se termine ce soir.

Peu importe l'heure à laquelle tu finis : on remet les compteurs à zéro.

Ce week-end, c'est balade, pansage et câlins au box.

On a tous des semaines de moins bien. Le principal, c'est de les laisser au vestiaire.

[3] Des jours meilleurs arrivent. Bon week-end
```

```bash
S=.agents/skills/instagram/scripts/texte-reel.py
python3 $S vendredi.txt vendredi.mp4                          # fond vert Cavalons
python3 $S vendredi.txt vendredi.mp4 --fond 15010095.mp4      # fond vidéo assombri
python3 $S vendredi.txt vendredi.mp4 --dossier-polices fonts/ # avec le .ttf Gelasio
```

`[2.5]` en tête de paragraphe fixe la durée de la carte ; sinon elle dépend de la longueur (2,5 à 7 s). Le script place les espaces insécables françaises (« : », « ? », « ! », guillemets), sort un MP4 H.264 1080 × 1920 sans son, et signale s'il dépasse 15 Mo (limite de `rehost_image`). Sans Gelasio installée, il prend Liberation Serif et le dit.

Montrez toujours la vidéo générée à l'utilisatrice avant de la publier ou de la programmer.
