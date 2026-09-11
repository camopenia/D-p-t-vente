/**
 * Modèles de contrats Cavalons Ventes.
 * Chaque modèle est décrit par ses champs (formulaire) et une fonction qui produit les articles
 * à partir des valeurs saisies. Les textes s'appuient sur le Code civil, le Code rural (L213-1 s.,
 * R213-1 s., D212-49, R215-14) et le modèle IDE/IFCE (nov. 2024). Voir docs/cadre-juridique.md.
 */

export type FieldType = "text" | "textarea" | "number" | "date" | "select" | "checkbox";
export interface ContractField {
  name: string;
  label: string;
  type: FieldType;
  section: string;
  placeholder?: string;
  options?: [string, string][];
  help?: string;
  default?: string | boolean | number;
}
export interface ContractSection {
  title: string;
  paragraphs: string[];
}
export interface ContractTemplate {
  id: "vente" | "depot-vente" | "essai";
  title: string;
  subtitle: string;
  intro: string;
  fields: ContractField[];
  build: (v: Record<string, string>) => ContractSection[];
  signatures: string[];
  annexes: string[];
}

const v = (x: string | undefined, fallback = "________________") => (x && x.trim() ? x.trim() : fallback);
const on = (x: string | undefined) => x === "true" || x === "on";
const dateFr = (x?: string) => (x ? new Date(x).toLocaleDateString("fr-FR") : "___/___/______");
const eur = (x?: string) => (x && !isNaN(Number(x)) ? `${Number(x).toLocaleString("fr-FR")} €` : "________ €");

const partyFields = (prefix: string, label: string, section: string): ContractField[] => [
  { name: `${prefix}_name`, label: `${label} – nom / raison sociale`, type: "text", section },
  { name: `${prefix}_address`, label: "Adresse complète", type: "text", section },
  { name: `${prefix}_id`, label: "Né(e) le / SIRET si professionnel", type: "text", section },
  { name: `${prefix}_contact`, label: "Téléphone et email", type: "text", section },
  { name: `${prefix}_pro`, label: "Agit en qualité de professionnel", type: "checkbox", section },
];

const horseFields = (section: string): ContractField[] => [
  { name: "horse_name", label: "Nom du cheval", type: "text", section },
  { name: "horse_sire", label: "Numéro SIRE / UELN", type: "text", section, placeholder: "23000123456A" },
  { name: "horse_chip", label: "Numéro de transpondeur (puce)", type: "text", section },
  { name: "horse_breed", label: "Race / stud-book", type: "text", section },
  { name: "horse_sex", label: "Sexe", type: "select", section, options: [["jument", "Jument"], ["hongre", "Hongre"], ["entier", "Entier"], ["pouliche", "Pouliche"], ["poulain", "Poulain"]] },
  { name: "horse_birth", label: "Date de naissance", type: "date", section },
  { name: "horse_color", label: "Robe et signalement", type: "text", section },
  { name: "horse_height", label: "Taille (cm)", type: "number", section },
  { name: "horse_origins", label: "Origines (père, mère, père de mère)", type: "text", section },
];

const partyText = (p: Record<string, string>, prefix: string, role: string) =>
  `${v(p[`${prefix}_name`])}, ${on(p[`${prefix}_pro`]) ? "agissant en qualité de professionnel" : "agissant en qualité de non-professionnel"}, ${v(p[`${prefix}_id`], "né(e) le ___/___/______ / SIRET ______________")}, demeurant ${v(p[`${prefix}_address`])}, joignable au ${v(p[`${prefix}_contact`])}, ci-après « ${role} ».`;

const horseText = (p: Record<string, string>) =>
  `Nom : ${v(p.horse_name)} · Race : ${v(p.horse_breed)} · Sexe : ${v(p.horse_sex)} · Né(e) le : ${dateFr(p.horse_birth)} · Robe / signalement : ${v(p.horse_color)} · Taille : ${v(p.horse_height, "____")} cm · N° SIRE/UELN : ${v(p.horse_sire)} · Transpondeur : ${v(p.horse_chip)} · Origines : ${v(p.horse_origins)}.`;

const mediationText = (proInvolved: boolean) => [
  "En cas de différend relatif à la formation, l'exécution ou l'interprétation du présent contrat, les parties s'engagent à rechercher une solution amiable et, à défaut, à recourir à une médiation préalablement à toute action judiciaire (art. 750-1 du Code de procédure civile pour les litiges n'excédant pas 5 000 €). Le médiateur est choisi d'un commun accord parmi les médiateurs spécialisés en droit équin (ex. Institut du Droit Équin, Pégase Médiation).",
  ...(proInvolved
    ? ["Conformément aux articles L612-1 et suivants du Code de la consommation, l'acheteur consommateur peut recourir gratuitement au médiateur de la consommation dont relève le vendeur professionnel : ______________________ (coordonnées à compléter par le professionnel)."]
    : []),
  "Le présent contrat est soumis au droit français. À défaut d'accord amiable, le litige est porté devant le tribunal judiciaire compétent.",
];

/* ------------------------------------------------------------------ */
/* 1. CONTRAT DE VENTE                                                  */
/* ------------------------------------------------------------------ */
export const venteTemplate: ContractTemplate = {
  id: "vente",
  title: "Contrat de vente d'équidé",
  subtitle: "Entre un vendeur (particulier, éleveur ou professionnel) et un acheteur",
  intro:
    "Ce modèle formalise la vente d'un cheval ou d'un poney : identification, prix, conditions suspensives (visite vétérinaire, essai), transfert de propriété, garanties et formalités SIRE. Il s'inspire du modèle de l'Institut du Droit Équin / IFCE (novembre 2024).",
  fields: [
    ...partyFields("seller", "Vendeur", "Les parties"),
    { name: "seller_owner", label: "Le vendeur est le propriétaire inscrit au SIRE (sinon, joindre le mandat)", type: "checkbox", section: "Les parties", default: true },
    { name: "intermediary", label: "Intermédiaire (dépôt-vente, courtier) – nom et rémunération, le cas échéant", type: "text", section: "Les parties", placeholder: "Ex. Écurie X, commission 10 % TTC à la charge du vendeur" },
    ...partyFields("buyer", "Acheteur", "Les parties"),
    ...horseFields("Le cheval"),
    { name: "usage_current", label: "Usage actuel du cheval", type: "text", section: "Usage", placeholder: "Ex. CSO amateur 1,10 m, sort en concours régulièrement" },
    { name: "usage_intended", label: "Usage auquel l'acheteur le destine", type: "text", section: "Usage", placeholder: "Ex. loisir et CSO club" },
    { name: "rider", label: "Cavalier principal et niveau", type: "text", section: "Usage" },
    { name: "trials_done", label: "Essais réalisés avant la vente (dates, lieu)", type: "text", section: "Usage" },
    { name: "declarations", label: "Déclarations du vendeur sur l'état de santé, le comportement, les antécédents et traitements", type: "textarea", section: "Usage", help: "Tics, allergies, opérations, boiteries, coliques, comportement au ferrage/transport, etc. Ce qui est déclaré ici ne pourra pas être reproché plus tard : soyez exhaustif." },
    { name: "price", label: "Prix de vente (€)", type: "number", section: "Prix et paiement" },
    { name: "price_vat", label: "Régime TVA", type: "select", section: "Prix et paiement", options: [["none", "Vente entre particuliers – hors champ de la TVA"], ["ttc20", "Prix TTC, TVA 20 % incluse (vendeur assujetti)"], ["ttc55", "Prix TTC, TVA 5,5 % incluse (équidé destiné à la reproduction / production agricole)"], ["margin", "Régime de la marge (art. 297 A CGI)"]] },
    { name: "deposit", label: "Somme versée à la signature (€)", type: "number", section: "Prix et paiement" },
    { name: "deposit_kind", label: "Nature de la somme versée", type: "select", section: "Prix et paiement", options: [["acompte", "Acompte (engagement définitif)"], ["arrhes", "Arrhes (faculté de dédit, art. 1590 C. civ.)"]] },
    { name: "payment", label: "Modalités de paiement du solde", type: "text", section: "Prix et paiement", placeholder: "Ex. virement bancaire avant la livraison ; ou 3 mensualités de …" },
    { name: "reserve", label: "Clause de réserve de propriété jusqu'au complet paiement", type: "checkbox", section: "Prix et paiement", default: true },
    { name: "cond_vet", label: "Condition suspensive : visite vétérinaire d'achat", type: "checkbox", section: "Conditions suspensives", default: true },
    { name: "vet_name", label: "Vétérinaire (nom, clinique) – choisi par l'acheteur", type: "text", section: "Conditions suspensives" },
    { name: "vet_protocol", label: "Protocole de la visite", type: "text", section: "Conditions suspensives", placeholder: "Examen clinique, tests de flexion, radios : pieds, boulets, jarrets, dos ; prise de sang conservée" },
    { name: "vet_deadline", label: "Date limite de réalisation de la visite", type: "date", section: "Conditions suspensives" },
    { name: "vet_costs", label: "Frais de la visite à la charge de", type: "select", section: "Conditions suspensives", options: [["buyer", "l'acheteur"], ["seller", "le vendeur"], ["shared", "moitié chacun"]] },
    { name: "cond_trial", label: "Condition suspensive : période d'essai", type: "checkbox", section: "Conditions suspensives" },
    { name: "trial_dates", label: "Dates et lieu de l'essai", type: "text", section: "Conditions suspensives", help: "Utilisez aussi la convention d'essai Cavalons pour organiser garde, assurance et transport." },
    { name: "delivery_date", label: "Date de livraison / remise du cheval", type: "date", section: "Livraison et transfert" },
    { name: "delivery_place", label: "Lieu de livraison", type: "text", section: "Livraison et transfert" },
    { name: "transport", label: "Transport organisé et payé par", type: "select", section: "Livraison et transfert", options: [["buyer", "l'acheteur"], ["seller", "le vendeur"]] },
    { name: "warranty", label: "Régime de garantie choisi", type: "select", section: "Garanties", options: [["legal", "Vices rédhibitoires du Code rural uniquement (régime légal par défaut)"], ["hidden", "Vices rédhibitoires + garantie des vices cachés (art. 1641 s. C. civ.) expressément convenue"], ["contractual", "Vices rédhibitoires + garantie contractuelle de reprise"]] },
    { name: "warranty_months", label: "Durée de la garantie contractuelle (mois)", type: "number", section: "Garanties", default: 3 },
    { name: "right_of_first_refusal", label: "Droit de préférence du vendeur en cas de revente", type: "checkbox", section: "Garanties" },
    { name: "place", label: "Fait à", type: "text", section: "Signature" },
    { name: "date", label: "Le", type: "date", section: "Signature" },
  ],
  build(p) {
    const proInvolved = on(p.seller_pro) || on(p.buyer_pro);
    const sections: ContractSection[] = [
      { title: "Entre les soussignés", paragraphs: [partyText(p, "seller", "le Vendeur"), partyText(p, "buyer", "l'Acheteur"), on(p.seller_owner) ? "Le Vendeur déclare être le propriétaire de l'équidé, inscrit comme tel au fichier central SIRE tenu par l'IFCE, et avoir la pleine capacité de le vendre." : "Le Vendeur déclare agir pour le compte du propriétaire inscrit au fichier SIRE en vertu d'un mandat écrit annexé au présent contrat.", p.intermediary?.trim() ? `Les parties déclarent avoir été mises en relation par l'intermédiaire suivant : ${v(p.intermediary)}. Cet intermédiaire n'est pas partie à la vente.` : "Les parties déclarent avoir été mises en relation par la plateforme Cavalons Ventes, qui n'est pas partie à la vente et ne perçoit aucune commission."] },
      { title: "Article 1 – Objet : désignation de l'équidé", paragraphs: [`Le Vendeur vend à l'Acheteur, qui accepte, l'équidé suivant : ${horseText(p)}`, "L'équidé est identifié par transpondeur électronique et dispose d'un document d'identification (livret/passeport) et d'une carte d'immatriculation (ou d'un certificat de vente SIRE) qui seront remis à l'Acheteur dans les conditions de l'article 7."] },
      { title: "Article 2 – Usage convenu et déclarations", paragraphs: [`Usage actuel de l'équidé : ${v(p.usage_current)}. Usage auquel l'Acheteur destine l'équidé : ${v(p.usage_intended)}. Cavalier principal : ${v(p.rider)}.`, `Essais réalisés avant la vente : ${v(p.trials_done, "aucun / voir convention d'essai")}.`, `Déclarations du Vendeur sur l'état de santé, le comportement, les antécédents et les traitements de l'équidé : ${v(p.declarations, "néant")}.`, "Conformément à l'article 1112-1 du Code civil, chaque partie déclare avoir communiqué à l'autre toutes les informations dont l'importance est déterminante pour son consentement. L'Acheteur reconnaît avoir pu examiner l'équidé et ne pourra invoquer les défauts apparents dont il a pu se convaincre lui-même (art. 1642 C. civ).", on(p.buyer_pro) ? "" : "L'Acheteur, non professionnel, déclare disposer du certificat d'engagement et de connaissance prévu à l'article L211-10-1 du Code rural."].filter(Boolean) },
      { title: "Article 3 – Prix et paiement", paragraphs: [`La vente est consentie moyennant le prix de ${eur(p.price)} (${{ none: "vente entre particuliers, hors champ de la TVA", ttc20: "toutes taxes comprises, TVA au taux de 20 % incluse", ttc55: "toutes taxes comprises, TVA au taux de 5,5 % incluse – équidé destiné à la production agricole", margin: "régime de la marge, art. 297 A CGI, TVA non récupérable" }[p.price_vat ?? "none"] ?? ""}).`, p.deposit && Number(p.deposit) > 0 ? `L'Acheteur verse ce jour la somme de ${eur(p.deposit)} à titre ${p.deposit_kind === "arrhes" ? "d'arrhes : chacune des parties peut se dédire, l'Acheteur en perdant les arrhes, le Vendeur en restituant le double (art. 1590 C. civ.)" : "d'acompte, imputable sur le prix ; le versement engage définitivement les parties"}. Si une condition suspensive de l'article 4 défaille, cette somme est intégralement restituée.` : "Aucune somme n'est versée à la signature.", `Le solde est payable selon les modalités suivantes : ${v(p.payment, "par virement bancaire avant la livraison")}. Tout retard de paiement entraîne la déchéance du terme et l'exigibilité immédiate du solde.`, on(p.reserve) ? "Clause de réserve de propriété (art. 2367 et s. C. civ.) : le Vendeur conserve la propriété de l'équidé jusqu'au complet paiement du prix ; la carte d'immatriculation n'est remise qu'à cette date. L'Acheteur en assure néanmoins la garde et les risques dès la livraison." : "", on(p.seller_pro) ? "Le Vendeur, professionnel, remet une facture mentionnant l'identification complète de l'équidé et le régime de TVA applicable." : ""].filter(Boolean) },
      { title: "Article 4 – Conditions suspensives", paragraphs: [on(p.cond_vet) ? `La vente est conclue sous la condition suspensive d'une visite vétérinaire d'achat réalisée par ${v(p.vet_name, "un vétérinaire choisi par l'Acheteur")}, au plus tard le ${dateFr(p.vet_deadline)}, aux frais ${{ buyer: "de l'Acheteur", seller: "du Vendeur", shared: "partagés par moitié" }[p.vet_costs ?? "buyer"]}. Protocole convenu : ${v(p.vet_protocol, "examen clinique complet, contrôle d'identité (puce), locomotion et tests de flexion, radiographies selon prescription du vétérinaire, prélèvement sanguin conservé")}. L'Acheteur dispose de 10 jours après réception des conclusions pour renoncer à l'achat par écrit si la visite révèle une affection incompatible avec l'usage convenu ; à défaut la condition est réputée réalisée. En cas de renonciation, les sommes versées sont restituées et l'équidé reste chez le Vendeur.` : "La vente n'est pas subordonnée à une visite vétérinaire d'achat ; l'Acheteur déclare avoir été informé de l'intérêt d'une telle visite et y renonce en connaissance de cause.", on(p.cond_trial) ? `La vente est en outre conclue sous la condition suspensive d'un essai (art. 1588 C. civ.) : ${v(p.trial_dates)}. Les conditions de garde, d'assurance et de transport pendant l'essai font l'objet de la convention d'essai annexée. À défaut de notification écrite de refus par l'Acheteur au plus tard le dernier jour de l'essai, la condition est réputée réalisée.` : "", "Pendant la réalisation des conditions suspensives, l'équidé demeure sous la garde et aux risques du Vendeur, sauf stipulation contraire de la convention d'essai."].filter(Boolean) },
      { title: "Article 5 – Garanties", paragraphs: ["Rappel du régime légal : conformément aux articles L213-1 et suivants et R213-1 et suivants du Code rural, la vente d'un équidé est garantie, à défaut de convention contraire, contre les seuls vices rédhibitoires suivants : immobilité, emphysème pulmonaire, cornage chronique, tic proprement dit avec ou sans usure des dents, boiteries anciennes intermittentes, uvéite isolée, anémie infectieuse. L'action doit être introduite, et la nomination d'experts demandée au juge du lieu où se trouve l'animal, dans les 10 jours de la livraison (30 jours pour l'uvéite isolée et l'anémie infectieuse).", "La garantie légale de conformité du Code de la consommation ne s'applique pas aux ventes d'animaux domestiques (art. L217-2, 3°).", p.warranty === "hidden" ? "Convention contraire (art. L213-1 C. rural) : les parties conviennent expressément de soumettre en outre la vente à la garantie des vices cachés des articles 1641 et suivants du Code civil, pour tout défaut caché, antérieur à la vente, rendant l'équidé impropre à l'usage convenu à l'article 2. L'action est exercée dans les deux ans de la découverte du vice (art. 1648)." : "", p.warranty === "contractual" ? `Garantie contractuelle : le Vendeur s'engage, pendant ${v(p.warranty_months, "3")} mois à compter de la livraison, à reprendre l'équidé et à restituer le prix (hors frais de transport) si un vétérinaire établit qu'un défaut non apparent, antérieur à la vente, rend l'équidé impropre à l'usage convenu. L'Acheteur notifie le défaut par lettre recommandée avec avis de réception accompagnée du certificat vétérinaire dans les 8 jours de sa constatation. Cette garantie ne couvre pas les accidents, maladies ou défauts d'entretien postérieurs à la livraison.` : "", p.warranty === "legal" ? "Les parties n'ont convenu d'aucune garantie complémentaire. Cette clause ne fait pas obstacle aux actions fondées sur le dol ou l'erreur, ni, si le Vendeur est professionnel, à la présomption de connaissance des vices qui pèse sur lui." : "", on(p.right_of_first_refusal) ? "Droit de préférence : si l'Acheteur souhaite revendre l'équidé dans les cinq ans, il en informe le Vendeur par écrit ; celui-ci dispose de 15 jours pour l'acquérir aux conditions proposées." : ""].filter(Boolean) },
      { title: "Article 6 – Livraison, transfert de propriété, de garde et des risques", paragraphs: [`L'équidé est livré le ${dateFr(p.delivery_date)} à ${v(p.delivery_place)}. Le transport est organisé et payé par ${p.transport === "seller" ? "le Vendeur" : "l'Acheteur"}, qui s'assure que le transporteur dispose des autorisations et assurances requises.`, on(p.reserve) ? "La propriété est transférée au complet paiement du prix (art. 3). La garde et les risques (art. 1243 C. civ.) sont transférés à la livraison." : "La propriété, la garde et les risques (art. 1243 C. civ.) sont transférés à la livraison, sous réserve de la réalisation des conditions suspensives.", "Jusqu'à la livraison, les frais courants (pension, maréchalerie, soins) restent à la charge du Vendeur. L'Acheteur est invité à assurer l'équidé (responsabilité civile, mortalité, frais vétérinaires) à compter du transfert des risques."] },
      { title: "Article 7 – Formalités d'identification (SIRE)", paragraphs: ["Le Vendeur remet à l'Acheteur, au plus tard lors du complet paiement du prix, le document d'identification original de l'équidé et la carte d'immatriculation dûment endossée et signée, ou le certificat de vente édité depuis son espace SIRE (art. R215-14 C. rural).", "L'Acheteur s'engage à déclarer le changement de propriétaire auprès de l'IFCE dans les 30 jours (art. D212-49 C. rural ; démarche en ligne, 17 € au tarif 2026) et à déclarer le lieu de détention de l'équidé.", "Le Vendeur s'engage à ne pas s'opposer à ce changement et, si le cheval est engagé en compétition, à faciliter le changement de propriétaire auprès de la FFE."] },
      { title: "Article 8 – Litiges", paragraphs: mediationText(proInvolved) },
      { title: "Article 9 – Dispositions diverses", paragraphs: ["Le présent contrat exprime l'intégralité de l'accord des parties et remplace tout échange antérieur (annonce, messages) qui ne serait pas repris ici. Toute modification fait l'objet d'un avenant écrit.", "Les parties reconnaissent que ce modèle est fourni par Cavalons Ventes à titre informatif et qu'il ne constitue pas un conseil juridique ; elles ont été invitées à le faire relire par un professionnel du droit si nécessaire.", `Fait à ${v(p.place)}, le ${dateFr(p.date)}, en deux exemplaires originaux, chaque page paraphée.`] },
    ];
    return sections;
  },
  signatures: ["Le Vendeur (« lu et approuvé »)", "L'Acheteur (« lu et approuvé »)"],
  annexes: ["Copie du document d'identification et de la carte d'immatriculation", "Mandat de vente (si le vendeur n'est pas le propriétaire inscrit)", "Compte rendu de visite vétérinaire d'achat et clichés", "Convention d'essai (le cas échéant)", "Facture (vendeur professionnel)"],
};

/* ------------------------------------------------------------------ */
/* 2. MANDAT DE DÉPÔT-VENTE                                             */
/* ------------------------------------------------------------------ */
export const depotTemplate: ContractTemplate = {
  id: "depot-vente",
  title: "Contrat de dépôt-vente et mandat de vente d'équidé",
  subtitle: "Entre un propriétaire (déposant) et un professionnel (dépositaire-mandataire)",
  intro:
    "Ce contrat mixte organise la garde et les soins (dépôt salarié, art. 1915 s. C. civ.), le travail du cheval (contrat d'entreprise) et le mandat de vente (art. 1984 s.). Il fixe le prix plancher, la commission, la pension, les essais et la reddition de comptes.",
  fields: [
    ...partyFields("owner", "Propriétaire (déposant / mandant)", "Les parties"),
    ...partyFields("pro", "Professionnel (dépositaire / mandataire)", "Les parties"),
    { name: "pro_insurance", label: "Assurances du professionnel (RC pro, garde d'équidés – assureur, n° de police)", type: "text", section: "Les parties" },
    ...horseFields("Le cheval"),
    { name: "entry_state", label: "État des lieux d'entrée (état de santé, ferrure, documents remis)", type: "textarea", section: "Le cheval", help: "Examen vétérinaire d'entrée conseillé. Le propriétaire conserve la carte d'immatriculation." },
    { name: "value", label: "Valeur déclarée pour assurance (€)", type: "number", section: "Le cheval" },
    { name: "start", label: "Date de début", type: "date", section: "Durée" },
    { name: "months", label: "Durée (mois)", type: "number", section: "Durée", default: 3 },
    { name: "notice", label: "Préavis de résiliation (jours)", type: "number", section: "Durée", default: 30 },
    { name: "exclusive", label: "Mandat exclusif (le propriétaire ne vend pas en direct et transmet les offres)", type: "checkbox", section: "Mandat", default: true },
    { name: "sign_power", label: "Le mandataire peut conclure la vente au nom du propriétaire (sinon : simple pouvoir de négocier, accord écrit du propriétaire sur chaque offre)", type: "checkbox", section: "Mandat" },
    { name: "price_display", label: "Prix affiché (€)", type: "number", section: "Mandat" },
    { name: "price_floor", label: "Prix plancher en dessous duquel le mandataire ne peut vendre (€)", type: "number", section: "Mandat" },
    { name: "commission", label: "Commission du mandataire (% du prix de vente)", type: "number", section: "Mandat", default: 10, help: "Usage du marché : 10 à 15 %. La commission est soumise à TVA (20 %) si le mandataire est assujetti." },
    { name: "commission_base", label: "Assiette de la commission", type: "select", section: "Mandat", options: [["ttc", "prix de vente TTC"], ["ht", "prix de vente HT"]] },
    { name: "tail_months", label: "Clause de suite : commission due si vente à un acheteur présenté par le mandataire dans les … mois suivant la fin du mandat", type: "number", section: "Mandat", default: 6 },
    { name: "pension", label: "Pension mensuelle (€ TTC)", type: "number", section: "Pension et frais" },
    { name: "pension_includes", label: "Prestations incluses", type: "text", section: "Pension et frais", placeholder: "Hébergement box + paddock, alimentation, sorties, 4 séances de travail / semaine, présentation aux acheteurs" },
    { name: "extra_costs", label: "Frais exclus (à la charge du propriétaire sur accord préalable)", type: "text", section: "Pension et frais", placeholder: "Vétérinaire, maréchal, ostéopathe, dentiste, transport, engagements concours" },
    { name: "urgency_cap", label: "Seuil de frais d'urgence engageables sans accord préalable (€)", type: "number", section: "Pension et frais", default: 300 },
    { name: "trials", label: "Essais par des acheteurs potentiels autorisés (cavalier compétent, casque, présence du professionnel)", type: "checkbox", section: "Essais et assurance", default: true },
    { name: "insurance_who", label: "Assurance mortalité / frais vétérinaires souscrite par", type: "select", section: "Essais et assurance", options: [["owner", "le propriétaire"], ["pro", "le professionnel (refacturée)"], ["none", "aucune (le propriétaire en assume le risque)"]] },
    { name: "buyout", label: "Option d'achat du professionnel au prix plancher (notification par LRAR)", type: "checkbox", section: "Essais et assurance" },
    { name: "image_rights", label: "Autorisation d'utiliser photos et vidéos du cheval pour sa commercialisation", type: "checkbox", section: "Essais et assurance", default: true },
    { name: "place", label: "Fait à", type: "text", section: "Signature" },
    { name: "date", label: "Le", type: "date", section: "Signature" },
  ],
  build(p) {
    return [
      { title: "Entre les soussignés", paragraphs: [partyText(p, "owner", "le Propriétaire"), partyText(p, "pro", "le Professionnel"), `Le Professionnel déclare exercer une activité de commercialisation / valorisation d'équidés, être immatriculé et titulaire des assurances suivantes : ${v(p.pro_insurance)}.`, "Le Propriétaire déclare être le propriétaire de l'équidé inscrit au fichier SIRE et avoir le pouvoir d'en disposer."] },
      { title: "Article 1 – Équidé confié et état des lieux d'entrée", paragraphs: [horseText(p), `État des lieux d'entrée : ${v(p.entry_state, "voir annexe (examen vétérinaire d'entrée, photos datées)")}.`, `Valeur déclarée : ${eur(p.value)}.`, "Le Propriétaire remet le document d'identification original, qui accompagne l'équidé. Il conserve la carte d'immatriculation, qui ne sera endossée qu'au profit de l'acheteur final lors de la vente."] },
      { title: "Article 2 – Objet du contrat", paragraphs: ["Le Propriétaire confie l'équidé au Professionnel qui accepte : (a) d'en assurer la garde et les soins en bon professionnel (dépôt salarié, art. 1915 et s., 1927 et 1928 du Code civil) ; (b) de le travailler et de le présenter en vue de sa vente (art. 1710 C. civ.) ; (c) de rechercher un acheteur et de négocier la vente pour le compte du Propriétaire (mandat, art. 1984 et s. C. civ.).", on(p.sign_power) ? "Le Professionnel est habilité à conclure la vente au nom et pour le compte du Propriétaire dans les limites de prix fixées à l'article 4, et à endosser la carte d'immatriculation sur présentation du présent mandat." : "Le Professionnel dispose d'un pouvoir de négociation uniquement. Toute offre est transmise sans délai au Propriétaire, qui l'accepte ou la refuse par écrit ; le contrat de vente est signé par le Propriétaire.", "L'équidé demeure la propriété du Propriétaire jusqu'à sa vente. Le Professionnel s'interdit tout acte de disposition non prévu au présent contrat."] },
      { title: "Article 3 – Durée", paragraphs: [`Le contrat prend effet le ${dateFr(p.start)} pour une durée de ${v(p.months, "3")} mois, renouvelable par accord écrit. Chaque partie peut y mettre fin moyennant un préavis de ${v(p.notice, "30")} jours notifié par écrit, sans indemnité, les sommes dues restant exigibles. Il peut être résilié sans préavis en cas de manquement grave (défaut de soins, défaut de paiement de deux mois de pension, vente hors mandat).`] },
      { title: "Article 4 – Prix de vente et mandat", paragraphs: [`Prix affiché : ${eur(p.price_display)}. Prix plancher : ${eur(p.price_floor)} ; le Professionnel ne peut accepter une offre inférieure sans l'accord écrit du Propriétaire. Toute révision du prix fait l'objet d'un écrit (email accepté).`, on(p.exclusive) ? "Mandat exclusif : pendant la durée du contrat, le Propriétaire s'interdit de vendre l'équidé directement ou par un autre intermédiaire et transmet au Professionnel toute demande reçue. Si le Propriétaire vend malgré tout en direct, la commission de l'article 5 reste due." : "Mandat non exclusif : le Propriétaire conserve la faculté de vendre en direct ; la commission n'est due que si l'acheteur a été présenté par le Professionnel.", "Le Professionnel présente l'équidé de manière loyale et complète (annonces, photos et vidéos datées, déclaration des particularités connues), mentionne sa qualité de mandataire dans toute annonce, et tient un registre des visites et essais communiqué au Propriétaire sur demande. Il rend compte de sa gestion (art. 1993 C. civ.) au moins une fois par mois.", "La vente finale est constatée par un contrat écrit (modèle Cavalons Ventes) au nom du Propriétaire, mentionnant l'intermédiaire. Les garanties légales de la vente (vices rédhibitoires, dol) pèsent sur le Propriétaire-vendeur ; le Professionnel répond de l'exactitude des informations qu'il a lui-même communiquées aux acheteurs."] },
      { title: "Article 5 – Commission", paragraphs: [`En cas de vente conclue pendant le mandat, le Professionnel perçoit une commission de ${v(p.commission, "10")} % du prix de vente ${p.commission_base === "ht" ? "HT" : "TTC"}, majorée de la TVA au taux en vigueur s'il y est assujetti. Elle est exigible à l'encaissement du prix par le Propriétaire ; en cas de paiement échelonné accepté par le Propriétaire, elle est due en totalité au premier versement.`, `Clause de suite : la commission reste due si l'équidé est vendu, dans les ${v(p.tail_months, "6")} mois suivant la fin du contrat, à un acheteur présenté par le Professionnel et figurant sur le registre des visites.`, "Le Professionnel ne perçoit aucune autre rémunération de l'acheteur au titre de cette vente, sauf accord écrit et transparent des trois parties."] },
      { title: "Article 6 – Pension et frais", paragraphs: [`Le Propriétaire règle une pension mensuelle de ${eur(p.pension)} TTC, payable d'avance le 1er de chaque mois, comprenant : ${v(p.pension_includes)}.`, `Sont exclus et refacturés au Propriétaire sur justificatifs, après accord préalable (email accepté) : ${v(p.extra_costs, "vétérinaire, maréchalerie, ostéopathie, dentisterie, transport, engagements")}. En cas d'urgence vitale, le Professionnel peut engager sans accord préalable les frais nécessaires dans la limite de ${eur(p.urgency_cap)} et informe le Propriétaire sans délai.`, "En cas de retard de paiement de plus de 30 jours, les intérêts légaux courent de plein droit ; le Professionnel peut suspendre le travail de l'équidé (les soins restant dus) et, après mise en demeure restée infructueuse 15 jours, résilier le contrat. Le droit de rétention de l'article 1948 du Code civil s'exerce dans le respect du bien-être de l'animal."] },
      { title: "Article 7 – Essais, garde et assurances", paragraphs: [on(p.trials) ? "Le Professionnel est autorisé à faire essayer l'équidé par des acheteurs potentiels, sous sa surveillance, par un cavalier de niveau adapté portant un casque, après signature d'une décharge. Il reste gardien de l'équidé pendant ces essais (art. 1243 C. civ.). Tout essai hors de l'écurie fait l'objet d'une convention d'essai écrite préalablement acceptée par le Propriétaire." : "Aucun essai monté par un tiers n'est autorisé sans l'accord écrit préalable du Propriétaire.", "Le Professionnel est tenu d'une obligation de moyens quant à la garde, aux soins et au travail ; il est responsable des dommages résultant de sa faute ou de celle de ses préposés. Il n'est pas responsable des dommages résultant d'un vice propre de l'équidé, d'un cas de force majeure ou du fait d'un tiers.", { owner: "L'assurance mortalité et frais vétérinaires de l'équidé est souscrite par le Propriétaire, qui en justifie ; le Professionnel n'en assume pas le risque.", pro: "L'assurance mortalité et frais vétérinaires est souscrite par le Professionnel pour la valeur déclarée et refacturée au Propriétaire.", none: "Aucune assurance mortalité / frais vétérinaires n'est souscrite ; le Propriétaire en assume seul le risque." }[p.insurance_who ?? "owner"] ?? "", "Le Professionnel justifie d'une assurance responsabilité civile professionnelle couvrant les équidés confiés.", on(p.buyout) ? "Option d'achat : le Professionnel peut acquérir lui-même l'équidé au prix plancher en le notifiant par lettre recommandée ; le Propriétaire dispose de 15 jours pour accepter." : "", on(p.image_rights) ? "Le Propriétaire autorise l'utilisation des photos et vidéos de l'équidé pour sa commercialisation, y compris sur Cavalons Ventes." : ""].filter(Boolean) },
      { title: "Article 8 – Fin du contrat et restitution", paragraphs: ["À l'échéance ou en cas de résiliation sans vente, le Propriétaire reprend l'équidé dans les 8 jours, à ses frais, après paiement des sommes dues ; un état des lieux de sortie contradictoire est établi. Le Professionnel remet le document d'identification et le registre des visites.", "En cas de vente, le Professionnel reverse le prix au Propriétaire, déduction faite de la commission et des sommes dues, dans les 10 jours de l'encaissement définitif, avec relevé de compte."] },
      { title: "Article 9 – Litiges", paragraphs: mediationText(!on(p.owner_pro)) },
      { title: "Article 10 – Dispositions diverses", paragraphs: ["Ce modèle est fourni par Cavalons Ventes à titre informatif ; il ne constitue pas un conseil juridique. Toute modification fait l'objet d'un avenant écrit.", `Fait à ${v(p.place)}, le ${dateFr(p.date)}, en deux exemplaires originaux.`] },
    ];
  },
  signatures: ["Le Propriétaire", "Le Professionnel"],
  annexes: ["État des lieux d'entrée et examen vétérinaire", "Copie du document d'identification", "Attestations d'assurance", "Registre des visites et essais (tenu pendant le contrat)"],
};

/* ------------------------------------------------------------------ */
/* 3. CONVENTION D'ESSAI                                                */
/* ------------------------------------------------------------------ */
export const essaiTemplate: ContractTemplate = {
  id: "essai",
  title: "Convention d'essai d'un équidé",
  subtitle: "Pour un essai de quelques jours chez l'acheteur potentiel, avant la vente",
  intro:
    "Un essai hors de chez le vendeur transfère la garde du cheval : sans écrit, la responsabilité en cas d'accident est imprévisible (art. 1243 C. civ.). Cette convention fixe qui est gardien, qui assure, qui transporte, et ce qui se passe à la fin de l'essai.",
  fields: [
    ...partyFields("seller", "Vendeur (propriétaire)", "Les parties"),
    ...partyFields("buyer", "Essayeur (acheteur potentiel)", "Les parties"),
    ...horseFields("Le cheval"),
    { name: "nature", label: "Nature de l'essai", type: "select", section: "Modalités", options: [["pret", "Essai préalable à la vente (prêt à usage) – aucune vente n'est encore conclue"], ["vente", "Vente à l'essai (art. 1588 C. civ.) – la vente est conclue sous condition suspensive"]] },
    { name: "price", label: "Prix de vente envisagé (€)", type: "number", section: "Modalités" },
    { name: "start", label: "Début de l'essai", type: "date", section: "Modalités" },
    { name: "end", label: "Fin de l'essai", type: "date", section: "Modalités", help: "7 à 15 jours est l'usage ; un mois maximum." },
    { name: "location", label: "Lieu d'hébergement pendant l'essai", type: "text", section: "Modalités" },
    { name: "usage", label: "Usage autorisé", type: "text", section: "Modalités", placeholder: "Travail sur le plat et petits sauts, balades ; pas de concours ; cavalier : …" },
    { name: "rider", label: "Cavalier(s) autorisé(s)", type: "text", section: "Modalités" },
    { name: "insurance", label: "Assurance mortalité + frais vétérinaires souscrite par l'essayeur pour la valeur déclarée, sans délai de carence", type: "checkbox", section: "Garde et assurance", default: true },
    { name: "value", label: "Valeur déclarée pour assurance (€)", type: "number", section: "Garde et assurance" },
    { name: "vet_costs", label: "Frais vétérinaires courants pendant l'essai à la charge de", type: "select", section: "Garde et assurance", options: [["buyer", "l'essayeur"], ["seller", "le vendeur"]] },
    { name: "deposit", label: "Dépôt de garantie (€, chèque non encaissé ou séquestre)", type: "number", section: "Garde et assurance" },
    { name: "transport", label: "Transport aller et retour organisé et payé par", type: "select", section: "Transport", options: [["buyer", "l'essayeur"], ["seller", "le vendeur"]] },
    { name: "silence", label: "À défaut de réponse écrite au terme de l'essai", type: "select", section: "Fin de l'essai", options: [["return", "l'équidé est restitué au vendeur"], ["sale", "la vente est réputée conclue (art. 1588 C. civ.)"]] },
    { name: "place", label: "Fait à", type: "text", section: "Signature" },
    { name: "date", label: "Le", type: "date", section: "Signature" },
  ],
  build(p) {
    return [
      { title: "Entre les soussignés", paragraphs: [partyText(p, "seller", "le Vendeur"), partyText(p, "buyer", "l'Essayeur")] },
      { title: "Article 1 – Équidé confié", paragraphs: [horseText(p), "Le Vendeur remet le document d'identification, qui accompagne l'équidé pendant l'essai. La carte d'immatriculation est conservée par le Vendeur. L'Essayeur reconnaît avoir examiné l'équidé et l'avoir trouvé en bon état apparent ; un état des lieux (photos datées) est annexé."] },
      { title: "Article 2 – Nature et durée de l'essai", paragraphs: [p.nature === "vente" ? `Les parties ont convenu de la vente de l'équidé au prix de ${eur(p.price)} sous la condition suspensive d'un essai concluant (art. 1588 C. civ.). Le Vendeur en reste propriétaire jusqu'à la levée de la condition et au complet paiement.` : `L'équidé est confié à l'Essayeur à titre de prêt à usage (art. 1875 et s. C. civ.) en vue d'une éventuelle vente au prix envisagé de ${eur(p.price)}. Aucune vente n'est conclue à ce stade ; le Vendeur reste libre de poursuivre ses visites, sauf accord contraire écrit.`, `L'essai se déroule du ${dateFr(p.start)} au ${dateFr(p.end)} inclus, à ${v(p.location)}. Usage autorisé : ${v(p.usage)}. Cavalier(s) autorisé(s) : ${v(p.rider)}. Tout autre usage (concours, autre cavalier, changement de lieu) requiert l'accord écrit du Vendeur.`, "Pendant l'essai, l'Essayeur s'interdit tout acte de propriété : revente, mise à disposition à un tiers, déclaration SIRE, modification de l'identification, tonte ou ferrure modifiée sans accord, traitement médical non urgent sans accord."] },
      { title: "Article 3 – Garde, responsabilité et soins", paragraphs: ["À compter de la prise en charge, l'Essayeur devient gardien de l'équidé au sens de l'article 1243 du Code civil et répond des dommages causés par celui-ci aux tiers. Il justifie d'une assurance responsabilité civile couvrant ce risque.", "L'Essayeur s'engage à héberger, nourrir et soigner l'équidé conformément à ses besoins, à ne pas l'exposer à des risques anormaux, et à prévenir immédiatement le Vendeur en cas d'accident, de maladie ou de comportement anormal. En cas d'urgence, il fait appel à un vétérinaire et en informe le Vendeur.", `Les frais vétérinaires courants pendant l'essai sont à la charge ${p.vet_costs === "seller" ? "du Vendeur" : "de l'Essayeur"} ; les frais liés à un accident survenu pendant l'essai sont à la charge de l'Essayeur sauf s'ils résultent d'un vice antérieur prouvé.`] },
      { title: "Article 4 – Assurance et dépôt de garantie", paragraphs: [on(p.insurance) ? `L'Essayeur souscrit, avant la prise en charge, une assurance mortalité et frais vétérinaires sans délai de carence pour la valeur déclarée de ${eur(p.value ?? p.price)}, au bénéfice du Vendeur, et en remet l'attestation. À défaut, l'équidé n'est pas remis.` : "Aucune assurance mortalité n'est exigée ; l'Essayeur reste tenu d'indemniser le Vendeur en cas de perte ou de dommage imputable à sa faute.", p.deposit && Number(p.deposit) > 0 ? `L'Essayeur remet un dépôt de garantie de ${eur(p.deposit)} (chèque non encaissé ou séquestre), restitué à la restitution de l'équidé en bon état ou imputé sur le prix en cas d'achat.` : "Aucun dépôt de garantie n'est demandé."].filter(Boolean) },
      { title: "Article 5 – Transport", paragraphs: [`Le transport aller et retour est organisé et payé par ${p.transport === "seller" ? "le Vendeur" : "l'Essayeur"}, dans un véhicule adapté et assuré pour le transport d'équidés. Les risques du transport sont supportés par la partie qui l'organise.`] },
      { title: "Article 6 – Fin de l'essai", paragraphs: [`Au plus tard le dernier jour de l'essai, l'Essayeur notifie par écrit (email avec accusé ou lettre recommandée) sa décision d'acquérir ou non l'équidé. ${p.silence === "sale" ? "À défaut de notification, la vente est réputée conclue au prix convenu (art. 1588 C. civ.) et le contrat de vente est signé sans délai." : "À défaut de notification, l'équidé est restitué au Vendeur le premier jour ouvré suivant, aux frais de l'Essayeur."}`, "En cas d'achat, les parties signent le contrat de vente Cavalons Ventes ; la date de livraison au sens des articles R213-5 et R213-7 du Code rural (point de départ des délais de vices rédhibitoires) est fixée dans ce contrat. En cas de restitution, un état des lieux de sortie contradictoire est établi ; l'Essayeur restitue l'équidé dans l'état où il l'a reçu, ferrure et documents compris.", "Le Vendeur peut mettre fin à l'essai à tout moment en cas de manquement de l'Essayeur aux présentes ou de danger pour l'équidé."] },
      { title: "Article 7 – Litiges et dispositions diverses", paragraphs: [...mediationText(on(p.seller_pro)), "Ce modèle est fourni par Cavalons Ventes à titre informatif ; il ne constitue pas un conseil juridique.", `Fait à ${v(p.place)}, le ${dateFr(p.date)}, en deux exemplaires originaux.`] },
    ];
  },
  signatures: ["Le Vendeur", "L'Essayeur"],
  annexes: ["État des lieux d'entrée (photos datées)", "Attestation d'assurance de l'essayeur", "Copie du document d'identification"],
};

export const CONTRACT_TEMPLATES: Record<string, ContractTemplate> = {
  vente: venteTemplate,
  "depot-vente": depotTemplate,
  essai: essaiTemplate,
};
