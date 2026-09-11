import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Handshake, CalendarClock } from "lucide-react";
import { CONTRACT_TEMPLATES } from "@/lib/content/contracts";

export const metadata: Metadata = {
  title: "Modèles de contrats : vente, dépôt-vente, essai",
  description: "Générez en ligne un contrat de vente de cheval, un mandat de dépôt-vente ou une convention d'essai conformes au Code rural et au Code civil.",
};

const ICONS = { vente: FileText, "depot-vente": Handshake, essai: CalendarClock } as const;

export default function ContratsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold">Modèles de contrats</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Remplissez le formulaire, vérifiez l&apos;aperçu, imprimez ou enregistrez en PDF. Vos saisies restent dans votre navigateur. Les modèles s&apos;appuient sur le Code civil, le Code rural (vices rédhibitoires, SIRE) et le modèle de l&apos;Institut du Droit Équin.
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {Object.values(CONTRACT_TEMPLATES).map((t) => {
          const Icon = ICONS[t.id];
          return (
            <Link key={t.id} href={`/contrats/${t.id}`} className="card group flex flex-col p-6 transition hover:border-primary">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-semibold group-hover:text-primary">{t.title}</h2>
              <p className="mt-1 flex-1 text-sm text-muted">{t.intro}</p>
              <span className="mt-4 text-sm font-medium text-primary">Générer le contrat →</span>
            </Link>
          );
        })}
      </div>
      <section className="prose-cv mt-12 max-w-3xl">
        <h2>Ce qu&apos;il faut savoir avant de signer</h2>
        <ul>
          <li>
            <strong>La vente est valable sans écrit</strong>, mais l&apos;écrit fixe le prix, l&apos;usage convenu, les garanties et la date de livraison : c&apos;est votre preuve en cas de litige.
          </li>
          <li>
            <strong>Vices rédhibitoires</strong> (Code rural) : par défaut, seuls 7 vices sont garantis, avec un délai de 10 jours (30 pour uvéite et anémie infectieuse) après la livraison. Pour élargir la garantie aux vices cachés, il faut le prévoir expressément.
          </li>
          <li>
            <strong>La garantie légale de conformité ne s&apos;applique plus aux animaux</strong> depuis 2022, même auprès d&apos;un vendeur professionnel.
          </li>
          <li>
            <strong>Visite vétérinaire d&apos;achat</strong> : inscrivez-la comme condition suspensive, avec le nom du vétérinaire, le protocole et une date limite.
          </li>
          <li>
            <strong>SIRE</strong> : le vendeur remet immédiatement la carte d&apos;immatriculation endossée ; l&apos;acheteur déclare le changement de propriétaire sous 30 jours.
          </li>
          <li>
            <strong>Dépôt-vente</strong> : le mandataire doit se présenter comme tel ; commission, pension, essais et reddition de comptes doivent être écrits.
          </li>
        </ul>
        <p className="text-sm text-muted">Ces modèles sont fournis à titre informatif et ne remplacent pas l&apos;avis d&apos;un professionnel du droit. Pour un cheval de grande valeur ou une situation particulière (indivision, vente internationale, TVA), faites relire le contrat.</p>
      </section>
    </div>
  );
}
