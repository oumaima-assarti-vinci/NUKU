'use client'

import Link from 'next/link'
import { useCart } from '@/lib/contexts/CartContext'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getTotal, getItemCount } = useCart()
  const router = useRouter()

  // État panier vide
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-28">
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <div className="bg-white rounded-3xl p-12 shadow-sm">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold mb-3">Votre panier est vide</h2>
            <p className="text-gray-600 mb-8">
              Découvrez nos produits premium pour commencer votre routine bien-être
            </p>
            
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-semibold rounded-xl hover:bg-gray-900 transition"
            >
              Explorer la boutique
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-28">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">
            Panier ({getItemCount()} article{getItemCount() > 1 ? 's' : ''})
          </h1>
          <Link
            href="/shop"
            className="text-sm font-medium text-gray-600 hover:text-black transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Continuer mes achats
          </Link>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-12" />

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Liste produits */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              // Calcul du prix affiché
              let displayPrice = item.price
              
              if (item.isBundle) {
                displayPrice = item.price
              } else if (item.isSubscription) {
                displayPrice = item.price * 0.8
              }

              return (
                <div 
                  key={item.id} 
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-6">
                    <img 
                      src={item.image} 
                      className="w-32 h-32 object-cover rounded-xl border flex-shrink-0"
                      alt={item.name}
                    />
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                      
                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.isBundle && (
                          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                            Bundle -{item.bundleDiscount}%
                          </span>
                        )}
                        {item.isSubscription && !item.isBundle && (
                          <span className="inline-block px-3 py-1 bg-black text-white text-xs font-semibold rounded-full">
                            Abonnement -20%
                          </span>
                        )}
                      </div>

                      {/* Prix */}
                      <div className="mb-4">
                        <span className="text-2xl font-bold">
                          {displayPrice.toFixed(2)}€
                        </span>
                        {item.isSubscription && !item.isBundle && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            {item.price.toFixed(2)}€
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-4 py-2 hover:bg-gray-100 transition"
                            aria-label="Diminuer la quantité"
                          >
                            −
                          </button>
                          <span className="px-4 py-2 border-x-2 border-gray-200 font-semibold min-w-[50px] text-center">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-4 py-2 hover:bg-gray-100 transition"
                            aria-label="Augmenter la quantité"
                          >
                            +
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium transition flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Résumé sticky */}
          <div className="lg:sticky lg:top-28 h-fit">
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-sm">
              <h3 className="text-2xl font-bold mb-6">Résumé de commande</h3>
              
              <div className="space-y-3 mb-6 pb-6 border-b-2 border-gray-100">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span className="font-semibold text-gray-900">{getTotal().toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Livraison</span>
                  <span className="font-semibold">Gratuite</span>
                </div>
              </div>

              <div className="flex justify-between text-2xl font-bold mb-8">
                <span>Total</span>
                <span>{getTotal().toFixed(2)}€</span>
              </div>

              <button 
                onClick={() => router.push('/checkout')}
                className="w-full py-4 bg-black text-white font-bold text-lg rounded-xl hover:bg-gray-900 transition-all mb-4 flex items-center justify-center gap-2"
              >
                Passer la commande
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Paiement sécurisé par Stripe</span>
              </div>
            </div>

            {/* Rassurance supplémentaire */}
            <div className="mt-6 p-6 bg-gray-50 rounded-2xl border border-gray-200">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Vos avantages
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Livraison gratuite sans minimum</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Retours gratuits sous 30 jours</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Paiement 100% sécurisé</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}