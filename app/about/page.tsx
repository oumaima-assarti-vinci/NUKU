
export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-14">
      <h1 className="text-4xl font-bold mb-6">About us</h1>
      <p className="text-gray-600 text-lg mb-10">
        Chez Yonko, nous créons des compléments simples, efficaces et bio pour vous aider à
        mieux dormir, mieux récupérer et vivre à 100%. Fabriqué en 🇧🇪, testé en labo, sans compromis.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 border rounded-2xl">
          <h3 className="font-semibold mb-2">Notre mission</h3>
          <p className="text-gray-600 text-sm">Rendre la nutrition santé accessible, claire et agréable.</p>
        </div>
        <div className="p-6 border rounded-2xl">
          <h3 className="font-semibold mb-2">Nos valeurs</h3>
          <p className="text-gray-600 text-sm">Transparence, qualité, régularité et respect de l’environnement.</p>
        </div>
        <div className="p-6 border rounded-2xl">
          <h3 className="font-semibold mb-2">Made in BE</h3>
          <p className="text-gray-600 text-sm">Fabrication locale selon les normes les plus strictes.</p>
        </div>
      </div>

      <div className="rounded-3xl overflow-hidden border">
        <img
          src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=500&fit=crop"
          alt="Workshop"
          className="w-full h-[260px] md:h-[360px] object-cover"
        />
      </div>
    </div>
  )
}
