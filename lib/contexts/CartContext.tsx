'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

const DEFAULT_IMG =
  'https://images.unsplash.com/photo-1556228852-80c63843f03c?w=400&h=400&fit=crop'

export interface CartItem {
  id: string | number
  productId?: number
  stripePriceId?: string      // 🔥 AJOUTÉ - obligatoire pour Stripe
  name: string
  price: number
  quantity: number
  image: string
  isSubscription: boolean
  // Spécifique bundles:
  isBundle?: boolean
  items?: any[]
  bundleDiscount?: number
  originalPrice?: number
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (product: any, isSubscription?: boolean) => void
  removeFromCart: (id: string | number) => void
  updateQuantity: (id: string | number, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    try {
      const saved = localStorage.getItem('cart')
      if (saved) setCart(JSON.parse(saved))
    } catch (e) {
      console.error('Erreur chargement panier:', e)
    }
  }, [isClient])

  useEffect(() => {
    if (!isClient) return
    try {
      localStorage.setItem('cart', JSON.stringify(cart))
    } catch (e) {
      console.error('Erreur sauvegarde panier:', e)
    }
  }, [cart, isClient])

  const addToCart = (product: any, isSubscription: boolean = false) => {
    setCart(prev => {
      // 🔹 CAS BUNDLE
      if (product.isBundle) {
        const newItem: CartItem = {
          id: product.id ?? `bundle-${Date.now()}`,
          name: product.name ?? `Pack`,
          price: Number(product.price ?? 0),
          quantity: Number(product.quantity ?? 1),
          image: product.items?.[0]?.images?.[0] ?? DEFAULT_IMG,
          isSubscription: !!product.subscription,
          isBundle: true,
          items: product.items ?? [],
          bundleDiscount: product.bundleDiscount,
          originalPrice: product.originalPrice
        }
        return [...prev, newItem]
      }

      // 🔹 CAS PRODUIT STANDARD
      const existing = prev.find(
        it => !it.isBundle && it.productId === product.id && it.isSubscription === isSubscription
      )
      
      if (existing) {
        return prev.map(it =>
          it === existing ? { ...it, quantity: it.quantity + 1 } : it
        )
      }

      const newItem: CartItem = {
        id: Date.now(),
        productId: product.id,
        stripePriceId: product.stripePriceId || product.stripe_price_id, // 🔥 IMPORTANT
        name: product.nom || product.name || 'Produit',
        price: Number(product.prix ?? product.price ?? 0),
        quantity: 1,
        image: product.images?.[0] ?? DEFAULT_IMG,
        isSubscription
      }
      return [...prev, newItem]
    })
  }

  const removeFromCart = (id: string | number) => {
    setCart(prev => prev.filter(it => it.id !== id && it.productId !== id))
  }

  const updateQuantity = (id: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setCart(prev =>
      prev.map(it =>
        it.id === id || it.productId === id ? { ...it, quantity } : it
      )
    )
  }

  const clearCart = () => {
    setCart([])
    if (isClient) {
      localStorage.removeItem('cart')
    }
  }

  const getTotal = () => {
    return cart.reduce((total, item) => {
      if (item.isBundle) {
        return total + item.price * item.quantity
      }
      const unit = item.isSubscription
        ? Number((item.price * 0.8).toFixed(2))
        : item.price
      return total + unit * item.quantity
    }, 0)
  }

  const getItemCount = () => cart.reduce((n, it) => n + it.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}