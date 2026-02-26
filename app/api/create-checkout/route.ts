import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabaseClient'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
} as any)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, shippingAddress } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Panier vide' }, { status: 400 })
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL?.startsWith('http')
        ? process.env.NEXT_PUBLIC_APP_URL
        : 'http://localhost:3000'

    console.log('✅ STRIPE BASE URL =', baseUrl)

    const line_items = []

    for (const item of items) {
      if (item.isBundle) {
        line_items.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: item.name,
              description: `Bundle avec ${item.bundleDiscount}% de réduction`,
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        })
      } else {
        const { data: product, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', item.productId)
          .single()

        if (error || !product) {
          return NextResponse.json(
            { error: `Produit ${item.productId} introuvable` },
            { status: 404 }
          )
        }

        const price = item.isSubscription ? product.prix * 0.8 : product.prix

        line_items.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: product.nom,
              images: product.images?.[0] ? [product.images[0]] : [],
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: item.quantity,
        })
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout`,
      metadata: {
        shippingAddress: JSON.stringify(shippingAddress),
      },
      shipping_address_collection: {
        allowed_countries: ['BE', 'FR', 'NL'],
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Erreur Stripe:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
