import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function mapStatus(s: Stripe.Subscription.Status): "active" | "trialing" | "past_due" | "canceled" | "incomplete" {
  if (s === "active") return "active";
  if (s === "trialing") return "trialing";
  if (s === "past_due" || s === "unpaid") return "past_due";
  if (s === "canceled" || s === "incomplete_expired" || s === "paused") return "canceled";
  return "incomplete";
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const supabase = createServiceClient();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !supabase || !secret) return NextResponse.json({ error: "Webhook non configuré." }, { status: 503 });

  const sig = request.headers.get("stripe-signature");
  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig ?? "", secret);
  } catch (err) {
    return NextResponse.json({ error: `Signature invalide : ${(err as Error).message}` }, { status: 400 });
  }

  // Idempotence
  const { error: dup } = await supabase.from("ventes_stripe_events").insert({ id: event.id, type: event.type });
  if (dup) return NextResponse.json({ received: true, duplicate: true });

  async function upsertFromSubscription(sub: Stripe.Subscription) {
    const userId = sub.metadata.user_id;
    const plan = (sub.metadata.plan as "contact" | "pro") ?? "contact";
    if (!userId) return;
    const periodEnd = sub.items.data[0]?.current_period_end;
    await supabase!.from("ventes_subscriptions").upsert(
      {
        user_id: userId,
        plan,
        status: mapStatus(sub.status),
        stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
        stripe_subscription_id: sub.id,
        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        cancel_at_period_end: sub.cancel_at_period_end,
      },
      { onConflict: "stripe_subscription_id" },
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(String(session.subscription));
        if (!sub.metadata.user_id && session.metadata?.user_id) {
          await stripe.subscriptions.update(sub.id, { metadata: session.metadata });
          sub.metadata = session.metadata;
        }
        await upsertFromSubscription(sub);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await upsertFromSubscription(event.data.object as Stripe.Subscription);
      break;
    default:
      break;
  }
  return NextResponse.json({ received: true });
}
