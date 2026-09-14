"use client";
import { useEffect, useRef, useState } from "react";
import { REGIONS } from "@/lib/constants";

/** Code région INSEE → libellé utilisé sur le site */
const REGION_BY_CODE: Record<string, (typeof REGIONS)[number]> = {
  "84": "Auvergne-Rhône-Alpes",
  "27": "Bourgogne-Franche-Comté",
  "53": "Bretagne",
  "24": "Centre-Val de Loire",
  "94": "Corse",
  "44": "Grand Est",
  "32": "Hauts-de-France",
  "11": "Île-de-France",
  "28": "Normandie",
  "75": "Nouvelle-Aquitaine",
  "76": "Occitanie",
  "52": "Pays de la Loire",
  "93": "Provence-Alpes-Côte d'Azur",
  "01": "Outre-mer",
  "02": "Outre-mer",
  "03": "Outre-mer",
  "04": "Outre-mer",
  "06": "Outre-mer",
};

interface Commune {
  nom: string;
  codesPostaux: string[];
  codeRegion: string;
  codeDepartement: string;
}

const API = "https://geo.api.gouv.fr/communes";

async function searchCommunes(params: string): Promise<Commune[]> {
  try {
    const res = await fetch(`${API}?${params}&fields=nom,codesPostaux,codeRegion,codeDepartement&boost=population&limit=8`);
    if (!res.ok) return [];
    return (await res.json()) as Commune[];
  } catch {
    return [];
  }
}

/**
 * Commune, code postal et région liés : on tape la commune (ou le code postal), on choisit dans la liste,
 * les deux autres champs se remplissent. Les trois restent modifiables à la main.
 * Les champs portent les noms city / postal_code / region attendus par les formulaires.
 */
export function CommuneFields({ city = "", postalCode = "", region = "", required = true, cityLabel = "Commune où se trouve le cheval" }: { city?: string | null; postalCode?: string | null; region?: string | null; required?: boolean; cityLabel?: string }) {
  const [cityValue, setCityValue] = useState(city ?? "");
  const [postal, setPostal] = useState(postalCode ?? "");
  const [regionValue, setRegionValue] = useState(region ?? "");
  const [suggestions, setSuggestions] = useState<Commune[]>([]);
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<"city" | "postal" | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  function schedule(fn: () => void) {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(fn, 250);
  }

  function pick(c: Commune) {
    setCityValue(c.nom);
    if (!postal || !c.codesPostaux.includes(postal)) setPostal(c.codesPostaux[0] ?? "");
    const r = REGION_BY_CODE[c.codeRegion];
    if (r) setRegionValue(r);
    setSuggestions([]);
    setOpen(false);
    // Signale le changement au formulaire parent (validation en direct)
    wrapRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={wrapRef} className="grid gap-4 sm:grid-cols-3">
      <div className="relative">
        <label className="label" htmlFor="city">
          {cityLabel}
          {required && (
            <span className="text-red-600" aria-hidden="true">
              {" "}*
            </span>
          )}
        </label>
        <input
          id="city"
          name="city"
          required={required}
          autoComplete="off"
          className="input"
          value={cityValue}
          placeholder="Commencez à taper…"
          onFocus={() => suggestions.length && setOpen(true)}
          onChange={(e) => {
            const q = e.target.value;
            setCityValue(q);
            setSource("city");
            if (q.trim().length < 2) {
              setSuggestions([]);
              return;
            }
            schedule(async () => {
              const list = await searchCommunes(`nom=${encodeURIComponent(q.trim())}`);
              setSuggestions(list);
              setOpen(list.length > 0);
            });
          }}
        />
        {open && suggestions.length > 0 && (
          <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-line bg-white py-1 text-sm shadow-lg" role="listbox">
            {suggestions.map((c) => (
              <li key={`${c.nom}-${c.codeDepartement}-${c.codesPostaux[0]}`}>
                <button type="button" onClick={() => pick(c)} className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-primary-soft">
                  <span className="font-medium">{c.nom}</span>
                  <span className="shrink-0 text-xs text-muted">
                    {source === "postal" && c.codesPostaux.length > 1 ? postal : c.codesPostaux[0]} · {REGION_BY_CODE[c.codeRegion] ?? c.codeDepartement}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="helper">Choisissez dans la liste : code postal et région se remplissent seuls.</p>
      </div>
      <div>
        <label className="label" htmlFor="postal_code">
          Code postal
        </label>
        <input
          id="postal_code"
          name="postal_code"
          inputMode="numeric"
          pattern="[0-9]{5}"
          maxLength={5}
          autoComplete="off"
          className="input"
          value={postal}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 5);
            setPostal(v);
            setSource("postal");
            if (v.length === 5) {
              schedule(async () => {
                const list = await searchCommunes(`codePostal=${v}`);
                if (list.length === 1) pick(list[0]);
                else {
                  setSuggestions(list);
                  setOpen(list.length > 0);
                }
              });
            }
          }}
        />
      </div>
      <div>
        <label className="label" htmlFor="region">
          Région
          {required && (
            <span className="text-red-600" aria-hidden="true">
              {" "}*
            </span>
          )}
        </label>
        <select id="region" name="region" required={required} className="input" value={regionValue} onChange={(e) => setRegionValue(e.target.value)}>
          <option value="">—</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
