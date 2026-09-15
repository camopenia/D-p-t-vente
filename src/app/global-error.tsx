"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: "Poppins, system-ui, sans-serif", margin: 0, padding: "4rem 1rem", textAlign: "center", color: "#000", background: "#F8F7F2" }}>
        <p style={{ color: "#155B57", fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Cavalons Ventes</p>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: "0.5rem 0" }}>Le site est momentanément indisponible</h1>
        <p style={{ color: "#555", fontSize: 14, maxWidth: 420, margin: "0 auto" }}>Un problème temporaire est survenu. Réessayez dans quelques secondes.</p>
        <button type="button" onClick={reset} style={{ marginTop: 24, background: "#155B57", color: "#fff", border: 0, borderRadius: 999, padding: "0.75rem 1.5rem", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          Réessayer
        </button>
        {error.digest && <p style={{ marginTop: 24, fontSize: 12, color: "#777" }}>Référence : {error.digest}</p>}
      </body>
    </html>
  );
}
