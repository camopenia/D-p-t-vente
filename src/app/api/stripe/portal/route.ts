import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const stripe = getStripe();
  const supabase = await createClient();
  if (!stripe || !supabase) return NextResponse.json({ error: "Paiement non configuré." }, { status: 503 });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/connexion", request.url), 303);
  const { data } = await supabase.from("subscriptions").select("stripe_customer_id").eq("user_id", user.id).not("stripe_customer_id", "is", null).limit(1).maybeSingle();
  if (!data?.stripe_customer_id) return NextResponse.redirect(new URL("/abonnement", request.url), 303);
  const session = await stripe.billingPortal.sessions.create({ customer: data.stripe_customer_id, return_url: `${new URL(request.url).origin}/abonnement` });
  return NextResponse.redirect(session.url, 303);
}
