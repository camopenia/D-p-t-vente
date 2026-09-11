import type { Role } from "@/lib/constants";

export interface Guide {
  slug: string;
  title: string;
  summary: string;
  audience: Role | "tous";
  readingMinutes: number;
  body: string; // Markdown
}

export const GUIDES: Guide[] = [
  {
    slug: "acheteurs",
    title: "Guide de l'acheteur : trouver, essayer et acheter le bon cheval",
    summary: "Définir son projet, lire une annonce, organiser visites et essais, sécuriser l'achat avec la visite vétérinaire et le contrat.",
    audience: "acheteur",
    readingMinutes: 9,
    body: `
## 1. Un cheval = un projet

Avant de chercher, écrivez noir sur blanc : votre niveau réel (pas celui que vous visez), l'usage (loisir, club, concours amateur, élevage), qui montera, où le cheval vivra, et votre **budget total**. Au prix d'achat s'ajoutent en moyenne 4 000 à 8 000 € par an (pension, maréchal, vétérinaire, assurance) et la visite d'achat, souvent estimée à 10 % du prix.

Un cheval acheté « pour progresser » doit être plus expérimenté que vous : le duo jeune cavalier / jeune cheval est la première cause de reventes précipitées.

## 2. Lire une annonce

Une bonne annonce est précise : travail actuel et fréquence, résultats vérifiables (FFE), caractère à pied et monté, mode de vie, particularités, raison de la vente, prix affiché. Méfiez-vous des formules creuses (« bon caractère », « polyvalent », « à voir ») et des annonces sans SIRE, sans localisation réelle ou avec un prix très inférieur au marché.

Sur Cavalons Ventes, chaque annonce indique le statut du vendeur (particulier, éleveur, dépôt-vente avec le nom du propriétaire) et si les radios et l'essai sont disponibles.

## 3. Questions à poser avant de vous déplacer

- Depuis quand le vendeur possède-t-il le cheval et pourquoi le vend-il ?
- Historique des propriétaires, mode de vie (box/pré, seul/troupeau), travail et fréquence.
- Comportement à pied, au transport, au maréchal, chez le vétérinaire, avec les autres chevaux.
- Antécédents médicaux : coliques, boiteries, infiltrations, opérations, tics, allergies.
- Alimentation, compléments, dernier vermifuge, vaccins, dents.
- Les papiers : document d'identification original, carte d'immatriculation au nom du vendeur (ou mandat écrit).

Demandez une vidéo récente aux trois allures des deux mains avant de faire des kilomètres.

## 4. La visite et l'essai

Utilisez la demande de visite gratuite depuis l'annonce. Les règles d'usage en France :

1. **Voir le cheval à froid** : allez le chercher au pré ou au box, pansez-le, sellez-le. Un cheval présenté déjà échauffé doit vous interroger.
2. **Le vendeur monte en premier**, puis votre coach, puis vous. Un refus est un signal d'alerte.
3. Venez accompagné (enseignant ou cavalier expérimenté), avec **votre casque**, votre selle si possible, une liste de questions et de quoi filmer.
4. Deux à trois visites suffisent. Si vous n'êtes pas décidé après trois essais, ce n'est pas le bon cheval.
5. Aucune sédation ne doit être administrée avant un essai : la prise de sang lors de la visite vétérinaire le vérifiera.

Un essai à domicile n'est jamais un droit ; s'il est accordé, signez la [convention d'essai](/contrats/essai) (garde, assurance, transport, fin de l'essai).

## 5. La visite vétérinaire d'achat

Faites-la réaliser par **votre** vétérinaire, après l'essai et avant de payer, et inscrivez-la comme condition suspensive dans le contrat. Contenu habituel : examen clinique complet, lecture de la puce et contrôle du livret, locomotion sur sol dur et souple, tests de flexion, radiographies adaptées à l'usage (pieds et boulets antérieurs pour le loisir ; jarrets, grassets, dos pour le sport), prélèvement sanguin conservé pour détecter sédatifs ou anti-inflammatoires.

Ordres de grandeur : 150 à 250 € sans radios, 400 à 600 € avec, 25 à 40 € par cliché. Voir le [guide de la visite vétérinaire](/guides/visite-veterinaire-achat).

## 6. Payer et signer

- **Jamais d'acompte** ni de frais de transport avant d'avoir vu le cheval et lu sa puce.
- Signez le [contrat de vente Cavalons](/contrats/vente) : usage convenu, prix, conditions suspensives, garanties, date de livraison.
- Payez par virement contre remise du document d'identification et de la carte d'immatriculation endossée.
- Assurez le cheval dès le transfert des risques (responsabilité civile, mortalité, frais vétérinaires).

## 7. Après l'achat

Déclarez le changement de propriétaire sur votre espace SIRE **dans les 30 jours** (17 € en 2026), déclarez le lieu de détention, votre vétérinaire sanitaire, et le changement de propriétaire FFE si vous concourez. Si vous êtes un détenteur non professionnel, vous devez disposer du certificat d'engagement et de connaissance. Voir [après la vente](/guides/apres-la-vente).
`,
  },
  {
    slug: "particuliers-vendeurs",
    title: "Guide du vendeur particulier : vendre son cheval sereinement",
    summary: "Rédiger une annonce honnête et efficace, fixer le prix, gérer les visites, se protéger avec un contrat.",
    audience: "particulier",
    readingMinutes: 8,
    body: `
## 1. Préparer la vente

Rassemblez : le document d'identification, la carte d'immatriculation à votre nom (sinon régularisez-la d'abord auprès de l'IFCE), le carnet de vaccination à jour, les comptes rendus vétérinaires et radios récentes, les résultats FFE. Un cheval propre, paré ou ferré récemment, en état, se vend mieux et plus vite.

Si vous ne pouvez pas gérer les visites vous-même, envisagez un [dépôt-vente](/guides/professionnels-depot-vente) avec un contrat écrit.

## 2. Rédiger l'annonce

- **Titre précis** : race, âge, discipline, niveau (« Tango, hongre OC 12 ans, loisir et balade, pied sûr »).
- **Bloc identité complet** : nom, sexe, race, robe, âge, taille, origines, papiers, n° SIRE, vaccins.
- **Niveau réel et tempérament** : décrivez ce que le cheval fait aujourd'hui, à quelle fréquence, avec quel type de cavalier, ses habitudes et ses petits défauts. Les annonces précises reçoivent deux à trois fois plus de demandes de visite.
- **Honnêteté** : tic, allergie, difficulté au ferrage ou à l'embarquement, antécédents. Ce que vous déclarez par écrit ne pourra pas vous être reproché ; ce que vous cachez peut annuler la vente pour dol.
- **Photos** : cheval propre, entier dans le cadre, de profil « modèle », en 3/4 et en mouvement, lumière du jour, fond dégagé. Pas de photo floue, ancienne, de groupe ou de cheval qui broute.
- **Vidéo** : trois allures aux deux mains, monté (plat et saut si CSO), une séquence à pied. Datez-la.
- **Prix affiché** : un prix juste incite à lire l'annonce jusqu'au bout ; un prix gonflé « pour négocier » fait fuir et prolonge les frais de pension.

Voir aussi [rédiger une annonce qui vend](/guides/rediger-une-annonce) et [fixer le prix](/guides/fixer-le-prix).

## 3. Gérer les demandes de visite

Répondez vite depuis votre espace « Visites & essais ». Qualifiez l'acheteur : niveau, projet, qui l'accompagne ; demandez une vidéo de lui à cheval si nécessaire. Ne recevez jamais seul, présentez le cheval en premier, exigez le casque, et soyez franc sur les défauts **avant** que l'acheteur ne monte.

Vous pouvez continuer les visites tant qu'aucun acompte n'est versé ; dites-le honnêtement.

## 4. Sécuriser le paiement

- Ne livrez le cheval que lorsque les fonds sont **crédités et irrévocables** (virement reçu). Refusez chèques de banque douteux, « trop-perçus » à rembourser, acheteur étranger qui « envoie son transporteur ».
- Signez le [contrat de vente](/contrats/vente) : qualifiez la somme versée (acompte ou arrhes), fixez la date de livraison (point de départ des délais de vices rédhibitoires), prévoyez une clause de réserve de propriété si le paiement est échelonné.
- Entre particuliers, vous pouvez limiter la garantie aux vices rédhibitoires du Code rural, à condition d'avoir déclaré tout ce que vous savez.

## 5. Après la vente

Remettez immédiatement le document d'identification et la carte d'immatriculation endossée et signée (ou le certificat de vente édité depuis votre espace SIRE). Si l'acheteur ne fait pas la démarche sous 30 jours, vous pouvez signaler la vente vous-même à l'IFCE. Résiliez votre assurance et informez votre écurie. Passez l'annonce en « Vendu » sur Cavalons.
`,
  },
  {
    slug: "eleveurs",
    title: "Guide de l'éleveur : présenter et valoriser ses produits",
    summary: "Foals, jeunes chevaux, poulinières : papiers, vidéos, prix, valorisation et contrats adaptés à l'élevage.",
    audience: "eleveur",
    readingMinutes: 7,
    body: `
## 1. Ce qui fait vendre un jeune cheval

Les acheteurs de foals et de jeunes chevaux achètent sur trois critères : la **souche** (père, mère, père de mère, performances de la lignée maternelle), le **modèle et les allures** (vidéo en liberté aux trois allures, sur sol plat, cheval propre et paré) et l'**éducation** (licol, pieds, maréchal, embarquement). Une manipulation précoce documentée justifie 10 à 30 % de plus sur un foal de plus d'un an.

Mettez en avant les labels : concours de foals et modèles & allures, championnats de race, résultats de la mère et de la fratrie, approbation étalon envisagée ou non.

## 2. Papiers irréprochables

Inscription au stud-book, filiation ADN quand elle est exigée, carte d'immatriculation à jour, vaccins. Sur Cavalons, le numéro SIRE est obligatoire pour publier. Indiquez clairement le stud-book, l'approbation à la reproduction et, pour une poulinière, la gestation et l'étalon.

## 3. Votre page vitrine

Avec le compte Éleveur, votre page présente votre structure, vos disciplines, votre façon de travailler et l'ensemble de vos chevaux à vendre. Renseignez votre SIRET pour obtenir le badge « Professionnel vérifié ». Vos annonces affichent « directement de l'éleveur », un critère recherché par les acheteurs.

## 4. Vente d'un foal ou d'un jeune : processus type

1. Réservation sur vidéo et visite à l'élevage.
2. Contrat de vente avec **acompte** qualifié, date de livraison (souvent au sevrage), garde et assurance jusqu'à la livraison, visite vétérinaire au sevrage en condition suspensive.
3. Solde à la livraison contre remise des papiers ; déclaration SIRE par l'acheteur sous 30 jours.

Le [contrat de vente Cavalons](/contrats/vente) prévoit ces options. En tant que professionnel, vous êtes présumé connaître les vices cachés : déclarez tout ce que vous savez et documentez l'état de santé (examen d'entrée, radios).

## 5. TVA et facturation

Les ventes de chevaux de sport et de loisir relèvent du taux normal (20 %) ; le taux de 5,5 % est réservé aux équidés destinés à la reproduction ou à la production agricole. Affichez vos prix HT et TTC (l'annonce Cavalons le permet), remettez une facture avec l'identification complète du cheval et le régime de TVA. Faites valider votre régime par votre comptable (RSA, remboursement forfaitaire, régime de la marge).

## 6. Valoriser sous la selle ?

Ne valorisez (cycles classiques 4-6 ans) que si la qualité de base amortit le coût. Signez un contrat écrit avec le cavalier : prix, durée, frais, assurance, résultats attendus. Une performance officielle peut doubler la valeur d'un cheval à niveau équivalent.

## 7. Médiation de la consommation

Un vendeur professionnel doit garantir à l'acheteur consommateur l'accès à un médiateur de la consommation : mentionnez-le dans vos contrats et sur votre page.
`,
  },
  {
    slug: "professionnels-depot-vente",
    title: "Guide du professionnel dépôt-vente : mandat, commission, transparence",
    summary: "Cadre juridique du dépôt-vente, contrat avec le propriétaire, présentation aux acheteurs, essais et reddition de comptes.",
    audience: "pro_depot",
    readingMinutes: 8,
    body: `
## 1. Ce qu'est juridiquement un dépôt-vente

Un contrat mixte : **dépôt salarié** (garde et soins, art. 1915 s. du Code civil), **contrat d'entreprise** (travail et valorisation) et **mandat de vente** (art. 1984 s.). Le cheval reste la propriété du déposant ; vous devez rendre compte de votre gestion. Sans écrit, la commission, la pension, la responsabilité en cas d'accident et le sort du cheval en cas d'impayés sont sources de litige.

Le [contrat de dépôt-vente Cavalons](/contrats/depot-vente) formalise tout cela.

## 2. Le contrat avec le propriétaire

- Identification du cheval et **état des lieux d'entrée** (examen vétérinaire d'entrée conseillé). Le propriétaire conserve la carte d'immatriculation.
- **Prix affiché et prix plancher**, révisables par écrit.
- **Commission** : 10 à 15 % du prix est l'usage ; assiette (HT/TTC), exigibilité à l'encaissement, TVA, clause de suite (acheteur présenté par vous qui achète après la fin du mandat).
- **Pension** et prestations incluses ; frais exclus sur accord préalable avec un seuil d'urgence.
- **Exclusivité** ou non ; pouvoir de négocier ou de conclure.
- Essais autorisés, assurance (qui souscrit quoi), durée, préavis, restitution.

## 3. Présenter le cheval aux acheteurs

- Sur l'annonce, cochez « je vends pour le compte d'un tiers » et indiquez pour qui : les acheteurs voient la mention « en dépôt-vente ». Un mandataire qui ne révèle pas son mandat s'expose à être traité comme le vendeur.
- Vidéos récentes datées, radios consultables par le vétérinaire de l'acheteur, disponibilité pour les essais à l'écurie.
- Tenez un **registre des visites et essais** et faites un compte rendu au propriétaire après chaque visite.
- Aucune vente conclue sans l'accord écrit du propriétaire (sauf pouvoir de conclure dans le mandat).

## 4. Essais et responsabilité

Pendant un essai à l'écurie, vous restez gardien du cheval : cavalier de niveau adapté, casque, décharge signée, présence d'un membre de l'équipe. Pour un essai hors de l'écurie, faites signer la [convention d'essai](/contrats/essai) acceptée par le propriétaire (garde, assurance sans carence, transport).

## 5. Conclure la vente

La vente est signée au nom du propriétaire avec le [contrat de vente Cavalons](/contrats/vente), qui mentionne l'intermédiaire et sa rémunération. Vous répondez de l'exactitude des informations que vous avez données ; les garanties légales pèsent sur le propriétaire-vendeur. Reversez le prix sous 10 jours avec un relevé de compte.

## 6. Statut et obligations

Négocier habituellement des ventes pour autrui peut relever du statut d'agent commercial (immatriculation RSAC) ou de courtier ; votre commission est soumise à TVA ; vous devez proposer un médiateur de la consommation aux particuliers. Faites valider votre statut par un conseil. Sur Cavalons, renseignez votre SIRET pour le badge « Professionnel vérifié ».
`,
  },
  {
    slug: "eviter-les-arnaques",
    title: "Éviter les arnaques à l'achat et à la vente de chevaux",
    summary: "Les schémas d'escroquerie les plus fréquents et les réflexes qui vous protègent.",
    audience: "tous",
    readingMinutes: 6,
    body: `
## Les schémas les plus fréquents

1. **Fausse annonce et acompte** : cheval trop beau et trop peu cher, vendeur injoignable physiquement ou « à l'étranger », « beaucoup d'intérêt, versez un acompte pour le réserver ». Plus de 90 % des arnaques étudiées par un grand site d'annonces concernaient un annonceur ou un cheval à l'étranger. Photos volées sur des sites d'éleveurs.
2. **Cheval « à donner »** contre des frais de transport ou d'agence : copie de l'arnaque « voiture à donner ».
3. **Faux transporteurs** qui encaissent un acompte après une demande de transport publiée, parfois en usurpant l'identité d'un vrai transporteur.
4. **Côté vendeur** : faux chèques de banque, virement « en attente », trop-perçu à rembourser, mandat cash, acheteur étranger qui « envoie son transporteur » avant paiement.
5. **Fraudes sur le cheval** : sédation ou antalgiques à l'essai (effet visible quelques semaines plus tard), vices et pathologies non déclarés, âge ou identité falsifiés, cheval vendu par un intermédiaire sans mandat, radios qui ne sont pas celles du cheval.
6. **Hameçonnage** au nom de la plateforme : Cavalons ne vous demandera jamais de coordonnées bancaires par email ou SMS.

## Les réflexes qui protègent

- **Aucun acompte, frais de réservation ou de transport avant d'avoir vu le cheval et lu sa puce.**
- Exigez le document d'identification original et la carte d'immatriculation au nom du vendeur, ou un mandat écrit. Vérifiez la fiche du cheval sur le site de l'IFCE et ses résultats sur le site FFE.
- Voyez le cheval à froid, montez après le vendeur, revenez plusieurs fois.
- Visite vétérinaire par **votre** vétérinaire, avec prise de sang conservée, en condition suspensive du contrat.
- Signez un contrat écrit ; payez par virement contre remise des papiers ; vendeurs : ne livrez qu'après fonds irrévocables.
- Recherche d'image inversée sur les photos ; méfiez-vous des textes copiés-collés, des réponses vagues sur le passé, des changements de propriétaire récents, du « vendu en l'état ».
- Utilisez la messagerie Cavalons : les coordonnées ne sont pas affichées en clair et les échanges sont conservés.

## Signaler

Chaque annonce comporte un bouton « Signaler ». Nous retirons immédiatement les annonces suspectes (cheval à l'étranger avec vendeur injoignable, prix anormal, photos dupliquées, mots-clés d'arnaque) et bloquons les comptes concernés. En cas d'escroquerie avérée, déposez plainte et conservez tous les échanges.
`,
  },
  {
    slug: "visite-et-essai",
    title: "Visites et essais : les règles du jeu",
    summary: "Qui monte en premier, ce qu'il faut apporter, combien de visites, comment encadrer un essai à domicile.",
    audience: "tous",
    readingMinutes: 5,
    body: `
## Avant la visite

L'acheteur demande la visite depuis l'annonce (gratuit) en précisant son niveau, son projet et qui l'accompagnera. Le vendeur répond avec un créneau, l'adresse et ce qu'il faut apporter. Le vendeur peut demander une vidéo de l'acheteur à cheval ; l'acheteur peut demander une vidéo récente du cheval.

## Pendant la visite

- **Le cheval est vu à froid** : l'acheteur peut aller le chercher, le panser et le seller.
- **Ordre de monte** : le vendeur ou son cavalier, puis le coach de l'acheteur, puis l'acheteur.
- **Casque obligatoire** pour toute personne qui monte ; gilet recommandé. Pas d'essai de nuit ou sur terrain dangereux.
- Le vendeur n'est jamais seul ; l'acheteur vient accompagné.
- Le vendeur annonce les défauts et particularités **avant** la monte.
- **Aucune sédation ni antalgique** : la prise de sang de la visite vétérinaire peut le détecter.
- Filmer est autorisé avec l'accord du vendeur.

## Combien de visites ?

Deux à trois, éventuellement dans des conditions différentes (carrière, extérieur). Le vendeur poursuit ses visites tant qu'aucun acompte n'est versé et le dit clairement.

## L'essai à domicile

Ce n'est jamais un droit. S'il est accordé : durée courte (7 à 15 jours, un mois maximum), [convention d'essai](/contrats/essai) signée, assurance mortalité et frais vétérinaires **sans délai de carence** souscrite par l'essayeur, responsabilité civile, transport aller-retour à la charge de l'essayeur, usage limité (pas de concours), notification écrite avant la fin. Sans écrit, la responsabilité en cas d'accident dépend du transfert de garde et reste imprévisible.

## Après la visite

L'acheteur donne une réponse, même négative, dans les jours qui suivent. Le vendeur marque la visite comme « effectuée » dans son espace. Si l'intérêt se confirme : visite vétérinaire, puis contrat.
`,
  },
  {
    slug: "visite-veterinaire-achat",
    title: "La visite vétérinaire d'achat",
    summary: "Contenu, radios, prise de sang, coût, et comment l'inscrire dans le contrat.",
    audience: "tous",
    readingMinutes: 5,
    body: `
## Pourquoi

Elle n'est pas obligatoire mais devient la pièce maîtresse en cas de litige : elle fixe l'état du cheval au jour de la vente. Un défaut révélé par la visite ne pourra plus être invoqué ensuite ; un défaut qu'elle n'a pas pu déceler pourra l'être plus facilement.

## Qui et quand

Par le vétérinaire **choisi par l'acheteur**, indépendant du vendeur, après l'essai et avant tout paiement définitif. Inscrivez-la comme **condition suspensive** dans le [contrat de vente](/contrats/vente) : nom du vétérinaire, protocole, date limite, qui paie, ce qui se passe en cas d'avis défavorable.

## Contenu

- Examen clinique général : cœur, poumons, yeux, dents, appareil locomoteur.
- **Identification** : lecture de la puce et contrôle du document d'identification.
- Locomotion sur sol dur et souple, en ligne droite et sur le cercle, tests de flexion.
- **Radiographies** adaptées à l'usage : pieds et boulets antérieurs pour le loisir et le club ; jarrets, grassets, dos pour le sport et les chevaux de valeur.
- Endoscopie pour le cornage si nécessaire, échographie tendineuse en cas de doute.
- **Prélèvement sanguin conservé** plusieurs semaines : analysable en cas de doute sur une sédation ou un anti-inflammatoire.

## Coût

De 150 à 250 € sans radios, 400 à 600 € avec un bilan radiographique standard, 25 à 40 € par cliché supplémentaire. C'est un investissement rapporté au prix du cheval et aux frais annuels.

## Lire le compte rendu

Le vétérinaire ne « valide » pas un cheval : il décrit des constats et un risque au regard de l'usage prévu. Discutez-en avec lui, demandez une copie des clichés, et gardez tout : le compte rendu est annexé au contrat.
`,
  },
  {
    slug: "fixer-le-prix",
    title: "Fixer le prix d'un cheval : repères de marché",
    summary: "Fourchettes indicatives par catégorie et critères qui font varier la valeur.",
    audience: "tous",
    readingMinutes: 4,
    body: `
## Le marché en bref

Après dix ans de hausse, le marché français a marqué un repli en 2025 (prix moyen des ventes observées autour de 8 000 €). Les prix restent très dispersés selon le niveau, l'âge, les origines et la région (Île-de-France et Normandie plus chères).

## Fourchettes indicatives

| Catégorie | Fourchette observée |
|---|---|
| Cheval de club réformé, loisir tranquille (15 ans et plus) | 1 000 à 2 500 € |
| Cheval de loisir polyvalent 8 à 15 ans | 3 000 à 8 000 € |
| Jeune cheval 4 ans débourré sans résultats | 3 000 à 5 000 € |
| Foal de l'année | 1 200 à 5 000 € hors lignées, moyenne 6 000 à 7 000 € en vente aux enchères |
| Poulain 1 à 3 ans | 4 000 à 8 000 € en moyenne |
| Amateur confirmé CSO, dressage, complet | 8 000 à 20 000 € et plus |
| CSO classé à 1,30 m et plus | 20 000 à 45 000 € et plus |
| Shetland | 500 à 3 000 € |
| Poney de sport avec résultats | plus de 6 000 € |

Ces fourchettes sont issues de forums, guides et places de marché ; elles ne constituent pas une cote officielle.

## Ce qui fait monter ou baisser le prix

- **Âge** : pic de valeur entre 7 et 12 ans pour un cheval de sport.
- **Résultats officiels** : une performance FFE vérifiable peut doubler la valeur à niveau équivalent.
- **Origines** et stud-book, approbation étalon.
- **Santé documentée** : radios récentes propres, visite vétérinaire acceptée.
- **Facilité** : cheval sûr en extérieur, facile au transport et au maréchal, adapté aux enfants.
- **Papiers** : ONC et OC se vendent nettement moins cher qu'un cheval inscrit.

## Conseils

Regardez les annonces comparables sur Cavalons (même race, âge, niveau, région). Affichez un prix net et honnête avec une marge de négociation modeste plutôt qu'un « à débattre » vague. Un prix gonflé prolonge la vente et les frais de pension. Professionnels : indiquez HT et TTC.
`,
  },
  {
    slug: "rediger-une-annonce",
    title: "Rédiger une annonce qui vend (et qui vous protège)",
    summary: "Titre, structure, photos, vidéo, mots à éviter et check-list avant publication.",
    audience: "tous",
    readingMinutes: 4,
    body: `
## Le titre

Race, âge, discipline, niveau, et un élément différenciant : « Quartz, SF 4 ans par Diamant de Semilly, 4 sans-faute en cycles classiques ». Évitez les majuscules et les points d'exclamation.

## La structure

1. **Identité** : nom, sexe, race, robe, âge, taille, origines, papiers, SIRE, vaccins.
2. **Travail actuel** : discipline, fréquence, niveau réel, résultats vérifiables, cavalier habituel.
3. **Caractère et mode de vie** : à pied et monté, box/pré, seul/troupeau, maréchal, transport, vétérinaire.
4. **Santé et particularités** : antécédents, tics, allergies, traitements. Déclarer par écrit vous protège.
5. **Raison de la vente** et profil de cavalier recherché.
6. **Conditions** : visite, essai, radios disponibles, prix affiché, HT/TTC pour les pros.

## Photos et vidéo

Cheval propre, entier dans le cadre, de profil « modèle » avec les quatre membres visibles, puis 3/4 avant, en mouvement, monté. Lumière du jour, fond dégagé. Vidéo courte : trois allures aux deux mains, en liberté pour un jeune, monté pour un cheval au travail, plus une séquence à pied. Datez la vidéo.

## Les mots qui font fuir

« Bon caractère », « polyvalent », « à voir », « vendu en l'état », « prix à débattre » sans prix, « urgent ». Ils cachent souvent quelque chose et les acheteurs le savent.

## Check-list avant publication

- Le test Horse & Hound : « irais-je voir ce cheval ? » Si non, réécrivez.
- Fautes relues par un tiers, texte aéré.
- Au moins trois photos et une vidéo.
- Numéro SIRE saisi, localisation réelle.
- Prix affiché et cohérent avec le marché.
- Cases « visite », « essai », « visite vétérinaire acceptée » cochées si c'est le cas.
- Répondez aux demandes sous 48 h et mettez l'annonce à jour (réservé, vendu).
`,
  },
  {
    slug: "apres-la-vente",
    title: "Après la vente : SIRE, assurance, retour",
    summary: "Les démarches obligatoires dans les 30 jours et ce qu'il faut savoir sur les garanties après la livraison.",
    audience: "tous",
    readingMinutes: 4,
    body: `
## Côté vendeur

- Remettre **immédiatement** le document d'identification original et la carte d'immatriculation endossée et signée, ou le certificat de vente édité depuis l'espace SIRE.
- Remettre une facture si vous êtes professionnel.
- Résilier ou transférer l'assurance, informer l'écurie, passer l'annonce en « Vendu ».
- Si l'acheteur ne déclare pas l'achat sous 30 jours, vous pouvez signaler la vente à l'IFCE depuis votre espace.

## Côté acheteur

- **Déclarer le changement de propriétaire** sur votre espace SIRE dans les 30 jours (17 € en ligne au tarif 2026). C'est une obligation légale (art. D212-49 du Code rural).
- Déclarer le lieu de détention et votre vétérinaire sanitaire.
- Détenteur non professionnel : disposer du certificat d'engagement et de connaissance.
- Changement de propriétaire FFE pour concourir.
- Assurer le cheval dès le transfert des risques : responsabilité civile (vérifiez votre licence), mortalité et vol, frais vétérinaires.

## Garanties après la livraison

- **Vices rédhibitoires** : 7 vices seulement (immobilité, emphysème, cornage chronique, tic, boiteries anciennes intermittentes, uvéite isolée, anémie infectieuse), à faire constater par un vétérinaire et à porter devant le juge du lieu où se trouve le cheval dans les **10 jours** de la livraison (30 jours pour l'uvéite et l'anémie infectieuse).
- **Vices cachés** du Code civil : uniquement si le contrat le prévoit expressément (ou si l'usage convenu l'implique). Deux ans à compter de la découverte.
- **Garantie contractuelle** : si le contrat prévoit une reprise, respectez la procédure (lettre recommandée, certificat vétérinaire, délai).
- **Dol** : un défaut dissimulé sciemment permet d'annuler la vente, sans délai court.
- La garantie légale de conformité ne s'applique plus aux animaux depuis 2022.

## Retour

Hors clause contractuelle (essai, garantie de reprise, droit de préférence), il n'existe pas de « droit au retour ». En cas de désaccord, privilégiez la médiation : plus rapide et moins coûteuse qu'un procès (plus de 600 jours en moyenne pour une décision définitive).
`,
  },
];

export function getGuide(slug: string) {
  return GUIDES.find((g) => g.slug === slug) ?? null;
}
