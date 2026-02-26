
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      alert('Erreur : ' + error.message)
      setLoading(false)
      return
    }

    alert('Compte créé ! Vérifie ton email pour confirmer.')
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow space-y-6">

        <h2 className="text-3xl font-bold text-center">Créer un compte</h2>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Adresse email"
            className="w-full px-4 py-3 border rounded-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full px-4 py-3 border rounded-md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-md"
          >
            {loading ? 'Création...' : 'Créer un compte'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-black font-semibold">
              Se connecter
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
