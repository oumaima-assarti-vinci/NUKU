'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

export default function ContactPage() {
  const t = useTranslations('contact')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [comment, setComment] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, comment }),
    })
    setLoading(false)
    if (!res.ok) { const data = await res.json().catch(() => ({})); alert(data?.error ?? "Une erreur est survenue."); return }
    setName(''); setEmail(''); setComment(''); setSent(true)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-16 sm:py-24">
        <h1 className="text-[clamp(32px,5vw,52px)] font-bold tracking-[-0.02em] text-neutral-950 mb-3">{t('title')}</h1>
        <p className="text-neutral-500 text-base mb-12 leading-relaxed">{t('subtitle')}</p>
        <div className="flex flex-col sm:flex-row gap-6 mb-12">
          <div className="flex-1 bg-neutral-50 rounded-2xl px-6 py-5">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1">{t('email_label')}</p>
            <a href="mailto:contact@nuku.be" className="text-[#E8860A] font-semibold text-sm hover:underline">contact@nuku.be</a>
          </div>
          <div className="flex-1 bg-neutral-50 rounded-2xl px-6 py-5">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1">{t('availability_label')}</p>
            <p className="text-neutral-700 font-semibold text-sm">{t('availability')}</p>
          </div>
        </div>
        {sent ? (
          <div className="border border-green-200 bg-green-50 rounded-2xl p-10 text-center">
            <div className="text-4xl mb-4">✉️</div>
            <h2 className="text-xl font-bold text-neutral-900 mb-2">{t('success_title')}</h2>
            <p className="text-neutral-600 text-sm mb-6">{t('success_body')}</p>
            <button onClick={() => setSent(false)} className="text-sm font-semibold text-[#E8860A] underline underline-offset-4">{t('send_another')}</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 border border-neutral-200 p-8 rounded-2xl bg-white">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">{t('name')} <span className="text-red-500">*</span></label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-neutral-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#E8860A] focus:border-[#E8860A] outline-none transition" placeholder={t('placeholder_name')} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">{t('email')} <span className="text-red-500">*</span></label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-neutral-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#E8860A] focus:border-[#E8860A] outline-none transition" placeholder={t('placeholder_email')} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">{t('message')} <span className="text-red-500">*</span></label>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full border border-neutral-300 rounded-xl px-4 py-3 h-36 text-sm focus:ring-2 focus:ring-[#E8860A] focus:border-[#E8860A] outline-none transition resize-none" placeholder={t('placeholder_message')} required />
            </div>
            <button type="submit" disabled={loading} className="w-full py-4 bg-neutral-950 text-white font-bold rounded-xl hover:bg-neutral-800 transition text-sm uppercase tracking-wider disabled:opacity-60">
              {loading ? t('loading') : t('submit')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}