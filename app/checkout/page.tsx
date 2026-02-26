'use client'

import { useCart } from '@/lib/contexts/CartContext'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CheckoutPage() {
  const { cart, getTotal, removeFromCart } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'BE',
    phone: '',
  })

  const hasSubscription = cart.some(item => item.isSubscription)

  // Redirection si panier vide
  useEffect(() => {
    if (cart.length === 0) {
      router.push('/cart')
    }
  }, [cart.length, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (hasSubscription) {
      alert('Pour les abonnements, vous devez vous connecter')
      router.push('/login')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            isBundle: item.isBundle,
            productId: item.productId,
            stripePriceId: item.stripePriceId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            isSubscription: item.isSubscription,
            bundleDiscount: item.bundleDiscount,
            bundleItems: item.items,
          })),
          shippingAddress: formData,
        }),
      })

      const data = await response.json()

      if (data.error) {
        alert('Erreur : ' + data.error)
        setLoading(false)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Erreur:', err)
      alert('Une erreur est survenue')
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Premium */}
    
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-2">Finaliser la commande</h1>
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-12" />

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Formulaire */}
          <div>
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 space-y-6 shadow-sm animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold mb-6">Informations de livraison</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">📧 Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 
                        focus:bg-white focus:ring-2 focus:ring-black focus:border-black transition"
                      placeholder="votre@email.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">👤 Prénom *</label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 
                          focus:bg-white focus:ring-2 focus:ring-black focus:border-black transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Nom *</label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 
                          focus:bg-white focus:ring-2 focus:ring-black focus:border-black transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">🏠 Adresse *</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 
                        focus:bg-white focus:ring-2 focus:ring-black focus:border-black transition"
                      placeholder="123 Rue Example"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">📍 Ville *</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={e => setFormData({...formData, city: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 
                          focus:bg-white focus:ring-2 focus:ring-black focus:border-black transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Code postal *</label>
                      <input
                        type="text"
                        required
                        value={formData.postalCode}
                        onChange={e => setFormData({...formData, postalCode: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 
                          focus:bg-white focus:ring-2 focus:ring-black focus:border-black transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">🌍 Pays *</label>
                    <select
                      value={formData.country}
                      onChange={e => setFormData({...formData, country: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 
                        focus:bg-white focus:ring-2 focus:ring-black focus:border-black transition"
                    >
                      <option value="BE">Belgique</option>
                      <option value="FR">France</option>
                      <option value="NL">Pays-Bas</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">📞 Téléphone *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 
                        focus:bg-white focus:ring-2 focus:ring-black focus:border-black transition"
                      placeholder="+32 123 45 67 89"
                    />
                  </div>
                </div>
              </div>

              {hasSubscription && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                  <p className="text-yellow-800 font-semibold">⚠️ Connexion requise</p>
                  <p className="text-yellow-700 text-sm mt-1">Votre panier contient un abonnement. Vous devez vous connecter pour continuer.</p>
                </div>
              )}

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
                🔒 Paiement sécurisé par <span className="font-semibold">Stripe</span><br/>
                Vos données ne sont jamais stockées.
              </div>

              <button
                type="submit"
                disabled={loading || hasSubscription}
                className="w-full py-4 rounded-xl bg-black text-white font-semibold text-lg
                  hover:bg-gray-900 transition-all duration-200
                  disabled:bg-gray-400 disabled:cursor-not-allowed
                  flex items-center justify-center gap-3"
              >
                {loading && <span className="animate-spin">⏳</span>}
                {loading ? 'Redirection sécurisée...' : 'Continuer vers le paiement'}
              </button>

              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <span>Moyens de paiement</span>
                <div className="flex gap-2">
                  <span>💳</span>
                  <span>🍎</span>
                  <span>📱</span>
                </div>
              </div>
            </form>
          </div>

          {/* Résumé avec suppression */}
          <div>
            <div className="bg-white rounded-2xl p-8 sticky top-24 shadow-sm animate-fade-in">
              <h2 className="text-2xl font-bold mb-6">Votre commande</h2>

              <div className="space-y-4 mb-6 pb-6 border-b">
                {cart.map((item, index) => {
                  let displayPrice = item.price
                  
                  if (item.isBundle) {
                    displayPrice = item.price
                  } else if (item.isSubscription) {
                    displayPrice = item.price * 0.8
                  }

                  return (
                    <div key={`${item.id}-${index}`} className="flex items-start gap-4">
                      <img 
                        src={item.image} 
                        className="w-20 h-20 rounded-xl object-cover border flex-shrink-0"
                        alt={item.name}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm">{item.name}</h3>
                        
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.isBundle && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                              Bundle -{item.bundleDiscount}%
                            </span>
                          )}
                          {item.isSubscription && !item.isBundle && (
                            <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full">
                              Abonnement -20%
                            </span>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-1">Quantité: {item.quantity}</p>
                        
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-xs text-red-500 hover:text-red-700 transition mt-1"
                        >
                          Supprimer
                        </button>
                      </div>

                      <div className="font-semibold text-sm flex-shrink-0">
                        {(displayPrice * item.quantity).toFixed(2)}€
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-semibold">{getTotal().toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Livraison</span>
                  <span className="font-semibold">Gratuite</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-bold">{getTotal().toFixed(2)}€</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}