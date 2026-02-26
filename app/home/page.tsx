"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Product = {
  id: number;
  nom: string;
  images?: string[] | null;
  tagline?: string | null;
  category?: string | null;
  discount_percentage?: number | null;
  actif?: boolean | null;
};

export default function HomePage() {
  const defaultCurrentSlide = 0;
  const [showPopup, setShowPopup] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(defaultCurrentSlide);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Popup + slider auto-rotate
  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");
    if (!hasVisited) {
      setTimeout(() => setShowPopup(true), 3000);
      localStorage.setItem("hasVisited", "true");
    }
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch produits (conservé même si non utilisé directement)
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (!error && data) setProducts(data);
      setLoading(false);
    })();
  }, []);

  const heroSlides = [
    {
      image: "/image/couleur.png",
      title: "Performance optimale.",
      subtitle: "Des ingrédients premium pour des résultats exceptionnels",
      cta: "Voir la boutique",
      link: "/shop",
    },
  ];

  const storyImageSrc = "/image/sourire.jpg";

  const categories = [
    { name: "Sommeil", image: "/image/nukuBleu.png", link: "/product/12" },
    { name: "Relax", image: "/image/NukuViolet.png", link: "/product/10" },
    { name: "Force & endurance", image: "/image/nukuRouge.png", link: "/product/14" },
    { name: "Cheveux", image: "/image/nukuJaune.png", link: "/product/11" },
    { name: "Digestion", image: "/image/nukuVert.png", link: "/product/13" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ================= POPUP ================= */}
      {showPopup && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 sm:p-10 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl sm:text-5xl mb-4 text-center">🎁</div>
            <h3 className="text-2xl sm:text-3xl font-black mb-4 text-center">
              Bienvenue chez NUKU
            </h3>
            <p className="text-neutral-600 mb-6 sm:mb-8 text-center text-base sm:text-lg">
              Profitez de <span className="font-bold text-[#ffb703]">-20%</span> sur votre premier abonnement
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="w-full py-3 sm:py-4 bg-[#ffb703] text-white font-bold rounded-lg hover:bg-[#ffa200] transition-all text-base sm:text-lg"
            >
              Découvrir
            </button>
          </div>
        </div>
      )}

      {/* ================= HERO SLIDER (3 slides) ================= */}
      <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] min-h-[400px] sm:min-h-[520px] h-[calc(100vh-80px)] max-h-[900px] overflow-hidden">
        {/* ---- SLIDE 0 : Abonnement ---- */}
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${
            currentSlide === 0 ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Fond */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(circle at 70% 45%, rgba(255,204,92,0.45) 0%, rgba(255,220,130,0.35) 25%, rgba(255,245,220,0.85) 55%, #fff7e6 75%),
                linear-gradient(90deg, #fff7e6 0%, #fffaf0 40%, #fff7e6 100%)
              `,
            }}
          />
          {/* Cadre subtil */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-6 sm:inset-8 md:inset-12 rounded-[32px] sm:rounded-[48px] shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_60px_120px_rgba(0,0,0,0.05)]" />
          </div>
          {/* Image produit */}
          <img
            src="/image/fille.png"
            alt="Abonnement NUKU"
            className="absolute right-[2vw] lg:right-[4vw] top-1/2 -translate-y-1/2 w-[55vw] max-w-[680px] pointer-events-none drop-shadow-[0_20px_40px_rgba(255,180,60,0.2)] sm:drop-shadow-[0_30px_60px_rgba(255,180,60,0.25)]"
          />
          {/* Texte */}
          <div className="relative z-10 flex items-center h-full">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 w-full">
              <div className="max-w-[520px] pl-6 md:pl-16 lg:pl-24">
                <h1 className="font-serif text-[clamp(36px,7vw,76px)] leading-[1.05] tracking-tight text-[#4e4a66] mb-4 sm:mb-6">
                  Votre routine
                  <br />
                  <span className="text-[#ffb703]">simplifiée.</span>
                </h1>
                <p className="text-base sm:text-lg text-[#6b6780] mb-6 sm:mb-8 leading-relaxed">
                  Livraison offerte chaque mois.
                  <br />-20% sur chaque commande.
                  <br />
                  La tranquillité, sans y penser.
                </p>
                <Link
                  href="/subscription"
                  className="inline-flex bg-[#ffb703] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold uppercase tracking-wide hover:bg-[#ffa200] transition-colors text-sm sm:text-base"
                >
                  Je m'abonne et économise 20%
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ---- SLIDE 1 : Soul (violet) ---- */}
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${
            currentSlide === 1 ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(circle at 72% 48%, rgba(135,85,205,0.50) 0%, rgba(165,130,220,0.38) 20%, rgba(245,240,236,0.90) 46%, #f5f0ec 70%),
                linear-gradient(90deg, #f5f0ec 0%, #fbf9f7 40%, #f5f0ec 100%)
              `,
            }}
          />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-6 sm:inset-12 rounded-[32px] sm:rounded-[48px] shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_60px_120px_rgba(0,0,0,0.04)]" />
          </div>

          {/* Produit */}
          <div className="absolute right-[5%] sm:right-[8%] md:right-[10%] top-[50%] sm:top-[46%] -translate-y-1/2 w-[30vw] sm:w-[22vw] md:w-[18vw] max-w-[280px]">
            <img
              src="/image/violet.png"
              alt="NUKU Soul"
              className="w-full h-auto drop-shadow-[0_20px_40px_rgba(120,90,180,0.2)] sm:drop-shadow-[0_30px_60px_rgba(120,90,180,0.25)]"
            />
          </div>

          {/* Texte */}
          <div className="relative z-10 flex items-center h-full">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 w-full">
              <div className="max-w-[520px] pl-6 md:pl-16 lg:pl-24">
                <h1 className="font-serif text-[clamp(34px,8vw,76px)] leading-[1.05] tracking-[-0.02em] text-[#4e4a66] mb-6">
                  Esprit <span className="text-[#b7a6d8]">apaisé</span>,
                  <br />
                  mieux-être.
                </h1>
                <p className="font-sans text-[clamp(15px,3.5vw,18px)] leading-[1.7] text-[#6b6780] mb-8">
                  Pour soulager le stress et clarifier l'esprit,
                  <br className="hidden sm:block" />
                  avec nos gummies à l'Ashwagandha.
                </p>
                <Link
                  href="/product/1"
                  className="inline-flex bg-[#ff7a3d] text-white px-8 py-4 rounded-full text-sm font-sans font-semibold tracking-wide uppercase hover:bg-[#ff6624] transition-colors"
                >
                  Découvrir Soul
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ---- SLIDE 2 : Couleurs (map heroSlides) ---- */}
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentSlide === index + 2 ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Background */}
            <div
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(1400px 900px at 78% 42%, rgba(47,96,201,0.75) 0%, rgba(47,96,201,0) 60%),
                  radial-gradient(1400px 900px at 82% 42%, rgba(247,191,13,0.78) 0%, rgba(247,191,13,0) 60%),
                  radial-gradient(1400px 900px at 86% 42%, rgba(227,59,47,0.78) 0%, rgba(227,59,47,0) 60%),
                  radial-gradient(1400px 900px at 90% 42%, rgba(44,175,95,0.76) 0%, rgba(44,175,95,0) 60%),
                  radial-gradient(1400px 900px at 94% 42%, rgba(107,63,178,0.80) 0%, rgba(107,63,178,0) 60%),
                  linear-gradient(to left, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.05) 35%, rgba(255,255,255,0.90) 62%, rgba(255,255,255,1) 100%)
                `,
              }}
            />
            {/* Plancher blanc doux */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `
                  radial-gradient(1200px 420px at 50% 102%, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.85) 45%, rgba(255,255,255,0) 70%)
                `,
              }}
            />

            {/* Contenu */}
            <div className="relative z-10 h-full">
              <div className="max-w-[1400px] mx-auto h-full grid md:grid-cols-2 items-center px-6 gap-6">
                {/* Texte gauche */}
                <div className="max-w-xl text-neutral-900">
                  <h1 className="text-[clamp(36px,6vw,76px)] font-black mb-6 leading-tight drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">
                    {slide.title}
                  </h1>
                  <p className="text-[clamp(15px,3vw,20px)] mb-8 font-normal text-neutral-700">
                    {slide.subtitle}
                  </p>
                  <Link
                    href={slide.link}
                    className="inline-block px-8 py-4 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-all shadow-xl"
                  >
                    {slide.cta.toUpperCase()}
                  </Link>
                </div>

                {/* Image droite */}
                <div className="relative flex justify-end items-end">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="
                      pointer-events-none select-none
                      h-[58vh] sm:h-[66vh] md:h-[74vh] lg:h-[82vh] xl:h-[88vh] w-auto
                      object-contain
                      drop-shadow-[0_18px_36px_rgba(0,0,0,0.18)]
                      ml-auto
                      translate-x-[12%] md:translate-x-[18%] lg:translate-x-[22%]
                      brightness-[1.05] contrast-[1.10] saturate-[1.15]
                    "
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Indicateurs */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-10">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1 rounded-full transition-all ${
                currentSlide === i ? "w-8 sm:w-12 bg-white" : "w-6 sm:w-8 bg-white/50"
              }`}
              aria-label={`Aller au slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ================= LOGO ================= */}
      <section className="py-6 sm:py-10 bg-white">
        <div className="flex flex-col items-center gap-4 sm:gap-6">
          <img src="/image/logo.png" alt="NUKU" className="h-16 sm:h-20 md:h-24 opacity-90" />
        </div>
      </section>

      {/* ================= IMAGE + TEXTE ================= */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-[#f5f0ec]">
        <div className="max-w-[1500px] mx-auto grid md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
          <div className="order-2 md:order-1">
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg">
              <img src={storyImageSrc} alt="NUKU – bien-être" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <h4 className="font-serif text-[clamp(28px,6vw,42px)] leading-[1.1] tracking-tight text-neutral-900 mb-6">
              Chez NUKU, l'équilibre avant tout.
            </h4>
            <p className="font-sans text-[15px] sm:text-[17px] leading-[1.8] text-neutral-700 max-w-[560px]">
              Nous savons que le bien-être ne se résume pas à une solution miracle. Chaque corps est
              différent, chaque rythme aussi.
            </p>
            <p className="font-sans text-[15px] sm:text-[17px] leading-[1.8] text-neutral-700 max-w-[560px]">
              C'est pourquoi NUKU a été pensé pour s'intégrer simplement dans le quotidien,
              avec des formules claires, des ingrédients sélectionnés avec soin, et une approche honnête du bien-être.
            </p>
            <p className="font-sans text-[15px] sm:text-[17px] leading-[1.8] text-neutral-700 max-w-[560px]">
              Pas de promesses excessives. Juste des compléments conçus pour accompagner l'équilibre,
              jour après jour.
            </p>
            <Link
              href="/shop"
              className="hidden md:inline-flex h-11 items-center rounded-full px-5 font-extrabold text-white bg-orange-600 hover:bg-orange-700 transition-colors"
            >
              DÉCOUVRIR NUKU
            </Link>
          </div>
        </div>
      </section>

   {/* ============ PICTOGRAMMES — W SHAPE ============ */}
{/* ============ PICTOGRAMMES — W SHAPE ============ */}
<section className="py-10 sm:py-12 px-4 sm:px-6 bg-white">
  <div className="max-w-[1400px] mx-auto flex flex-col items-center gap-0">
    {/* LIGNE 1 */}
    <div className="flex justify-center items-center gap-8 sm:gap-16 lg:gap-40 flex-nowrap">
      {["/image/vegan.png", "/image/lieu.png", "/image/ogm.png"].map((src, idx) => (
        <img
          key={idx}
          src={src}
          alt=""
          className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-44 lg:h-44 object-contain opacity-90"
        />
      ))}
    </div>
    {/* LIGNE 2 */}
    <div className="flex justify-center gap-8 sm:gap-16 lg:gap-40 flex-nowrap -mt-2 sm:-mt-4 lg:-mt-8">
      {["/image/colorant.png", "/image/sucre.png"].map((src, idx) => (
        <img
          key={idx}
          src={src}
          alt=""
          className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-44 lg:h-44 object-contain opacity-90"
        />
      ))}
    </div>
  </div>
</section>
      {/* ================= CATÉGORIES ================= */}
<section className="pt-0 pb-16 sm:pb-20 md:pb-24 px-2 sm:px-6 bg-white">
  <div className="max-w-[1400px] mx-auto">
    <h2 className="text-center font-serif text-[clamp(30px,6vw,56px)] leading-[1.1] tracking-tight text-neutral-900 mb-8 sm:mb-12">
      De quoi avez-vous besoin ?
    </h2>
    <div className="flex flex-nowrap justify-center items-center gap-1 sm:gap-2 md:gap-4 overflow-hidden">
      {categories.map((category, index) => (
        <Link
          key={index}
          href={category.link}
          className="group flex flex-row items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-3 bg-white rounded-full shadow-md hover:shadow-xl transition-all hover:scale-105 flex-shrink-0"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full bg-neutral-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img
              src={category.image}
              alt={category.name}
              className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=200&fit=crop";
              }}
            />
          </div>
          <span className="font-sans text-[9px] sm:text-[11px] md:text-sm lg:text-base font-semibold text-neutral-900 whitespace-nowrap">
            {category.name}
          </span>
        </Link>
      ))}
    </div>
  </div>
</section>
      {/* ================= 2 PHOTOS ================= */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-10">
            {/* PHOTO 1 */}
            <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 h-[500px] sm:h-[600px] md:h-[700px]">
              <img
                src="/image/lifestyle1.jpeg"
                alt="NUKU Lifestyle"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&fit=crop";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-10 md:p-12 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white mb-3 sm:mb-4 drop-shadow-2xl">
                  Routine bien-être
                </h3>
                <p className="font-sans text-base sm:text-lg md:text-xl text-white/95 drop-shadow-lg">
                  Découvrez nos compléments pour votre quotidien
                </p>
              </div>
            </div>

            {/* PHOTO 2 */}
            <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 h-[500px] sm:h-[600px] md:h-[700px]">
              <img
                src="/image/lifestyle2.jpeg"
                alt="NUKU Qualité"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1505751104628-0147a2a26aa5?w=800&fit=crop";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-10 md:p-12 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white mb-3 sm:mb-4 drop-shadow-2xl">
                  Ingrédients naturels
                </h3>
                <p className="font-sans text-base sm:text-lg md:text-xl text-white/95 drop-shadow-lg">
                  Des formules pensées pour votre santé
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= AVIS CLIENTS ================= */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-white to-[#f5f0ec] overflow-hidden">
        <div className="max-w-[1400px] mx-auto">
          {/* TITRE */}
          <div className="px-4 sm:px-6 mb-8 sm:mb-12">
            <h3 className="font-serif text-[clamp(32px,5.5vw,48px)] leading-tight tracking-tight text-neutral-900 mb-4">
              Ils en parlent mieux que nous
            </h3>
            <p className="font-sans text-[15px] sm:text-[17px] text-neutral-600 max-w-[600px]">
              Des témoignages authentiques de notre communauté
            </p>
          </div>

          {/* CARROUSEL SCROLLABLE */}
          <div className="relative">
            <div
              className="flex gap-6 overflow-x-auto px-4 sm:px-6 pb-6 snap-x snap-mandatory"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#d1d5db transparent",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {[
                {
                  name: "Claire D.",
                  initials: "CD",
                  verified: true,
                  title: "Simple et efficace",
                  text: "J'ai intégré NUKU à ma routine depuis un mois et je sens une vraie différence. Simple et agréable à prendre.",
                  color: "bg-[#ffb703]",
                },
                {
                  name: "Thomas R.",
                  initials: "TR",
                  verified: true,
                  title: "Produits de qualité",
                  text: "Composition clean, exactement ce que je recherchais. Je recommande sans hésiter.",
                  color: "bg-[#b7a6d8]",
                },
                {
                  name: "Sophie L.",
                  initials: "SL",
                  verified: true,
                  title: "J'adore l'univers",
                  text: "Une approche douce et honnête du bien-être. L'univers de la marque est vraiment inspirant.",
                  color: "bg-[#ff8844]",
                },
                {
                  name: "Amélie V.",
                  initials: "AV",
                  verified: true,
                  title: "Routine quotidienne",
                  text: "Les gummies sont bons et faciles à intégrer au quotidien. Mention spéciale pour le sans sucre ajouté.",
                  color: "bg-[#ffb703]",
                },
                {
                  name: "Julien M.",
                  initials: "JM",
                  verified: true,
                  title: "Très bonne surprise",
                  text: "Packaging soigné et résultats progressifs mais réels. Une marque qui tient ses promesses.",
                  color: "bg-[#b7a6d8]",
                },
                {
                  name: "Laura P.",
                  initials: "LP",
                  verified: true,
                  title: "Transparence et efficacité",
                  text: "Enfin une marque qui allie simplicité, transparence et efficacité. Je ne peux plus m'en passer.",
                  color: "bg-[#ff8844]",
                },
              ].map((review, index) => (
                <div key={index} className="flex-none w-[280px] sm:w-[320px] snap-start">
                  <div className="bg-white rounded-2xl sm:rounded-3xl p-6 h-full shadow-sm hover:shadow-xl transition-all duration-300 border border-neutral-100">
                    {/* HEADER */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`${review.color} w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                        {review.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-neutral-900 text-sm truncate">
                            {review.name}
                          </p>
                          {review.verified && (
                            <span className="text-green-600 text-xs flex-shrink-0">✓</span>
                          )}
                        </div>
                        {review.verified && (
                          <p className="text-xs text-neutral-500">Acheteur vérifié</p>
                        )}
                      </div>
                    </div>

                    {/* ÉTOILES */}
                    <div className="flex gap-0.5 mb-3 text-[#ffb703]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>

                    {/* TITRE AVIS */}
                    <h4 className="font-semibold text-neutral-900 text-base mb-2">
                      {review.title}
                    </h4>

                    {/* TEXTE */}
                    <p className="text-sm text-neutral-700 leading-relaxed font-light">
                      "{review.text}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12 sm:mt-16 px-4 sm:px-6">
            <p className="text-sm sm:text-base text-neutral-600 mb-6">
              Rejoignez notre communauté et partagez votre expérience
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-[#ff8844] text-white px-8 py-4 rounded-full font-bold uppercase tracking-wide hover:bg-[#ff7733] transition-all shadow-lg text-sm sm:text-base"
            >
              Découvrir NUKU
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}