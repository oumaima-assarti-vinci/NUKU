
'use client'

import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

 

const checkUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (roleData?.role === 'admin') {
    router.push('/admin')
  } else {
    router.push('/home')
  }
}
 
const handleEmailLogin = async () => {
  setLoading(true)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    alert("Erreur : " + error.message)
    setLoading(false)
    return
  }

  // Récupérer le rôle dans user_roles
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', data.user.id)
    .single()

  if (roleData?.role === 'admin') {
    router.push('/admin')
  } else {
    router.push('/home')
  }
}


  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      alert('Erreur de connexion : ' + error.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Yonko - Connexion
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Connectez-vous pour continuer
          </p>
        </div>

        {/* ➤ FORMULAIRE EMAIL + MOT DE PASSE */}
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
            onClick={handleEmailLogin}
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-md"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          {/* ➤ LIEN VERS /signup */}
          <p className="text-center text-sm text-gray-600">
            Pas de compte ?{' '}
            <Link href="/signup" className="text-black font-semibold">
              Créer un compte
            </Link>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px bg-gray-300 flex-1"></div>
          <span>ou</span>
          <div className="h-px bg-gray-300 flex-1"></div>
        </div>

        {/* ➤ BOUTON GOOGLE */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 transition"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-gray-700 font-medium">
            Se connecter avec Google
          </span>
        </button>

      </div>
    </div>
  )
}
