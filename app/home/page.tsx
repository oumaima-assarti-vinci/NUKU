"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  const [showPopup, setShowPopup] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Swipe / drag
  const touchStartX = useRef<number | null>(null);
  const mouseStartX = useRef<number | null>(null);
  const isDragging = useRef(false);

  const goNext = () => setCurrentSlide((prev) => (prev + 1) % 3);
  const goPrev = () => setCurrentSlide((prev) => (prev + 2) % 3);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
    touchStartX.current = null;
  };
  const handleMouseDown = (e: React.MouseEvent) => {
    mouseStartX.current = e.clientX;
    isDragging.current = true;
  };
  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current || mouseStartX.current === null) return;
    const diff = mouseStartX.current - e.clientX;
    if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
    mouseStartX.current = null;
    isDragging.current = false;
  };
  const handleMouseLeave = () => {
    isDragging.current = false;
    mouseStartX.current = null;
  };

  useEffect(() => {
    const hasVisited: string | null = localStorage.getItem("hasVisited");
    if (!hasVisited) {
      setTimeout(() => setShowPopup(true), 3000);
      localStorage.setItem("hasVisited", "true");
    }
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (!error && data) setProducts(data as Product[]);
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
    { name: "Relax", image: "/image/nukuViolet.png", link: "/product/10" },
    { name: "Force & endurance", image: "/image/nukuRouge.png", link: "/product/14" },
    { name: "Cheveux", image: "/image/nukuJaune.png", link: "/product/11" },
    { name: "Digestion", image: "/image/nukuVert.png", link: "/product/13" },
  ];

  const lifestylePhotos = [
    { src: "/image/lifestyle1.jpeg", label: "Routine bien-être", sub: "Compléments pour votre quotidien" },
    { src: "/image/lifestyle2.jpeg", label: "Ingrédients naturels", sub: "Formules pensées pour votre santé" },
    { src: "/image/lifestyle1.jpeg", label: "Performance & énergie", sub: "Boostez vos journées naturellement" },
    { src: "/image/lifestyle2.jpeg", label: "Sommeil profond", sub: "Retrouvez un repos réparateur" },
    { src: "/image/lifestyle1.jpeg", label: "Équilibre au quotidien", sub: "Une routine simple et efficace" },
    { src: "/image/lifestyle2.jpeg", label: "Beauté naturelle", sub: "Prenez soin de vous de l'intérieur" },
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
            <h3 className="text-2xl sm:text-3xl font-black mb-4 text-center tracking-tight">
              Bienvenue chez NUKU
            </h3>
            <p className="text-neutral-600 mb-6 sm:mb-8 text-center text-base sm:text-lg">
              Profitez de <span className="font-black text-[#ffb703]">-20%</span> sur votre premier abonnement
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="w-full py-3 sm:py-4 bg-[#ffb703] text-white font-black rounded-full hover:bg-[#ffa200] transition-all text-base sm:text-lg tracking-wide uppercase"
            >
              Découvrir
            </button>
          </div>
        </div>
      )}

      {/* ================= HERO SLIDER ================= */}
      <section
        className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden cursor-grab active:cursor-grabbing select-none"
        style={{ height: "calc(100dvh - 80px)", minHeight: "480px", maxHeight: "900px" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* SLIDE 0 — Abonnement */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === 0 ? "opacity-100" : "opacity-0"}`}>
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(circle at 70% 45%, rgba(255,204,92,0.45) 0%, rgba(255,220,130,0.35) 25%, rgba(255,245,220,0.85) 55%, #fff7e6 75%)` }}
          />
          <img
            src="/image/fille.png"
            alt="Abonnement NUKU"
            className="absolute right-0 sm:right-[2vw] lg:right-[4vw] top-1/2 -translate-y-1/2 w-[70vw] sm:w-[55vw] max-w-[680px] pointer-events-none drop-shadow-[0_20px_40px_rgba(255,180,60,0.2)] opacity-30 sm:opacity-100"
          />
          <div className="relative z-10 flex items-center h-full">
            <div className="max-w-[1400px] mx-auto px-5 sm:px-6 w-full">
              <div className="max-w-[520px] sm:pl-6 md:pl-16 lg:pl-24">
                <h1 className="font-black text-[clamp(38px,7vw,76px)] leading-[1.0] tracking-[-0.03em] text-[#4e4a66] mb-3 sm:mb-6">
                  Votre routine<br />
                  <span className="text-[#ffb703]">simplifiée.</span>
                </h1>
                <p className="sm:hidden text-sm text-[#6b6780] mb-5 font-light leading-relaxed">
                  -20% sur chaque commande.<br />Livraison offerte chaque mois.
                </p>
                <p className="hidden sm:block text-lg text-[#6b6780] mb-8 leading-relaxed font-light">
                  Livraison offerte chaque mois.<br />-20% sur chaque commande.<br />La tranquillité, sans y penser.
                </p>
                <Link href="/subscription" className="inline-flex bg-[#ffb703] text-white px-5 sm:px-8 py-3 sm:py-4 rounded-full font-black uppercase tracking-wide hover:bg-[#ffa200] transition-colors text-xs sm:text-base">
                  Je m'abonne — 20% off
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 1 — Soul */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === 1 ? "opacity-100" : "opacity-0"}`}>
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(circle at 72% 48%, rgba(135,85,205,0.50) 0%, rgba(165,130,220,0.38) 20%, rgba(245,240,236,0.90) 46%, #f5f0ec 70%)` }}
          />
          <div className="absolute right-[4%] sm:right-[8%] md:right-[10%] top-1/2 -translate-y-1/2 w-[38vw] sm:w-[22vw] md:w-[18vw] max-w-[280px]">
            <img src="/image/violet.png" alt="NUKU Soul" className="w-full h-auto drop-shadow-[0_20px_40px_rgba(120,90,180,0.2)]" />
          </div>
          <div className="relative z-10 flex items-center sm:items-center h-full">
            <div className="max-w-[1400px] mx-auto px-5 sm:px-6 md:px-8 w-full">
              <div className="max-w-[520px] sm:pl-6 md:pl-16 lg:pl-24">
                <h1 className="font-black text-[clamp(38px,8vw,76px)] leading-[1.0] tracking-[-0.03em] text-[#4e4a66] mb-3 sm:mb-6">
                  Esprit <span className="text-[#b7a6d8]">apaisé</span>,<br />mieux-être.
                </h1>
                <p className="sm:hidden text-sm text-[#6b6780] mb-5 font-light">
                  Gummies à l'Ashwagandha.
                </p>
                <p className="hidden sm:block text-[clamp(15px,3.5vw,18px)] leading-[1.7] text-[#6b6780] mb-8 font-light">
                  Pour soulager le stress et clarifier l'esprit,<br />avec nos gummies à l'Ashwagandha.
                </p>
                <Link href="/product/1" className="inline-flex bg-[#ff7a3d] text-white px-5 sm:px-8 py-3 sm:py-4 rounded-full text-xs sm:text-sm font-black tracking-wide uppercase hover:bg-[#ff6624] transition-colors">
                  Découvrir Soul
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 2 — Performance */}
        {heroSlides.map((slide, index) => (
          <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === index + 2 ? "opacity-100" : "opacity-0"}`}>
            <div
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(1400px 900px at 78% 42%, rgba(47,96,201,0.75) 0%, rgba(47,96,201,0) 60%),
                  radial-gradient(1400px 900px at 82% 42%, rgba(247,191,13,0.78) 0%, rgba(247,191,13,0) 60%),
                  radial-gradient(1400px 900px at 86% 42%, rgba(227,59,47,0.78) 0%, rgba(227,59,47,0) 60%),
                  radial-gradient(1400px 900px at 90% 42%, rgba(44,175,95,0.76) 0%, rgba(44,175,95,0) 60%),
                  radial-gradient(1400px 900px at 94% 42%, rgba(107,63,178,0.80) 0%, rgba(107,63,178,0) 60%),
                  linear-gradient(to left, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.90) 62%, rgba(255,255,255,1) 100%)
                `
              }}
            />
            <div className="relative z-10 h-full">
              <div className="max-w-[1400px] mx-auto h-full grid md:grid-cols-2 items-center px-6 gap-6">
                <div className="max-w-xl text-neutral-900">
                  <h1 className="text-[clamp(36px,6vw,76px)] font-black mb-6 leading-[1.0] tracking-[-0.03em]">
                    {slide.title}
                  </h1>
                  <p className="text-[clamp(15px,3vw,20px)] mb-8 font-light text-neutral-700">
                    {slide.subtitle}
                  </p>
                  <Link href={slide.link} className="inline-block px-8 py-4 bg-orange-500 text-white font-black rounded-full hover:bg-orange-600 transition-all uppercase tracking-wide text-sm">
                    {slide.cta}
                  </Link>
                </div>
                <div className="relative flex justify-end items-end">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="pointer-events-none select-none h-[58vh] sm:h-[66vh] md:h-[74vh] lg:h-[82vh] w-auto object-contain drop-shadow-[0_18px_36px_rgba(0,0,0,0.18)] ml-auto translate-x-[12%] md:translate-x-[18%] brightness-[1.05] contrast-[1.10] saturate-[1.15]"
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
              className={`h-1 rounded-full transition-all ${currentSlide === i ? "w-8 sm:w-12 bg-white" : "w-6 sm:w-8 bg-white/50"}`}
              aria-label={`Aller au slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ================= LOGO ================= */}
      <section className="py-6 sm:py-10 bg-white">
        <div className="flex flex-col items-center">
          <img src="/image/logo.png" alt="NUKU" className="h-16 sm:h-20 md:h-24 opacity-90" />
        </div>
      </section>

      {/* ================= IMAGE + TEXTE ================= */}
      <section className="py-10 sm:py-16 md:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-[1500px] mx-auto grid md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
          <div className="order-2 md:order-1">
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg">
              <img src={storyImageSrc} alt="NUKU – bien-être" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="order-1 md:order-2 space-y-4">
            <h4 className="font-black text-[clamp(26px,6vw,42px)] leading-[1.05] tracking-[-0.03em] text-neutral-900">
              Chez NUKU, l'équilibre avant tout.
            </h4>
            <p className="text-[15px] sm:text-[17px] leading-[1.8] text-neutral-600 max-w-[560px] font-light">
              Nous savons que le bien-être ne se résume pas à une solution miracle. Chaque corps est différent, chaque rythme aussi.
            </p>
            <p className="text-[15px] sm:text-[17px] leading-[1.8] text-neutral-600 max-w-[560px] font-light">
              C'est pourquoi NUKU a été pensé pour s'intégrer simplement dans le quotidien, avec des formules claires, des ingrédients sélectionnés avec soin, et une approche honnête du bien-être.
            </p>
            <p className="text-[15px] sm:text-[17px] leading-[1.8] text-neutral-600 max-w-[560px] font-light">
              Pas de promesses excessives. Juste des compléments conçus pour accompagner l'équilibre, jour après jour.
            </p>
            <Link href="/shop" className="hidden md:inline-flex h-11 items-center rounded-full px-6 font-black text-white bg-orange-600 hover:bg-orange-700 transition-colors uppercase tracking-wide text-sm">
              Découvrir NUKU
            </Link>
          </div>
        </div>
      </section>

      {/* ================= PICTOGRAMMES ================= */}
      <section className="py-6 sm:py-10 px-4 sm:px-6 bg-white">
        <div className="max-w-[1400px] mx-auto">
          {/* MOBILE : une seule ligne, 5 icônes sans scroll */}
          <div className="flex sm:hidden justify-between items-center w-full">
            {[
              { src: "/image/vegan.png", label: "Vegan" },
              { src: "/image/lieu.png", label: "Belgique" },
              { src: "/image/ogm.png", label: "Sans OGM" },
              { src: "/image/colorant.png", label: "Sans colorant" },
              { src: "/image/sucre.png", label: "Sans sucre" },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                <img src={item.src} alt={item.label} className="w-12 h-12 object-contain opacity-90" />
                <span className="text-[9px] text-neutral-500 text-center leading-tight font-medium">{item.label}</span>
              </div>
            ))}
          </div>
          {/* DESKTOP : W shape */}
          <div className="hidden sm:flex flex-col items-center">
            <div className="flex justify-center items-center gap-8 sm:gap-16 lg:gap-40">
              {["/image/vegan.png", "/image/lieu.png", "/image/ogm.png"].map((src, idx) => (
                <img key={idx} src={src} alt="" className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-44 lg:h-44 object-contain opacity-90" />
              ))}
            </div>
            <div className="flex justify-center gap-8 sm:gap-16 lg:gap-40 -mt-4 lg:-mt-8">
              {["/image/colorant.png", "/image/sucre.png"].map((src, idx) => (
                <img key={idx} src={src} alt="" className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-44 lg:h-44 object-contain opacity-90" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= CATÉGORIES ================= */}
      <section className="pt-2 pb-10 sm:pb-16 md:pb-20 px-2 sm:px-6 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="text-center font-black text-[clamp(26px,6vw,52px)] leading-[1.05] tracking-[-0.03em] text-neutral-900 mb-6 sm:mb-10">
            De quoi avez-vous besoin ?
          </h2>
          {/* MOBILE : scroll horizontal */}
          <div className="flex sm:hidden gap-3 overflow-x-auto pb-3 snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
            {categories.map((category, index) => (
              <Link key={index} href={category.link} className="flex-none snap-start flex flex-col items-center gap-2 bg-white rounded-2xl shadow-md p-3 w-[100px]">
                <div className="w-14 h-14 rounded-full bg-neutral-50 flex items-center justify-center overflow-hidden">
                  <img src={category.image} alt={category.name} className="w-12 h-12 object-contain" />
                </div>
                <span className="text-[11px] font-bold text-neutral-900 text-center leading-tight">{category.name}</span>
              </Link>
            ))}
          </div>
          {/* DESKTOP : ligne fixe */}
          <div className="hidden sm:flex flex-nowrap justify-center items-center gap-2 md:gap-4">
            {categories.map((category, index) => (
              <Link key={index} href={category.link} className="group flex flex-row items-center gap-2 px-3 py-3 bg-white rounded-full shadow-md hover:shadow-xl transition-all hover:scale-105 flex-shrink-0">
                <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full bg-neutral-50 flex items-center justify-center overflow-hidden">
                  <img src={category.image} alt={category.name} className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 object-contain" />
                </div>
                <span className="text-[11px] md:text-sm lg:text-base font-black text-neutral-900 whitespace-nowrap tracking-tight">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 6 PHOTOS ================= */}
      <section className="py-8 sm:py-16 md:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {lifestylePhotos.map((photo, index) => (
              <div key={index} className="group relative overflow-hidden rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 h-[180px] sm:h-[280px] md:h-[380px]">
                <img
                  src={photo.src}
                  alt={photo.label}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 md:p-7 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="font-black text-base sm:text-xl md:text-2xl text-white mb-1 tracking-tight">
                    {photo.label}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/90 font-light hidden sm:block">
                    {photo.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= AVIS CLIENTS ================= */}
      <section className="py-10 sm:py-16 md:py-20 bg-white overflow-hidden">
        <div className="max-w-[1400px] mx-auto">
          <div className="px-4 sm:px-6 mb-6 sm:mb-10">
            <h3 className="font-black text-[clamp(28px,5.5vw,48px)] leading-[1.05] tracking-[-0.03em] text-neutral-900 mb-2">
              Ils en parlent mieux que nous
            </h3>
            <p className="text-[14px] sm:text-[16px] text-neutral-500 max-w-[600px] font-light">
              Des témoignages authentiques de notre communauté
            </p>
          </div>
          <div
            className="flex gap-4 overflow-x-auto px-4 sm:px-6 pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
          >
            {[
              { name: "Claire D.", initials: "CD", verified: true, title: "Simple et efficace", text: "J'ai intégré NUKU à ma routine depuis un mois et je sens une vraie différence. Simple et agréable à prendre." },
              { name: "Thomas R.", initials: "TR", verified: true, title: "Produits de qualité", text: "Composition clean, exactement ce que je recherchais. Je recommande sans hésiter." },
              { name: "Sophie L.", initials: "SL", verified: true, title: "J'adore l'univers", text: "Une approche douce et honnête du bien-être. L'univers de la marque est vraiment inspirant." },
              { name: "Amélie V.", initials: "AV", verified: true, title: "Routine quotidienne", text: "Les gummies sont bons et faciles à intégrer au quotidien. Mention spéciale pour le sans sucre ajouté." },
              { name: "Julien M.", initials: "JM", verified: true, title: "Très bonne surprise", text: "Packaging soigné et résultats progressifs mais réels. Une marque qui tient ses promesses." },
              { name: "Laura P.", initials: "LP", verified: true, title: "Transparence et efficacité", text: "Enfin une marque qui allie simplicité, transparence et efficacité. Je ne peux plus m'en passer." },
            ].map((review, index) => (
              <div key={index} className="flex-none w-[260px] sm:w-[300px] snap-start">
                <div className="bg-white rounded-2xl p-5 h-full shadow-sm hover:shadow-lg transition-all duration-300 border border-neutral-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#e8e0d5] flex items-center justify-center flex-shrink-0">
                      <span className="text-[#8a7a6a] font-black text-xs">{review.initials}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-black text-neutral-900 text-sm truncate tracking-tight">{review.name}</p>
                        {review.verified && <span className="text-green-600 text-xs flex-shrink-0">✓</span>}
                      </div>
                      {review.verified && <p className="text-xs text-neutral-400 font-light">Acheteur vérifié</p>}
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-3 text-[#ffb703]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <h4 className="font-black text-neutral-900 text-sm mb-2 tracking-tight">{review.title}</h4>
                  <p className="text-sm text-neutral-600 leading-relaxed font-light">"{review.text}"</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8 sm:mt-12 px-4 sm:px-6">
            <p className="text-sm text-neutral-500 mb-5 font-light">
              Rejoignez notre communauté et partagez votre expérience
            </p>
            <Link href="/shop" className="inline-flex items-center gap-2 bg-[#ff8844] text-white px-8 py-4 rounded-full font-black uppercase tracking-wide hover:bg-[#ff7733] transition-all shadow-lg text-sm">
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