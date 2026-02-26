import { NextResponse } from "next/server"
import Stripe from "stripe"
import { headers } from "next/headers"
export const runtime = "nodejs"


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
} as any)

export async function POST(req: Request) {
  const body = await req.text()
  const sig =(await headers()).get("stripe-signature")

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string// 🔥 clé du CLI
    )
  } catch (err: any) {
    console.error("Webhook error:", err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  // ✅ TEST
  if (event.type === "checkout.session.completed") {
    console.log("✅ Paiement confirmé", event.data.object)
  }

  return NextResponse.json({ received: true })
}
