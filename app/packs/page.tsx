'use client'

import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PacksPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
    } else {
      setUser(user)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/home')
  }

  const packs = [
    {
      id: 1,
      name: "Pack Énergie",
      price: 100,
      image: "https://images.unsplash.com/photo-1556228852-80c63843f03c?w=400&h=400&fit=crop",
      features: ["Vitamine C 1000mg", "Magnésium", "Coenzyme Q10", "Ginseng", "Guarana"],
      badge: "⚡ Boost d'énergie"
    },
    {
      id: 2,
      name: "Pack Immunité",
      price: 100,
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop",
      features: ["Vitamine D3", "Zinc", "Échinacée", "Propolis", "Vitamine C"],
      badge: "🛡️ Protection"
    },
    {
      id: 3,
      name: "Pack Sommeil",
      price: 100,
      image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=400&fit=crop",
      features: ["Mélatonine", "Magnésium", "Valériane", "Passiflore", "L-Théanine"],
      badge: "😴 Repos"
    },
    {
      id: 4,
      name: "Pack Sport",
      price: 100,
      image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop",
      features: ["Protéines Whey", "BCAA", "Créatine", "Glutamine", "Oméga-3"],
      badge: "💪 Performance"
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/home" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">Y</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Yonko Nutrition
            </h1>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/home" className="text-gray-600 hover:text-emerald-600 font-medium">Accueil</Link>
            <Link href="/packs" className="text-emerald-600 font-semibold">Nos Packs</Link>
            <Link href="/products" className="text-gray-600 hover:text-emerald-600 font-medium">Abonnement</Link>
            <div className="flex items-center gap-4 ml-4 pl-4 border-l">
              <span className="text-gray-600 text-sm">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-extrabold mb-6 text-gray-900">
            Nos Packs Mensuels
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choisissez le pack adapté à vos objectifs de santé et bien-être
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {packs.map((pack) => (
            <div key={pack.id} className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all hover:scale-105">
              <div className="relative">
                <img src={pack.image} alt={pack.name} className="w-full h-48 object-cover"/>
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold">
                    {pack.badge}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">{pack.name}</h3>
                <p className="text-3xl font-black text-emerald-600 mb-4">{pack.price}€<span className="text-lg text-gray-500 font-normal">/mois</span></p>

                <ul className="space-y-2 mb-6">
                  {pack.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-emerald-600">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/products"
                  className="block w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-center rounded-xl hover:shadow-lg transition"
                >
                  S'abonner
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}