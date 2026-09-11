"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { signIn, signUp, resetPassword } from "@/app/actions/auth";
import type { ActionState } from "@/app/actions/visits";
import { ROLES, type Role } from "@/lib/constants";

export function SignInForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(signIn, null);
  const [reset, setReset] = useState(false);
  const [rState, rAction, rPending] = useActionState<ActionState, FormData>(resetPassword, null);
  if (reset) {
    return (
      <form action={rAction} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" required className="input" autoComplete="email" />
        </div>
        {rState && <p className={`text-sm ${rState.ok ? "text-primary" : "text-red-600"}`}>{rState.message}</p>}
        <button type="submit" disabled={rPending} className="btn-primary w-full">
          Recevoir un lien de réinitialisation
        </button>
        <button type="button" onClick={() => setReset(false)} className="btn-ghost w-full text-sm">
          Retour à la connexion
        </button>
      </form>
    );
  }
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label className="label" htmlFor="email">
          Email
        </label>
        <input id="email" name="email" type="email" required className="input" autoComplete="email" />
      </div>
      <div>
        <label className="label" htmlFor="password">
          Mot de passe
        </label>
        <input id="password" name="password" type="password" required className="input" autoComplete="current-password" />
      </div>
      {state && !state.ok && <p className="text-sm text-red-600">{state.message}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Connexion…" : "Se connecter"}
      </button>
      <div className="flex justify-between text-sm">
        <button type="button" onClick={() => setReset(true)} className="text-muted hover:text-primary">
          Mot de passe oublié ?
        </button>
        <Link href={`/inscription?next=${encodeURIComponent(next)}`} className="text-primary underline">
          Créer un compte
        </Link>
      </div>
    </form>
  );
}

export function SignUpForm({ defaultRole = "acheteur" }: { defaultRole?: Role }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(signUp, null);
  const [role, setRole] = useState<Role>(defaultRole);
  if (state?.ok) return <p className="rounded-xl bg-primary-soft p-4 text-sm text-primary">{state.message}</p>;
  return (
    <form action={action} className="space-y-4">
      <fieldset>
        <legend className="label">Je suis</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {(Object.keys(ROLES) as Role[]).map((r) => (
            <label key={r} className={`cursor-pointer rounded-xl border p-3 text-sm transition ${role === r ? "border-primary bg-primary-soft" : "border-line bg-white hover:border-primary-light"}`}>
              <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} className="sr-only" />
              <span className="block font-medium">{ROLES[r].label}</span>
              <span className="block text-xs text-muted">{ROLES[r].description}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label className="label" htmlFor="displayName">
          {role === "eleveur" || role === "pro_depot" ? "Nom de votre élevage / écurie" : "Prénom et nom (ou pseudo)"}
        </label>
        <input id="displayName" name="displayName" required minLength={2} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="email">
          Email
        </label>
        <input id="email" name="email" type="email" required className="input" autoComplete="email" />
      </div>
      <div>
        <label className="label" htmlFor="password">
          Mot de passe
        </label>
        <input id="password" name="password" type="password" required minLength={8} className="input" autoComplete="new-password" />
        <p className="helper">8 caractères minimum.</p>
      </div>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="charter" required className="mt-0.5 h-4 w-4 accent-primary" />
        <span>
          J&apos;accepte le{" "}
          <Link href="/charte" className="text-primary underline" target="_blank">
            pacte de bonne conduite
          </Link>{" "}
          et les{" "}
          <Link href="/cgu" className="text-primary underline" target="_blank">
            CGU
          </Link>
          .
        </span>
      </label>
      {state && !state.ok && <p className="text-sm text-red-600">{state.message}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Création…" : "Créer mon compte gratuit"}
      </button>
      <p className="text-center text-sm text-muted">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="text-primary underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
