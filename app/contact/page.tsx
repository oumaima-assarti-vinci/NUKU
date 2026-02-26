
'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [comment, setComment] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Appelle l'API (stocke en base)
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, comment }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(data?.error ?? "Une erreur est survenue.")
      return
    }

    setName(''); setEmail(''); setComment('')
    alert("Votre message a été envoyé. Merci !")
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-3">Contact Us</h1>

      <div className="mb-10 space-y-3">
        <div>
          <h2 className="font-semibold">Hours of Operation</h2>
          <p className="text-gray-600">9am - 5pm EST Monday through Friday</p>
        </div>
        <div>
          <h2 className="font-semibold">Get in Touch</h2>
          <p className="text-gray-600">hi@trycreate.co</p>
        </div>
        <div>
          <h2 className="font-semibold">PR & Marketing</h2>
          <p className="text-gray-600">press@trycreate.co</p>
        </div>
        <p className="text-gray-600">We try to respond to all messages within 24 hours!</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 border border-gray-200 p-8 rounded-2xl bg-white">
        <div>
          <label className="block font-medium mb-1">Name</label>
          <input
            value={name} onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black outline-none"
            placeholder="Name" required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Email <span className="text-red-500">*</span></label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black outline-none"
            placeholder="Email" required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Comment</label>
          <textarea
            value={comment} onChange={(e) => setComment(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 h-32 focus:ring-2 focus:ring-black outline-none"
            placeholder="Comment" required
          />
        </div>

        <button
          disabled={loading}
          className="w-full py-4 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  )
}
