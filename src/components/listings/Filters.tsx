"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { BREEDS, DISCIPLINES, LEVELS, PAPERS, REGIONS, ROLES, SEXES } from "@/lib/constants";

export function Filters() {
  const router = useRouter();
  const sp = useSearchParams();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const v = (k: string) => sp.get(k) ?? "";

  function submit(form: HTMLFormElement) {
    const fd = new FormData(form);
    const params = new URLSearchParams();
    fd.forEach((val, key) => {
      if (typeof val === "string" && val.trim()) params.set(key, val.trim());
    });
    startTransition(() => router.push(`/chevaux?${params.toString()}`));
    setOpen(false);
  }

  const active = ["breed", "sex", "discipline", "level", "region", "papers", "sellerRole", "priceMin", "priceMax", "ageMin", "ageMax", "heightMin", "heightMax", "xrays", "trial"].filter((k) => sp.get(k)).length;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(e.currentTarget);
      }}
      className="card p-4"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="label" htmlFor="q">
            Recherche
          </label>
          <input id="q" name="q" defaultValue={v("q")} placeholder="Nom, race, père, ville…" className="input" />
        </div>
        <div className="w-full md:w-48">
          <label className="label" htmlFor="discipline">
            Discipline
          </label>
          <select id="discipline" name="discipline" defaultValue={v("discipline")} className="input">
            <option value="">Toutes</option>
            {DISCIPLINES.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="w-full md:w-52">
          <label className="label" htmlFor="region">
            Région
          </label>
          <select id="region" name="region" defaultValue={v("region")} className="input">
            <option value="">Toutes</option>
            {REGIONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="w-full md:w-44">
          <label className="label" htmlFor="sort">
            Trier
          </label>
          <select id="sort" name="sort" defaultValue={v("sort") || "recent"} className="input">
            <option value="recent">Plus récentes</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
            <option value="age_asc">Plus jeunes</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setOpen((o) => !o)} className="btn-neutral whitespace-nowrap">
            <SlidersHorizontal className="h-4 w-4" /> Filtres{active ? ` (${active})` : ""}
          </button>
          <button type="submit" className="btn-primary">
            Rechercher
          </button>
        </div>
      </div>

      <div className={`${open ? "grid" : "hidden"} mt-4 gap-4 border-t border-line pt-4 sm:grid-cols-2 lg:grid-cols-4`}>
        <Select name="breed" label="Race" value={v("breed")} options={BREEDS.map((b) => [b, b])} />
        <Select name="sex" label="Sexe" value={v("sex")} options={Object.entries(SEXES)} />
        <Select name="level" label="Niveau" value={v("level")} options={Object.entries(LEVELS)} />
        <Select name="papers" label="Papiers" value={v("papers")} options={Object.entries(PAPERS)} />
        <Select name="sellerRole" label="Type de vendeur" value={v("sellerRole")} options={Object.entries(ROLES).filter(([k]) => k !== "acheteur").map(([k, r]) => [k, r.label])} />
        <Range name="price" label="Prix (€)" min={v("priceMin")} max={v("priceMax")} step={500} />
        <Range name="age" label="Âge (ans)" min={v("ageMin")} max={v("ageMax")} step={1} />
        <Range name="height" label="Taille (cm)" min={v("heightMin")} max={v("heightMax")} step={1} />
        <div className="flex flex-wrap items-center gap-4 lg:col-span-3">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="xrays" value="1" defaultChecked={v("xrays") === "1"} className="h-4 w-4 accent-primary" /> Radios disponibles
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="trial" value="1" defaultChecked={v("trial") === "1"} className="h-4 w-4 accent-primary" /> Essai possible
          </label>
        </div>
        <div className="flex items-end justify-end">
          <button type="button" onClick={() => router.push("/chevaux")} className="btn-ghost text-sm">
            <X className="h-4 w-4" /> Réinitialiser
          </button>
        </div>
      </div>
    </form>
  );
}

function Select({ name, label, value, options }: { name: string; label: string; value: string; options: (readonly [string, string])[] }) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <select id={name} name={name} defaultValue={value} className="input">
        <option value="">Indifférent</option>
        {options.map(([k, l]) => (
          <option key={k} value={k}>
            {l}
          </option>
        ))}
      </select>
    </div>
  );
}

function Range({ name, label, min, max, step }: { name: string; label: string; min: string; max: string; step: number }) {
  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex items-center gap-2">
        <input type="number" name={`${name}Min`} defaultValue={min} placeholder="Min" step={step} min={0} className="input" aria-label={`${label} minimum`} />
        <span className="text-muted">–</span>
        <input type="number" name={`${name}Max`} defaultValue={max} placeholder="Max" step={step} min={0} className="input" aria-label={`${label} maximum`} />
      </div>
    </div>
  );
}
