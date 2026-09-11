"use client";
import { useEffect, useMemo, useState } from "react";
import { Printer, RotateCcw } from "lucide-react";
import { CONTRACT_TEMPLATES } from "@/lib/content/contracts";

export function ContractBuilder({ templateId }: { templateId: string }) {
  const template = CONTRACT_TEMPLATES[templateId];
  const storageKey = `cavalons-contrat-${template.id}`;
  const initial = useMemo(() => {
    const o: Record<string, string> = {};
    for (const f of template.fields) if (f.default !== undefined) o[f.name] = String(f.default);
    return o;
  }, [template]);
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [tab, setTab] = useState<"form" | "preview">("form");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setValues({ ...initial, ...JSON.parse(saved) });
    } catch {}
  }, [storageKey, initial]);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(values));
    } catch {}
  }, [values, storageKey]);

  const sections = template.build(values);
  const groups = Array.from(new Set(template.fields.map((f) => f.section)));
  const set = (k: string, val: string) => setValues((cur) => ({ ...cur, [k]: val }));

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="no-print flex gap-2 lg:hidden">
        <button type="button" onClick={() => setTab("form")} className={tab === "form" ? "btn-primary flex-1" : "btn-neutral flex-1"}>
          Remplir
        </button>
        <button type="button" onClick={() => setTab("preview")} className={tab === "preview" ? "btn-primary flex-1" : "btn-neutral flex-1"}>
          Aperçu
        </button>
      </div>

      <form className={`no-print space-y-5 ${tab === "form" ? "" : "hidden lg:block"}`} onSubmit={(e) => e.preventDefault()}>
        {groups.map((g) => (
          <fieldset key={g} className="card p-5">
            <legend className="px-1 text-sm font-semibold text-primary">{g}</legend>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {template.fields
                .filter((f) => f.section === g)
                .map((f) => {
                  const wide = f.type === "textarea" || f.type === "checkbox" || (f.type === "text" && f.label.length > 60);
                  return (
                    <div key={f.name} className={wide ? "sm:col-span-2" : ""}>
                      {f.type === "checkbox" ? (
                        <label className="flex items-start gap-2 text-sm">
                          <input type="checkbox" checked={values[f.name] === "true"} onChange={(e) => set(f.name, e.target.checked ? "true" : "false")} className="mt-0.5 h-4 w-4 accent-primary" />
                          <span>{f.label}</span>
                        </label>
                      ) : (
                        <>
                          <label className="label" htmlFor={f.name}>
                            {f.label}
                          </label>
                          {f.type === "textarea" ? (
                            <textarea id={f.name} rows={4} className="input" value={values[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)} placeholder={f.placeholder} />
                          ) : f.type === "select" ? (
                            <select id={f.name} className="input" value={values[f.name] ?? f.options?.[0]?.[0] ?? ""} onChange={(e) => set(f.name, e.target.value)}>
                              {f.options?.map(([k, l]) => (
                                <option key={k} value={k}>
                                  {l}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input id={f.name} type={f.type} className="input" value={values[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)} placeholder={f.placeholder} />
                          )}
                        </>
                      )}
                      {f.help && <p className="helper">{f.help}</p>}
                    </div>
                  );
                })}
            </div>
          </fieldset>
        ))}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => window.print()} className="btn-primary">
            <Printer className="h-4 w-4" /> Imprimer / enregistrer en PDF
          </button>
          <button
            type="button"
            onClick={() => {
              setValues(initial);
              try {
                localStorage.removeItem(storageKey);
              } catch {}
            }}
            className="btn-ghost"
          >
            <RotateCcw className="h-4 w-4" /> Réinitialiser
          </button>
        </div>
        <p className="text-xs text-muted">Vos saisies restent dans votre navigateur (aucune donnée envoyée à nos serveurs). Utilisez « Imprimer » puis « Enregistrer au format PDF ».</p>
      </form>

      <article className={`print-page card p-6 text-[13px] leading-relaxed sm:p-10 ${tab === "preview" ? "" : "hidden lg:block"}`}>
        <header className="border-b border-line pb-4">
          <p className="text-[10px] uppercase tracking-widest text-muted">Modèle Cavalons Ventes · ventes.cavalons.fr</p>
          <h2 className="mt-1 text-xl font-semibold text-primary">{template.title}</h2>
          <p className="text-xs text-muted">{template.subtitle}</p>
        </header>
        {sections.map((s) => (
          <section key={s.title} className="mt-5">
            <h3 className="text-sm font-semibold">{s.title}</h3>
            {s.paragraphs.map((para, i) => (
              <p key={i} className="mt-1.5 text-justify">
                {para}
              </p>
            ))}
          </section>
        ))}
        <section className="mt-6">
          <h3 className="text-sm font-semibold">Annexes</h3>
          <ul className="mt-1 list-disc pl-5">
            {template.annexes.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </section>
        <section className="mt-8 grid grid-cols-2 gap-8">
          {template.signatures.map((s) => (
            <div key={s}>
              <p className="text-sm font-semibold">{s}</p>
              <div className="mt-2 h-24 rounded-lg border border-dashed border-line" />
            </div>
          ))}
        </section>
        <p className="mt-8 border-t border-line pt-3 text-[10px] text-muted">
          Modèle fourni à titre informatif par Cavalons Ventes, à adapter à chaque situation ; il ne constitue pas un conseil juridique. Références : Code civil (art. 1112-1, 1243, 1583, 1588, 1590, 1641 s., 1875 s., 1915 s., 1984 s., 2367 s.), Code rural (L213-1 s., R213-1 s., D212-49, R215-14), Code de la consommation (L217-2, L612-1 s.).
        </p>
      </article>
    </div>
  );
}
