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

type Category = {
  name: string;
  image: string;
  bg: string;
  link: string;
};

export default function HomePage() {
  const [showPopup, setShowPopup] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const touchStartX = useRef<number | null>(null);
  const mouseStartX = useRef<number | null>(null);
  const isDragging = useRef(false);

  const goNext = () => setCurrentSlide((prev) => (prev + 1) % 3);
  const goPrev = () => setCurrentSlide((prev) => (prev + 2) % 3);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
    touchStartX.current = null;
  };
  const handleMouseDown = (e: React.MouseEvent) => { mouseStartX.current = e.clientX; isDragging.current = true; };
  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current || mouseStartX.current === null) return;
    const diff = mouseStartX.current - e.clientX;
    if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
    mouseStartX.current = null;
    isDragging.current = false;
  };
  const handleMouseLeave = () => { isDragging.current = false; mouseStartX.current = null; };

  useEffect(() => {
    const hasVisited: string | null = localStorage.getItem("hasVisited");
    if (!hasVisited) {
      setTimeout(() => setShowPopup(true), 3000);
      localStorage.setItem("hasVisited", "true");
    }
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (!error && data) setProducts(data as Product[]);
      setLoading(false);
    })();
  }, []);

  const storyImageSrc = "/image/sourire.jpg";

  const categories: Category[] = [
    { name: "Sommeil",           image: "/image/nukuBleu.png",   bg: "bg-[#ffffff]", link: "/product/12" },
    { name: "Relax",             image: "/image/nukuViolet.png", bg: "bg-[#ffffff]", link: "/product/10" },
    { name: "Force & endurance", image: "/image/nukuRouge.png",  bg: "bg-[#ffffff]", link: "/product/14" },
    { name: "Cheveux",           image: "/image/nukuJaune.png",  bg: "bg-[#ffffff]", link: "/product/11" },
    { name: "Digestion",         image: "/image/nukuVert.png",   bg: "bg-[#ffffff]", link: "/product/13" },
  ];

  const lifestylePhotos = [
    { src: "/image/lifestyle1.jpeg", label: "Routine bien-être",      sub: "Compléments pour votre quotidien" },
    { src: "/image/lifestyle2.jpeg", label: "Ingrédients naturels",   sub: "Formules pensées pour votre santé" },
    { src: "/image/lifestyle1.jpeg", label: "Performance & énergie",  sub: "Boostez vos journées naturellement" },
    { src: "/image/lifestyle2.jpeg", label: "Sommeil profond",        sub: "Retrouvez un repos réparateur" },
    { src: "/image/lifestyle1.jpeg", label: "Équilibre au quotidien", sub: "Une routine simple et efficace" },
    { src: "/image/lifestyle2.jpeg", label: "Beauté naturelle",       sub: "Prenez soin de vous de l'intérieur" },
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
            <h3 className="text-2xl sm:text-3xl font-normal mb-4 text-center tracking-tight">
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
     {/* CONTENEUR PARENT : On fixe une hauteur identique pour tout le monde */}
<div className="relative w-full overflow-hidden h-[500px] sm:h-[600px] lg:h-[700px] bg-white">
      
      {/* ---- SLIDE 0 : SHINE (JAUNE) ---- */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${currentSlide === 0 ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
        <img 
          src="/image/sliderCitron.jpg" 
          className="absolute inset-0 w-full h-full object-cover object-[75%_center] sm:object-center" 
          alt="NUKU Shine" 
        />
        {/* Overlay Responsive : Noir en bas sur Mobile / Blanc à gauche sur PC */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent sm:bg-gradient-to-r sm:from-white/90 sm:via-white/20 sm:to-transparent" />
        
        <div className="relative z-20 flex flex-col justify-end sm:justify-center h-full px-6 sm:px-20 pb-16 sm:pb-0">
          <div className="max-w-[500px] text-center sm:text-left">
            <h2 className="text-[36px] sm:text-[54px] lg:text-[64px] font-black leading-[0.9] uppercase mb-4 text-white sm:text-neutral-950">
              Votre routine<br />rayonnante.
            </h2>
            <Link href="/sub" className="inline-block bg-white sm:bg-black text-black sm:text-white px-10 py-4 rounded-full font-bold uppercase text-[11px] tracking-widest shadow-xl">
              S'abonner — 20% OFF
            </Link>
          </div>
        </div>
      </div>

      {/* ---- SLIDE 1 : SOUL (VIOLET) ---- */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${currentSlide === 1 ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
        <div className="absolute inset-0 bg-[#4A1088]" />
        
        {/* Image du Pot : h-[70%] force le pot à rester dans le cadre sans agrandir le slide */}
        <div className="absolute inset-0 flex flex-col sm:flex-row items-center justify-start sm:justify-end pt-12 sm:pt-0 sm:pr-24">
          <img 
            src="/image/nukuViolet.png" 
            className="w-auto h-[55%] sm:h-[75%] object-contain drop-shadow-2xl" 
            alt="NUKU Soul" 
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent sm:hidden" />
        
        <div className="relative z-20 flex flex-col justify-end sm:justify-center h-full px-6 sm:px-20 pb-16 sm:pb-0">
          <div className="max-w-[500px] text-center sm:text-left">
            <h2 className="text-[36px] sm:text-[54px] lg:text-[64px] font-black leading-[0.9] text-white uppercase mb-4">
              Esprit apaisé,<br />mieux-être.
            </h2>
            <p className="text-[14px] sm:text-[16px] text-white/90 mb-8 max-w-[280px] sm:max-w-none mx-auto sm:mx-0 font-medium">
              Pour soulager le stress et clarifier l'esprit.
            </p>
            <Link href="/soul" className="inline-block bg-[#FF6B2C] text-white px-10 py-4 rounded-full font-bold uppercase text-[11px] tracking-widest shadow-xl">
              Découvrir Soul
            </Link>
          </div>
        </div>
      </div>

      {/* ---- SLIDE 2 : GAMME COMPLÈTE ---- */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${currentSlide === 2 ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
  
  {/* IMAGE : "object-[center_60%]" descend l'image pour mieux voir le haut des pots */}
  <img 
    src="/image/couleur.jpg" 
    className="absolute inset-0 w-full h-full object-cover object-[center_60%] sm:object-center" 
    alt="Gamme NUKU Complète" 
  />
  
  {/* OVERLAY : On l'adapte pour qu'il soit plus sombre en bas sur mobile pour la lisibilité */}
  <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent sm:bg-gradient-to-r sm:from-white/70 sm:via-white/20 sm:to-transparent" />
  
  {/* CONTENU : Aligné au centre en bas sur mobile, à gauche sur PC */}
  <div className="relative z-20 flex flex-col justify-end sm:justify-center h-full px-6 sm:px-20 pb-20 sm:pb-0">
    <div className="max-w-[550px] text-center sm:text-left">
      
      <h2 className="text-[32px] sm:text-[54px] lg:text-[64px] font-black leading-[0.9] text-neutral-900 uppercase mb-4">
        Élevez votre<br className="hidden sm:block" /> bien-être.
      </h2>
      
      <p className="text-[14px] sm:text-[16px] text-neutral-800 mb-8 max-w-[280px] sm:max-w-none mx-auto sm:mx-0 font-medium leading-tight">
        Des compléments botaniques pensés pour harmoniser votre corps.
      </p>
      
      <Link href="/shop" className="inline-block bg-black text-white px-10 py-4 rounded-full font-bold uppercase text-[10px] sm:text-[11px] tracking-widest shadow-xl hover:scale-105 transition-transform">
        Explorer la gamme
      </Link>
      
    </div>
  </div>
</div>
      {/* ---- NAVIGATION (DOTS) ---- */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-[4px] rounded-full transition-all duration-300 ${
              currentSlide === i ? "w-12 bg-white" : "w-6 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>

      {/* ================= LOGO ================= */}
      <section className="py-3 sm:py-5 bg-white">
        <div className="flex flex-col items-center">
          <img src="/image/logo.png" alt="NUKU" className="h-14 sm:h-20 md:h-24 opacity-90" />
        </div>
      </section>

      {/* ================= IMAGE + TEXTE ================= */}
      <section className="py-5 sm:py-8 md:py-10 px-4 sm:px-6 bg-white">
        <div className="max-w-[1500px] mx-auto grid md:grid-cols-2 gap-6 sm:gap-12 md:gap-16 items-center">
          <div className="w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg">
            <img src={storyImageSrc} alt="NUKU – bien-être" className="w-full h-[240px] sm:h-full object-cover" />
          </div>
          <div className="space-y-4">
            <h4 className="font-normal text-[clamp(20px,4vw,38px)] leading-[1.2] tracking-[-0.03em] text-neutral-800">
              Chez NUKU, l&apos;équilibre avant tout.
            </h4>
            <p className="text-[15px] sm:text-[17px] leading-[1.8] text-neutral-600 max-w-[560px] font-light">
              Nous savons que le bien-être ne se résume pas à une solution miracle. Chaque corps est différent, chaque rythme aussi.
            </p>
            <p className="text-[15px] sm:text-[17px] leading-[1.8] text-neutral-600 max-w-[560px] font-light">
              C&apos;est pourquoi NUKU a été pensé pour s&apos;intégrer simplement dans le quotidien, avec des formules claires, des ingrédients sélectionnés avec soin, et une approche honnête du bien-être.
            </p>
            <p className="text-[15px] sm:text-[17px] leading-[1.8] text-neutral-600 max-w-[560px] font-light">
              Pas de promesses excessives. Juste des compléments conçus pour accompagner l&apos;équilibre, jour après jour.
            </p>
            <Link href="/shop" className="inline-flex h-11 items-center rounded-full px-6 font-black text-white bg-orange-600 hover:bg-orange-700 transition-colors uppercase tracking-wide text-sm">
              Découvrir NUKU
            </Link>
          </div>
        </div>
      </section>

      {/* ================= PICTOGRAMMES ================= */}
      <section className="py-4 sm:py-5 px-4 sm:px-6 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex sm:hidden justify-between items-center w-full">
            {[
              { src: "/image/vegan.png",    label: "Vegan" },
              { src: "/image/lieu.png",     label: "Belgique" },
              { src: "/image/ogm.png",      label: "Sans OGM" },
              { src: "/image/colorant.png", label: "Sans colorant" },
              { src: "/image/sucre.png",    label: "Sans sucre" },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                <img src={item.src} alt={item.label} className="w-10 h-10 object-contain opacity-70" />
                <span className="text-[9px] text-neutral-500 text-center leading-tight font-medium">{item.label}</span>
              </div>
            ))}
          </div>
          <div className="hidden sm:flex flex-col items-center">
            <div className="flex justify-center items-center gap-16 sm:gap-24 lg:gap-56">
              {["/image/vegan.png", "/image/lieu.png", "/image/ogm.png"].map((src, idx) => (
                <img key={idx} src={src} alt="" className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-44 lg:h-44 object-contain opacity-90" />
              ))}
            </div>
            <div className="flex justify-center gap-16 sm:gap-24 lg:gap-56 -mt-4 lg:-mt-8">
              {["/image/colorant.png", "/image/sucre.png"].map((src, idx) => (
                <img key={idx} src={src} alt="" className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-44 lg:h-44 object-contain opacity-90" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= CATÉGORIES ================= */}
      <section className="pt-4 pb-8 sm:pb-16 md:pb-20 px-4 sm:px-6 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="text-center font-normal text-[clamp(22px,6vw,52px)] leading-[1.05] tracking-[-0.03em] text-neutral-900 mb-6 sm:mb-12">
            De quoi avez-vous besoin&nbsp;?
          </h2>
          <div className="flex sm:hidden gap-3 overflow-x-auto pb-3 snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
            {categories.map((cat, index) => (
              <Link key={index} href={cat.link} className="flex-none snap-start flex flex-col items-center text-center bg-white rounded-2xl shadow-sm w-[110px] overflow-hidden">
                <div className={`w-full flex items-end justify-center pt-3 ${cat.bg}`} style={{ minHeight: "90px" }}>
                  <img src={cat.image} alt={cat.name} className="w-full h-auto object-contain translate-y-2 px-2" />
                </div>
                <div className="px-2 pb-2 pt-3">
                  <span className="text-[10px] font-medium text-neutral-900 leading-tight block">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="hidden sm:grid grid-cols-5 gap-4 md:gap-6">
            {categories.map((cat, index) => (
              <Link key={index} href={cat.link} className="flex flex-col items-center text-center bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <div className={`w-full flex items-end justify-center pt-4 ${cat.bg}`} style={{ minHeight: "160px" }}>
                  <img src={cat.image} alt={cat.name} className="w-full h-auto object-contain translate-y-4 px-4" />
                </div>
                <div className="px-4 pt-7 pb-5 w-full">
                  <span className="font-normal text-base md:text-lg text-neutral-900 tracking-tight block">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 6 PHOTOS — desktop only ================= */}
      <section className="hidden sm:block py-8 sm:py-16 md:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {lifestylePhotos.map((photo, index) => (
              <div key={index} className="group relative overflow-hidden rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 h-[180px] sm:h-[280px] md:h-[380px]">
                <img src={photo.src} alt={photo.label} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 md:p-7 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="font-normal text-base sm:text-xl md:text-2xl text-white mb-1 tracking-tight">{photo.label}</h3>
                  <p className="text-xs sm:text-sm text-white/90 font-light hidden sm:block">{photo.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= AVIS CLIENTS ================= */}
      <section className="py-8 sm:py-16 md:py-20 bg-white overflow-hidden">
        <div className="max-w-[1400px] mx-auto">
          <div className="px-4 sm:px-6 mb-6 sm:mb-10">
            <h3 className="font-normal text-[clamp(22px,5.5vw,48px)] leading-[1.05] tracking-[-0.03em] text-neutral-900 mb-2">
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
              { name: "Claire D.",  initials: "CD", title: "Simple et efficace",        text: "J'ai intégré NUKU à ma routine depuis un mois et je sens une vraie différence. Simple et agréable à prendre." },
              { name: "Thomas R.",  initials: "TR", title: "Produits de qualité",        text: "Composition clean, exactement ce que je recherchais. Je recommande sans hésiter." },
              { name: "Sophie L.",  initials: "SL", title: "J'adore l'univers",          text: "Une approche douce et honnête du bien-être. L'univers de la marque est vraiment inspirant." },
              { name: "Amélie V.",  initials: "AV", title: "Routine quotidienne",        text: "Les gummies sont bons et faciles à intégrer au quotidien. Mention spéciale pour le sans sucre ajouté." },
              { name: "Julien M.",  initials: "JM", title: "Très bonne surprise",        text: "Packaging soigné et résultats progressifs mais réels. Une marque qui tient ses promesses." },
              { name: "Laura P.",   initials: "LP", title: "Transparence et efficacité", text: "Enfin une marque qui allie simplicité, transparence et efficacité. Je ne peux plus m'en passer." },
            ].map((review, index) => (
              <div key={index} className="flex-none w-[240px] sm:w-[300px] snap-start">
                <div className="bg-white rounded-2xl p-4 sm:p-5 h-full shadow-sm hover:shadow-lg transition-all duration-300 border border-neutral-100">
                  <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#e8e0d5] flex items-center justify-center flex-shrink-0">
                      <span className="text-[#8a7a6a] font-black text-xs">{review.initials}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-neutral-900 text-sm truncate tracking-tight">{review.name}</p>
                        <span className="text-green-600 text-xs flex-shrink-0">✓</span>
                      </div>
                      <p className="text-xs text-neutral-400 font-light">Acheteur vérifié</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-2 sm:mb-3 text-[#ffb703]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <h4 className="font-normal text-neutral-900 text-sm mb-1 sm:mb-2 tracking-tight">{review.title}</h4>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">&quot;{review.text}&quot;</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6 sm:mt-12 px-4 sm:px-6">
            <p className="text-sm text-neutral-500 mb-4 sm:mb-5 font-light">
              Rejoignez notre communauté et partagez votre expérience
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-[#ff8844] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-black uppercase tracking-wide hover:bg-[#ff7733] transition-all shadow-lg text-xs sm:text-sm"
            >
              Découvrir NUKU
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}