
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    handleCallback()
  }, [])

  const handleCallback = async () => {
    // Vérifier la session
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
      router.push('/home')
      return
    }

    const user = session.user

    // Récupérer le rôle dans Supabase
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    // Redirection selon rôle
    if (roleData?.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/home')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Connexion en cours...</p>
      </div>
    </div>
  )
}
