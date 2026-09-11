import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, STRIPE_PRICES } from "@/lib/stripe";

export async function POST(request: Request) {
  const stripe = getStripe();
  const supabase = await createClient();
  if (!stripe || !supabase) return NextResponse.json({ error: "Paiement non configuré (mode démonstration)." }, { status: 503 });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/connexion?next=/abonnement", request.url), 303);
  const form = await request.formData();
  const plan = String(form.get("plan")) as "contact" | "pro";
  const price = STRIPE_PRICES[plan];
  if (!price) return NextResponse.json({ error: "Offre inconnue." }, { status: 400 });

  const { data: existing } = await supabase.from("subscriptions").select("stripe_customer_id").eq("user_id", user.id).not("stripe_customer_id", "is", null).limit(1).maybeSingle();
  const origin = new URL(request.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    customer: existing?.stripe_customer_id ?? undefined,
    customer_email: existing?.stripe_customer_id ? undefined : user.email,
    client_reference_id: user.id,
    metadata: { user_id: user.id, plan },
    subscription_data: { metadata: { user_id: user.id, plan } },
    allow_promotion_codes: true,
    locale: "fr",
    success_url: `${origin}/abonnement?success=1`,
    cancel_url: `${origin}/abonnement?cancel=1`,
  });
  return NextResponse.redirect(session.url!, 303);
}
