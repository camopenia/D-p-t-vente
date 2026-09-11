import type { Metadata } from "next";
import { Mail } from "lucide-react";

export const metadata: Metadata = { title: "Nous contacter" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold">Nous contacter</h1>
      <p className="mt-2 text-muted">Une question sur une annonce, un signalement, un partenariat, ou une suggestion pour améliorer les guides et contrats ?</p>
      <div className="card mt-6 p-6">
        <a href="mailto:contact@cavalons.fr" className="btn-primary">
          <Mail className="h-4 w-4" /> contact@cavalons.fr
        </a>
        <ul className="mt-6 space-y-2 text-sm text-muted">
          <li>Signalement d&apos;une annonce : utilisez le bouton « Signaler » sur l&apos;annonce, nous traitons sous 24 h ouvrées.</li>
          <li>Vérification professionnelle (badge) : renseignez votre SIRET dans votre profil ; nous revenons vers vous par email.</li>
          <li>Presse et partenariats : mentionnez « Cavalons Ventes » dans l&apos;objet.</li>
        </ul>
        <p className="mt-6 text-sm">
          Cavalons, la plateforme de demi-pension :{" "}
          <a href="https://www.cavalons.fr" className="text-primary underline" target="_blank" rel="noopener noreferrer">
            www.cavalons.fr
          </a>
        </p>
      </div>
    </div>
  );
}
