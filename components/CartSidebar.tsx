
'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/lib/contexts/CartContext'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'
import { it } from 'node:test'

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  // ⭐ Le hook DOIT être ici → DANS le composant
  const { cart, removeFromCart, updateQuantity, getTotal } = useCart()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data?.user ?? null)
    }
    fetchUser()
  }, [])

  const total = getTotal().toFixed(2)

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? '' : 'pointer-events-none'}`}>
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      <div
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl p-6 overflow-y-auto transition-transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <h2 className="text-3xl font-bold mb-6">Votre panier</h2>

        {cart.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            Votre panier est vide 🛒
          </div>
        )}

        {/* Items */}
        <div className="space-y-6">
          {cart.map((item) => (
            <div key={item.id} className="flex gap-4 border-b pb-4">
              <img src={item.image} className="w-20 h-20 rounded-lg" />

              <div className="flex-1">
                <h3 className="font-bold">{item.name}</h3>

                {/* ⭐ BUNDLE */}
                {item.isBundle ? (
                  <>
                    <p className="text-sm text-gray-500">
                      Pack {item.items?.length} produits
                    </p>

                    <p className="text-sm text-green-600 font-semibold">
                      -{item.bundleDiscount}% FORMULE PACK
                    </p>

                    {item.isSubscription && (
                      <p className="text-sm text-purple-600 font-semibold">
                        + -5% abonnement
                      </p>
                    )}

                    <p className="text-xl font-bold mt-1">
                      {item.price.toFixed(2)}€
                    </p>
                  </>
                ) : (
                  <>
                    {/* ⭐ PRODUITS NORMAL OU ABONNEMENT */}
                    {item.isSubscription && (
                      <p className="text-sm text-purple-600 font-semibold">
                        Abonnement (-20%)
                      </p>
                    )}

                    <p className="text-xl font-bold">
                      {(item.isSubscription ? item.price * 0.8 : item.price).toFixed(
                        2
                      )}€
                    </p>

                    {/* Quantités */}
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1 bg-gray-200 rounded"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 bg-gray-200 rounded"
                      >
                        +
                      </button>
                    </div>
                  </>
                )}

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 text-sm mt-2"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bas de panier */}
        {cart.length > 0 && (
          <div className="mt-10 border-t pt-6 space-y-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{total}€</span>
            </div>

            {/* ABONNEMENT SANS CONNEXION */}
            {!user && cart.some((i) => i.isSubscription) && (
              <div className="text-red-600 text-sm font-semibold">
                Vous devez être connecté pour acheter un abonnement.
              </div>
            )}

            <button
              className="w-full bg-black text-white py-4 rounded-lg font-bold text-lg hover:bg-gray-800 transition"
              onClick={() => {
                if (!user && cart.some((i) => i.isSubscription)) {
                  window.location.href = '/login'
                  return
                }
                window.location.href = '/checkout'
              }}
            >
              Acheter maintenant
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 text-gray-600 font-semibold underline"
            >
              Continuer mes achats
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
