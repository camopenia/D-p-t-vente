"use client";
import { useActionState, useState } from "react";
import { updateProfile } from "@/app/actions/profile";
import type { ActionState } from "@/app/actions/visits";
import { ROLES, type Role } from "@/lib/constants";
import { CommuneFields } from "@/components/ui/CommuneFields";
import type { Profile } from "@/lib/types";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateProfile, null);
  const [role, setRole] = useState<Role>(profile.role);
  const isPro = role === "eleveur" || role === "pro_depot";
  return (
    <form action={action} className="card space-y-4 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="role">
            Statut
          </label>
          <select id="role" name="role" className="input" value={role} onChange={(e) => setRole(e.target.value as Role)}>
            {(Object.keys(ROLES) as Role[]).map((r) => (
              <option key={r} value={r}>
                {ROLES[r].label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="display_name">
            Nom affiché <span className="text-red-600">*</span>
          </label>
          <input id="display_name" name="display_name" required className="input" defaultValue={profile.display_name} />
        </div>
        <div>
          <label className="label" htmlFor="phone">
            Téléphone
          </label>
          <input id="phone" name="phone" type="tel" className="input" defaultValue={profile.phone ?? ""} />
          <p className="helper">Visible uniquement par les abonnés Contact qui consultent vos annonces.</p>
        </div>
        <div>
          <label className="label" htmlFor="website">
            Site web
          </label>
          <input id="website" name="website" type="url" className="input" defaultValue={profile.website ?? ""} placeholder="https://" />
        </div>
        <div className="sm:col-span-2">
          <CommuneFields city={profile.city} postalCode={profile.postal_code} region={profile.region} required={false} cityLabel="Commune" />
        </div>
        {isPro && (
          <>
            <div>
              <label className="label" htmlFor="company_name">
                Raison sociale
              </label>
              <input id="company_name" name="company_name" className="input" defaultValue={profile.company_name ?? ""} />
            </div>
            <div>
              <label className="label" htmlFor="siret">
                SIRET
              </label>
              <input id="siret" name="siret" className="input" defaultValue={profile.siret ?? ""} placeholder="14 chiffres" />
              <p className="helper">Nécessaire pour obtenir le badge « Professionnel vérifié » (contrôle manuel par l&apos;équipe).</p>
            </div>
          </>
        )}
      </div>
      <div>
        <label className="label" htmlFor="bio">
          Présentation {isPro ? "de votre structure" : ""}
        </label>
        <textarea id="bio" name="bio" rows={5} className="input" defaultValue={profile.bio ?? ""} placeholder={isPro ? "Votre élevage / écurie, vos disciplines, votre façon de travailler, vos garanties…" : "Quelques mots sur vous et votre projet."} />
      </div>
      {state && <p className={`text-sm ${state.ok ? "text-primary" : "text-red-600"}`}>{state.message}</p>}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
