import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { customerId } = await request.json()

    // Créer une session du portail client
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${request.headers.get('origin')}/subscription`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Erreur portail client:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}