import { isSupabaseConfigured } from "@/lib/supabase/config";

export function DemoBanner() {
  if (isSupabaseConfigured()) return null;
  return (
    <div className="bg-pink-soft px-4 py-1.5 text-center text-xs text-[#8a2f40]">
      Mode démonstration : Supabase n&apos;est pas configuré, les annonces affichées sont fictives. Voir le README pour la mise en place.
    </div>
  );
}
