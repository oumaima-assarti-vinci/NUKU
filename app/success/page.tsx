'use client'

import Link from 'next/link'

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎉 Bienvenue chez Yonko Box !
          </h1>
          <p className="text-gray-600">
            Votre abonnement est confirmé
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-6 mb-6">
          <p className="text-gray-700 mb-4">
            Votre première box sera expédiée dans les 3-5 jours ouvrés.
          </p>
          <p className="text-sm text-gray-600">
            Un email de confirmation vous a été envoyé avec tous les détails.
          </p>
        </div>

        <Link 
          href="/subscription"
          className="block w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg transition mb-3"
        >
          Voir mon abonnement
        </Link>

        <Link 
          href="/home"
          className="block w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}