"use client";
import { useState } from "react";
import Image from "next/image";

export function Gallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [i, setI] = useState(0);
  if (!photos.length) return <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-primary-soft text-sm text-muted">Pas de photo</div>;
  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-primary-soft">
        <Image src={photos[i]} alt={`${alt} – photo ${i + 1}`} fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" priority />
      </div>
      {photos.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {photos.map((p, idx) => (
            <button key={p + idx} type="button" onClick={() => setI(idx)} className={`relative aspect-[4/3] overflow-hidden rounded-lg border-2 ${idx === i ? "border-primary" : "border-transparent"}`} aria-label={`Photo ${idx + 1}`}>
              <Image src={p} alt="" fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
