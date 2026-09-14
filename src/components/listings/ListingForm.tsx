"use client";
import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImagePlus, Trash2, Info } from "lucide-react";
import { saveListing } from "@/app/actions/listings";
import type { ActionState } from "@/app/actions/visits";
import { BREEDS, COLORS, DISCIPLINES, LEVELS, PAPERS, REGIONS, SEXES } from "@/lib/constants";
import type { Listing } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

type Props = { userId: string; isPro: boolean; existing?: Listing | null };

export function ListingForm({ userId, isPro, existing }: Props) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveListing, null);
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<string[]>(existing?.photos ?? []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [disciplines, setDisciplines] = useState<string[]>(existing?.disciplines ?? []);
  const [priceHidden, setPriceHidden] = useState(existing?.price_hidden ?? false);
  const [depot, setDepot] = useState(existing?.is_depot_vente ?? false);
  const [videos, setVideos] = useState<string>(existing?.video_urls.join("\n") ?? "");
  const [clientError, setClientError] = useState<string | null>(null);
  const [allValid, setAllValid] = useState(false);
  const [papers, setPapers] = useState<string>(existing?.papers ?? "sire_full");
  const formRef = useRef<HTMLFormElement>(null);

  const steps = ["Le cheval", "Origines & papiers", "Description", "Photos & vidéos", "Prix & conditions"];

  type Problem = { step: number; label: string };
  const collectProblems = useCallback(
    (form: HTMLFormElement, status: "draft" | "active"): Problem[] => {
      const problems: Problem[] = [];
      form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input, textarea, select").forEach((el) => {
        if (el.type === "hidden" || el.type === "file") return;
        const section = el.closest<HTMLElement>("[data-step]");
        if (!section) return;
        const stepIndex = Number(section.dataset.step);
        if (status === "draft" && !["horse_name", "breed"].includes(el.name)) return;
        if (!el.validity.valid) {
          const raw = form.querySelector<HTMLLabelElement>(`label[for="${el.id}"]`)?.textContent || el.closest("label")?.textContent || el.name;
          problems.push({ step: stepIndex, label: raw.replace(/\*/g, "").trim().slice(0, 60) });
        }
      });
      if (status === "active" && disciplines.length === 0) problems.push({ step: 0, label: "Disciplines (au moins une)" });
      if (status === "active" && photos.length === 0) problems.push({ step: 3, label: "Au moins une photo" });
      return problems.sort((a, b) => a.step - b.step);
    },
    [disciplines, photos],
  );

  const refreshValidity = useCallback(() => {
    if (formRef.current) setAllValid(collectProblems(formRef.current, "active").length === 0);
  }, [collectProblems]);
  useEffect(() => {
    refreshValidity();
  }, [refreshValidity, priceHidden, depot, papers, step]);

  /** Navigation entre étapes : on ne peut avancer que si les étapes traversées sont complètes. */
  function goTo(target: number) {
    if (target < 0 || target >= steps.length) return;
    if (target > step && formRef.current) {
      const blocking = collectProblems(formRef.current, "active").filter((p) => p.step >= step && p.step < target);
      if (blocking.length) {
        setStep(blocking[0].step);
        setClientError(`Pour passer à l'étape suivante, complétez : ${Array.from(new Set(blocking.map((p) => p.label))).join(" · ")}`);
        return;
      }
    }
    setClientError(null);
    setStep(target);
  }

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const supabase = createClient();
    if (!supabase) {
      setUploadError("Upload indisponible en mode démonstration.");
      return;
    }
    setUploading(true);
    setUploadError(null);
    const urls: string[] = [];
    for (const file of Array.from(files).slice(0, 12 - photos.length)) {
      if (file.size > 8 * 1024 * 1024) {
        setUploadError("Chaque photo doit faire moins de 8 Mo.");
        continue;
      }
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("ventes-photos").upload(path, file, { cacheControl: "31536000", upsert: false });
      if (error) {
        setUploadError(error.message);
        continue;
      }
      urls.push(supabase.storage.from("ventes-photos").getPublicUrl(path).data.publicUrl);
    }
    setPhotos((p) => [...p, ...urls]);
    setUploading(false);
  }

  function buildPayload(form: HTMLFormElement, status: "draft" | "active") {
    const fd = new FormData(form);
    const g = (k: string) => String(fd.get(k) ?? "").trim();
    const b = (k: string) => fd.get(k) === "on";
    return {
      id: existing?.id,
      horse_name: g("horse_name"),
      title: g("title"),
      breed: g("breed"),
      sex: g("sex"),
      birth_year: Number(g("birth_year")),
      height_cm: g("height_cm") ? Number(g("height_cm")) : undefined,
      color: g("color") || undefined,
      disciplines,
      level: g("level"),
      description: g("description"),
      temperament: g("temperament") || undefined,
      sire_number: g("sire_number"),
      papers: g("papers"),
      studbook_approved: b("studbook_approved"),
      sire_name: g("sire_name") || undefined,
      dam_name: g("dam_name") || undefined,
      dam_sire_name: g("dam_sire_name") || undefined,
      price: g("price") ? Number(g("price")) : undefined,
      price_hidden: priceHidden,
      price_negotiable: b("price_negotiable"),
      vat_included: isPro ? b("vat_included") : true,
      city: g("city"),
      postal_code: g("postal_code"),
      region: g("region"),
      photos,
      video_urls: videos
        .split(/\n+/)
        .map((s) => s.trim())
        .filter(Boolean),
      vet_check_available: b("vet_check_available"),
      xrays_available: b("xrays_available"),
      trial_available: b("trial_available"),
      visit_available: b("visit_available"),
      is_depot_vente: depot,
      owner_name: g("owner_name") || undefined,
      competition_results: g("competition_results") || undefined,
      health_notes: g("health_notes") || undefined,
      known_vices: g("known_vices") || undefined,
      status,
      honesty: b("honesty"),
    };
  }

  return (
    <form
      ref={formRef}
      action={action}
      noValidate
      onInput={refreshValidity}
      onChange={refreshValidity}
      onSubmit={(e) => {
        const form = e.currentTarget;
        const status = (form.querySelector<HTMLInputElement>("input[name=__status]")?.value as "draft" | "active") ?? "active";
        // Validation côté client sur toutes les étapes (les champs masqués ne bloquent plus l'envoi en silence).
        const problems = collectProblems(form, status);
        if (problems.length) {
          e.preventDefault();
          setStep(problems[0].step);
          setClientError(`À compléter avant de ${status === "draft" ? "sauvegarder" : "publier"} : ${Array.from(new Set(problems.map((p) => p.label))).join(" · ")}`);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        setClientError(null);
        const payload = form.querySelector<HTMLInputElement>("input[name=payload]")!;
        payload.value = JSON.stringify(buildPayload(form, status));
      }}
      className="space-y-6"
    >
      {(clientError || (state && !state.ok)) && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
          {clientError ?? state?.message}
        </p>
      )}
      <input type="hidden" name="payload" />
      <input type="hidden" name="__status" defaultValue="active" />

      <p className="text-xs text-muted">
        Les champs marqués d&apos;un <span className="text-red-600">*</span> sont obligatoires pour publier. Un brouillon ne demande que le nom et la race.
      </p>
      <ol className="flex flex-wrap gap-2 text-xs">
        {steps.map((s, i) => (
          <li key={s}>
            <button type="button" onClick={() => goTo(i)} className={`rounded-full px-3 py-1.5 font-medium ${i === step ? "bg-primary text-white" : "bg-white text-muted border border-line hover:text-primary"}`}>
              {i + 1}. {s}
            </button>
          </li>
        ))}
      </ol>

      {/* Étape 1 */}
      <section data-step="0" className={`card space-y-4 p-5 ${step === 0 ? "" : "hidden"}`}>
        <h2 className="font-semibold">Le cheval</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom du cheval" name="horse_name" required defaultValue={existing?.horse_name} />
          <div>
            <label className="label" htmlFor="breed">
              Race / stud-book
              <Req />
            </label>
            <input id="breed" name="breed" list="breeds" required className="input" defaultValue={existing?.breed} placeholder="Selle Français, KWPN, OC…" />
            <datalist id="breeds">
              {BREEDS.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </div>
          <SelectField label="Sexe" name="sex" options={Object.entries(SEXES)} defaultValue={existing?.sex} required />
          <Field label="Année de naissance" name="birth_year" type="number" required min={1980} max={new Date().getFullYear()} defaultValue={existing?.birth_year} />
          <Field label="Taille au garrot (cm)" name="height_cm" type="number" min={60} max={220} defaultValue={existing?.height_cm ?? undefined} helper="Laissez vide pour un foal." />
          <SelectField label="Robe" name="color" options={COLORS.map((c) => [c, c])} defaultValue={existing?.color ?? ""} allowEmpty />
          <SelectField label="Niveau actuel" name="level" options={Object.entries(LEVELS)} defaultValue={existing?.level ?? "club"} required />
        </div>
        <fieldset>
          <legend className="label">
            Disciplines (1 à 4)
            <Req />
          </legend>
          <div className="flex flex-wrap gap-2">
            {DISCIPLINES.map((d) => {
              const on = disciplines.includes(d);
              return (
                <button key={d} type="button" onClick={() => setDisciplines((cur) => (on ? cur.filter((x) => x !== d) : cur.length < 4 ? [...cur, d] : cur))} className={`rounded-full border px-3 py-1 text-sm ${on ? "border-primary bg-primary text-white" : "border-line bg-white hover:border-primary"}`} aria-pressed={on}>
                  {d}
                </button>
              );
            })}
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Commune où se trouve le cheval" name="city" required defaultValue={existing?.city} />
          <Field label="Code postal" name="postal_code" pattern="[0-9]{5}" defaultValue={existing?.postal_code ?? undefined} />
          <SelectField label="Région" name="region" options={REGIONS.map((r) => [r, r])} defaultValue={existing?.region} required />
        </div>
      </section>

      {/* Étape 2 */}
      <section data-step="1" className={`card space-y-4 p-5 ${step === 1 ? "" : "hidden"}`}>
        <h2 className="font-semibold">Origines et papiers</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Père" name="sire_name" defaultValue={existing?.sire_name ?? undefined} />
          <Field label="Mère" name="dam_name" defaultValue={existing?.dam_name ?? undefined} />
          <Field label="Père de mère" name="dam_sire_name" defaultValue={existing?.dam_sire_name ?? undefined} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField label="Papiers" name="papers" options={Object.entries(PAPERS)} defaultValue={existing?.papers ?? "sire_full"} required onChange={setPapers} />
          <Field label="Numéro SIRE" name="sire_number" required={papers !== "onc"} defaultValue={existing?.sire_number ?? undefined} placeholder="Ex. 23000123456A" helper="Obligatoire pour publier (sauf ONC). Il n'est affiché que partiellement et sert à lutter contre les fausses annonces." />
        </div>
        <Check name="studbook_approved" label="Approuvé(e) à la reproduction dans son stud-book" defaultChecked={existing?.studbook_approved} />
        <div className="rounded-xl bg-primary-soft p-3 text-sm text-primary">
          <Info className="mr-1 inline h-4 w-4" /> Le vendeur juridique doit être le propriétaire inscrit sur la carte d&apos;immatriculation, ou disposer d&apos;un mandat écrit.
        </div>
        <Check name="is_depot_vente" label="Je vends ce cheval pour le compte d'un tiers (dépôt-vente, mandat)" defaultChecked={depot} onChange={setDepot} />
        {depot && (
          <Field label="Pour le compte de" name="owner_name" defaultValue={existing?.owner_name ?? undefined} placeholder="Ex. Propriétaire particulier, Élevage X…" helper="Cette mention apparaît sur l'annonce. Utilisez notre modèle de mandat de dépôt-vente." required />
        )}
      </section>

      {/* Étape 3 */}
      <section data-step="2" className={`card space-y-4 p-5 ${step === 2 ? "" : "hidden"}`}>
        <h2 className="font-semibold">Description</h2>
        <Field label="Titre de l'annonce" name="title" required minLength={15} maxLength={120} defaultValue={existing?.title} placeholder="Ex. Quartz – SF 4 ans par Diamant de Semilly, avenir CSO" helper="Race, âge, discipline, niveau : un titre précis attire les bons acheteurs." />
        <div>
          <label className="label" htmlFor="description">
            Description complète
            <Req />
          </label>
          <textarea id="description" name="description" rows={9} required minLength={120} className="input" defaultValue={existing?.description} placeholder={"Travail actuel et fréquence, résultats, caractère à pied et monté, mode de vie (box/pré, seul/troupeau), comportement au maréchal / transport / véto, raison de la vente, profil de cavalier recherché…"} />
          <p className="helper">Évitez les formules creuses (« bon caractère », « polyvalent »). Les annonces précises reçoivent 2 à 3 fois plus de demandes de visite.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextArea label="Tempérament et mode de vie" name="temperament" defaultValue={existing?.temperament ?? undefined} />
          <TextArea label="Résultats (concours, labels, M&A)" name="competition_results" defaultValue={existing?.competition_results ?? undefined} />
          <TextArea label="Santé : antécédents, suivi, vaccins" name="health_notes" defaultValue={existing?.health_notes ?? undefined} helper="Dernière visite véto, vaccins, vermifuge, dents, antécédents (coliques, boiteries, opérations)." />
          <TextArea label="Particularités et défauts connus" name="known_vices" defaultValue={existing?.known_vices ?? undefined} helper="Tics, difficultés au ferrage/embarquement, allergies… Déclarer par écrit vous protège juridiquement." />
        </div>
      </section>

      {/* Étape 4 */}
      <section data-step="3" className={`card space-y-4 p-5 ${step === 3 ? "" : "hidden"}`}>
        <h2 className="font-semibold">
          Photos <Req /> et vidéos
        </h2>
        <p className="text-sm text-muted">Recommandé : profil « modèle » entier, 3/4 avant, en mouvement, monté. Cheval propre, lumière du jour, fond dégagé. Pas de photo de groupe ni de cheval qui broute.</p>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-sand p-6 text-sm text-muted hover:border-primary">
          <ImagePlus className="mb-2 h-6 w-6 text-primary" />
          {uploading ? "Envoi en cours…" : "Ajouter des photos (jpg, png, webp – 8 Mo max, 12 photos max)"}
          <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => upload(e.target.files)} disabled={uploading || photos.length >= 12} />
        </label>
        {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
        {photos.length > 0 && (
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {photos.map((p, i) => (
              <li key={p} className="relative aspect-[4/3] overflow-hidden rounded-lg border border-line">
                <Image src={p} alt="" fill sizes="200px" className="object-cover" />
                {i === 0 && <span className="absolute left-1 top-1 rounded bg-white/90 px-1.5 text-[10px] font-medium text-primary">Principale</span>}
                <button type="button" onClick={() => setPhotos((cur) => cur.filter((x) => x !== p))} className="absolute right-1 top-1 rounded bg-white/90 p-1 text-red-600" aria-label="Retirer la photo">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div>
          <label className="label" htmlFor="videos">
            Liens vidéo (YouTube, Vimeo) – un par ligne
          </label>
          <textarea id="videos" rows={3} className="input" value={videos} onChange={(e) => setVideos(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" />
          <p className="helper">Trois allures aux deux mains, en liberté pour un jeune, monté (plat + saut) pour un cheval au travail. Datez la vidéo dans la description.</p>
        </div>
      </section>

      {/* Étape 5 */}
      <section data-step="4" className={`card space-y-4 p-5 ${step === 4 ? "" : "hidden"}`}>
        <h2 className="font-semibold">Prix et conditions</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prix (€)" name="price" type="number" min={0} step={100} defaultValue={existing?.price ?? undefined} disabled={priceHidden} required={!priceHidden} helper="Un prix affiché et juste génère plus de contacts sérieux." />
          <div className="space-y-2 pt-6">
            <Check name="price_hidden" label="Prix sur demande" defaultChecked={priceHidden} onChange={setPriceHidden} />
            <Check name="price_negotiable" label="Prix à débattre" defaultChecked={existing?.price_negotiable} />
            {isPro && <Check name="vat_included" label="Prix TTC (décochez pour un prix HT)" defaultChecked={existing?.vat_included ?? true} />}
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Check name="visit_available" label="Visite sur rendez-vous" defaultChecked={existing?.visit_available ?? true} />
          <Check name="trial_available" label="Essai monté possible (en présence du vendeur)" defaultChecked={existing?.trial_available ?? true} />
          <Check name="vet_check_available" label="Visite vétérinaire d'achat acceptée (véto de l'acheteur)" defaultChecked={existing?.vet_check_available ?? true} />
          <Check name="xrays_available" label="Radios récentes disponibles" defaultChecked={existing?.xrays_available} />
        </div>
        <label className="flex items-start gap-2 rounded-xl border border-pink/60 bg-pink-soft/40 p-3 text-sm">
          <input type="checkbox" name="honesty" required className="mt-0.5 h-4 w-4 accent-primary" />
          <span>
            <Req />
            Je certifie que les informations sont exactes et complètes, que je suis propriétaire du cheval ou mandaté par écrit, et je m&apos;engage à respecter le{" "}
            <Link href="/charte" className="text-primary underline" target="_blank">
              pacte de bonne conduite
            </Link>{" "}
            (pas de sédation à l&apos;essai, pas de vice dissimulé).
          </span>
        </label>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button type="button" disabled={step === 0} onClick={() => goTo(step - 1)} className="btn-neutral">
            Précédent
          </button>
          <button type="button" disabled={step === steps.length - 1} onClick={() => goTo(step + 1)} className="btn-primary">
            Suivant
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="btn-ghost"
            onClick={(e) => {
              (e.currentTarget.form!.querySelector("input[name=__status]") as HTMLInputElement).value = "draft";
            }}
          >
            Enregistrer en brouillon
          </button>
          <button
            type="submit"
            disabled={pending || !allValid}
            title={allValid ? undefined : "Complétez toutes les étapes obligatoires pour publier"}
            className="btn-primary disabled:bg-line disabled:text-muted"
            onClick={(e) => {
              (e.currentTarget.form!.querySelector("input[name=__status]") as HTMLInputElement).value = "active";
            }}
          >
            {pending ? "Publication…" : existing ? "Mettre à jour" : "Publier l'annonce"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Req() {
  return (
    <span className="text-red-600" aria-hidden="true">
      {" "}*
    </span>
  );
}

function Field({ label, name, helper, ...rest }: { label: string; name: string; helper?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
        {rest.required && <Req />}
      </label>
      <input id={name} name={name} className="input" {...rest} />
      {helper && <p className="helper">{helper}</p>}
    </div>
  );
}
function TextArea({ label, name, helper, ...rest }: { label: string; name: string; helper?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
        {rest.required && <Req />}
      </label>
      <textarea id={name} name={name} rows={3} className="input" {...rest} />
      {helper && <p className="helper">{helper}</p>}
    </div>
  );
}
function SelectField({ label, name, options, defaultValue, allowEmpty, required, onChange }: { label: string; name: string; options: (readonly [string, string])[]; defaultValue?: string; allowEmpty?: boolean; required?: boolean; onChange?: (v: string) => void }) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
        {required && <Req />}
      </label>
      <select id={name} name={name} className="input" defaultValue={defaultValue ?? (allowEmpty ? "" : options[0][0])} onChange={(e) => onChange?.(e.target.value)}>
        {allowEmpty && <option value="">—</option>}
        {options.map(([k, l]) => (
          <option key={k} value={k}>
            {l}
          </option>
        ))}
      </select>
    </div>
  );
}
function Check({ name, label, defaultChecked, onChange }: { name: string; label: string; defaultChecked?: boolean; onChange?: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} onChange={(e) => onChange?.(e.target.checked)} className="h-4 w-4 accent-primary" /> {label}
    </label>
  );
}
