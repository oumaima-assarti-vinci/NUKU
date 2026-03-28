'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function SignupPage() {
  const router = useRouter()
  const t = useTranslations('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { alert('Erreur : ' + error.message); setLoading(false); return }
    alert(t('success'))
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow space-y-6">
        <h2 className="text-3xl font-bold text-center">{t('title')}</h2>
        <div className="space-y-4">
          <input type="email" placeholder={t('email')} className="w-full px-4 py-3 border rounded-md" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder={t('password')} className="w-full px-4 py-3 border rounded-md" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleSignup} disabled={loading} className="w-full bg-black text-white py-3 rounded-md">
            {loading ? t('loading') : t('submit')}
          </button>
          <p className="text-center text-sm text-gray-600">
            {t('has_account')}{' '}
            <Link href="/login" className="text-black font-semibold">{t('login')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}