'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function SuccessPage() {
  const t = useTranslations('success')

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎉 {t('title')}</h1>
          <p className="text-gray-600">{t('subtitle')}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-6 mb-6">
          <p className="text-gray-700 mb-4">{t('body')}</p>
          <p className="text-sm text-gray-600">{t('email_note')}</p>
        </div>
        <Link href="/subscription" className="block w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg transition mb-3">
          {t('view_subscription')}
        </Link>
        <Link href="/home" className="block w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition">
          {t('back_home')}
        </Link>
      </div>
    </div>
  )
}