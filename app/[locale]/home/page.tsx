'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useCart } from '@/lib/contexts/CartContext'
import PackSection from "@/components/PackSection"
type Product = {
  id: number
  nom: string
  images?: string[] | null
  tagline?: string | null
  category?: string | null
  prix?: number | null
}

export default function HomePage() {
  const t = useTranslations('home')
  const pathname = usePathname()
  const segments = pathname?.split('/').filter(Boolean) ?? []
  const lang = ['fr', 'en', 'nl'].includes(segments[0]) ? segments[0] : 'fr'
  const LANG_LABEL = lang === "fr" ? "FR" : lang === "en" ? "EN" : "NL";
  const { addToCart } = useCart()

  const [showPopup, setShowPopup] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [aboSlide, setAboSlide] = useState(0)
  const [addedToCart, setAddedToCart] = useState(false)
  const [productSlide, setProductSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)


  const productSlides = [
    {
      bg: "#efede9",
      title: lang === 'fr' ? "Cheveux forts.\nÉclat naturel." : lang === 'en' ? "Hair growth.\nBeauty from within." : "Sterk haar.\nNatuurlijke glans.",
      desc: lang === 'fr' ? "Biotine, zinc et MSM pour soutenir des cheveux forts et une peau rayonnante." : lang === 'en' ? "Biotin, zinc and MSM to support strong hair and glowing skin." : "Biotine, zink en MSM voor sterk haar en stralende huid.",
      image1: "/image/nukuJaune.png",
      image2: "/image/nukuJaune.png",
      productLink: `/${lang}/product/11`, 
    },
    {
      bg: "#efede9",
      title: lang === 'fr' ? "Sommeil profond.\nNuits récupératrices." : lang === 'en' ? "Sleep deeper.\nWake up better." : "Dieper slapen.\nBeter wakker worden.",
      desc: lang === 'fr' ? "Mélatonine, L‑théanine & magnésium pour des nuits paisibles." : lang === 'en' ? "Melatonin, L‑theanine & magnesium for peaceful nights." : "Melatonine, L‑theanine & magnesium voor rustige nachten.",
      image1: "/image/nukuBleu.png",
      image2: "/image/nukuBleu.png",
      productLink: `/${lang}/product/12`,
    },
    {
      bg: "#efede9",
      title: lang === 'fr' ? "Relax & équilibre.\nCalme naturel." : lang === 'en' ? "Relax naturally.\nFind inner balance." : "Rust & balans.\nNatuurlijke rust.",
      desc: lang === 'fr' ? "Ashwagandha, rhodiola & safran pour la sérénité au quotidien." : lang === 'en' ? "Ashwagandha, saffron & rhodiola for calm and mental balance." : "Ashwagandha, saffraan & rhodiola voor kalmte en mentale balans.",
      image1: "/image/nukuViolet.png",
      image2: "/image/nukuViolet.png",
       productLink: `/${lang}/product/16`,
    },
    {
      bg: "#efede9",
      title: lang === 'fr' ? "Force & endurance.\nBoost naturel." : lang === 'en' ? "More strength.\nBetter recovery." : "Meer kracht.\nBeter herstel.",
      desc: lang === 'fr' ? "Créatine, B12 & D3 pour des performances naturelles." : lang === 'en' ? "Creatine, B12 & D3 for natural performance." : "Creatine, B12 & D3 voor natuurlijke prestaties.",
      image1: "/image/nukuRouge.png",
      image2: "/image/nukuRouge.png",
       productLink: `/${lang}/product/14`,
    },
    {
      bg: "#efede9",
      title: lang === 'fr' ? "Digestion facile.\nVentre léger." : lang === 'en' ? "Happy digestion.\nLight feeling." : "Makkelijke spijsvertering.\nLicht gevoel.",
      desc: lang === 'fr' ? "Matcha, artichaut & pissenlit pour un confort digestif quotidien." : lang === 'en' ? "Matcha, artichoke & dandelion for daily gut balance." : "Matcha, artisjok & paardenbloem voor dagelijks spijsverteringscomfort.",
      image1: "/image/nukuVert.png",
      image2: "/image/nukuVert.png",
      productLink: `/${lang}/product/13`,
    }
  ]

  const heroSlides = [
    {
      title:
        lang === "fr"
          ? "Cheveux forts.\nÉclat naturel."
          : lang === "en"
          ? "Stronger hair.\nNatural glow."
          : "Sterk haar.\nNatuurlijke glans.",
      desc: "Biotine · Zinc · MSM — Routine beauté quotidienne.",
      image: "/image/nukuJaune.png",
      tagline: "Cheveux & beauté",
      detail: "Biotine · Zinc · MSM — Pour des cheveux plus forts.",
    },
    {
      title:
        lang === "fr"
          ? "Sommeil profond.\nNuits récupératrices."
          : lang === "en"
          ? "Deep sleep.\nRestful nights."
          : "Diepe slaap.\nHerstellende nachten.",
      desc: "Mélatonine · Magnésium · L‑théanine.",
      image: "/image/nukuBleu.png",
      tagline: "Sommeil",
      detail: "Mélatonine · L‑théanine — Endormissement plus rapide.",
    },
    {
      title:
        lang === "fr"
          ? "Relax & équilibre.\nCalme naturel."
          : lang === "en"
          ? "Relax & balance.\nNatural calm."
          : "Rust & balans.\nNatuurlijke rust.",
      desc: "Ashwagandha · Rhodiola · Safran.",
      image: "/image/nukuViolet.png",
      tagline: "Relax",
      detail: "Adaptogènes puissants — stress réduit naturellement.",
    },
    {
      title:
        lang === "fr"
          ? "Force & endurance.\nBoost naturel."
          : lang === "en"
          ? "Strength & endurance.\nNatural boost."
          : "Kracht & uithouding.\nNatuurlijke boost.",
      desc: "Créatine · Vitamine B12 · Vitamine D3.",
      image: "/image/nukuRouge.png",
      tagline: "Force & performance",
      detail: "Créatine + vitamines — plus d'énergie au quotidien.",
    },
    {
      title:
        lang === "fr"
          ? "Digestion facile.\nVentre léger."
          : lang === "en"
          ? "Easy digestion.\nLight feeling."
          : "Makkelijke spijsvertering.\nLicht gevoel.",
      desc: "Matcha · Artichaut · Pissenlit.",
      image: "/image/nukuVert.png",
      tagline: "Digestion",
      detail: "Ventre plus léger — digestion facilitée.",
    },
  ]

  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      setProductSlide((prev) => (prev + 1) % productSlides.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [isPaused, productSlides.length])

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited')
    if (!hasVisited) {
      setTimeout(() => setShowPopup(true), 3000)
      localStorage.setItem('hasVisited', 'true')
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.from('products').select('*').eq('actif', true)
      if (data) setProducts(data as Product[])
    })()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setAboSlide((prev) => (prev + 1) % aboSlides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const categories = [
    {
      name: lang === 'fr' ? 'Sommeil' : lang === 'en' ? 'Sleep' : 'Slaap',
      sub:
        lang === 'fr'
          ? 'Mélatonine · L-théanine · Magnésium'
          : lang === 'en'
          ? 'Melatonin · L-theanine · Magnesium'
          : 'Melatonine · L-theanine · Magnesium',
      image: '/image/nukuBleu.png',
      link: `/${lang}/product/12`,
      prix: 18,
    },
    {
      name: lang === 'fr' ? 'Relax & équilibre' : lang === 'en' ? 'Relax & balance' : 'Rust & balans',
      sub:
        lang === 'fr'
          ? 'Ashwagandha · Rhodiola · Safran'
          : lang === 'en'
          ? 'Ashwagandha · Rhodiola · Saffron'
          : 'Ashwagandha · Rhodiola · Saffraan',
      image: '/image/nukuViolet.png',
      link: `/${lang}/product/16`,
      prix: 18,
    },
    {
      name:
        lang === 'fr'
          ? 'Force & endurance'
          : lang === 'en'
          ? 'Strength & endurance'
          : 'Kracht & uithoudingsvermogen',
      sub:
        lang === 'fr'
          ? 'Créatine · Vitamine B12 · Vitamine D3'
          : lang === 'en'
          ? 'Creatine · Vitamin B12 · Vitamin D3'
          : 'Creatine · Vitamine B12 · Vitamine D3',
      image: '/image/nukuRouge.png',
      link: `/${lang}/product/14`,
      prix: 18,
    },
    {
      name:
        lang === 'fr'
          ? 'Cheveux & beauté'
          : lang === 'en'
          ? 'Hair & beauty'
          : 'Haar & schoonheid',
      sub:
        lang === 'fr'
          ? 'Biotine · Zinc · MSM'
          : lang === 'en'
          ? 'Biotin · Zinc · MSM'
          : 'Biotine · Zink · MSM',
      image: '/image/nukuJaune.png',
      link: `/${lang}/product/11`,
      prix: 18,
    },
    {
      name: lang === 'fr' ? 'Digestion' : lang === 'en' ? 'Digestion' : 'Spijsvertering',
      sub:
        lang === 'fr'
          ? 'Matcha · Artichaut · Pissenlit'
          : lang === 'en'
          ? 'Matcha · Artichoke · Dandelion'
          : 'Matcha · Artisjok · Paardenbloem',
      image: '/image/nukuVert.png',
      link: `/${lang}/product/13`,
      prix: 18,
    },
  ]

  const aboSlides = [
    {
      image: '/image/nukuJaune.png',
      name: lang === 'fr' ? 'Cheveux & beauté' : lang === 'en' ? 'Hair & beauty' : 'Haar & schoonheid',
      tagline:
        lang === 'fr'
          ? 'Des cheveux forts, une peau rayonnante.'
          : lang === 'en'
          ? 'Strong hair, glowing skin.'
          : 'Sterk haar, stralende huid.',
      detail:
        lang === 'fr'
          ? "Biotine · Zinc · MSM — Nourris tes cheveux de l'intérieur pour un éclat visible dès 4 semaines."
          : lang === 'en'
          ? 'Biotin · Zinc · MSM — Nourish your hair from within for visible radiance from week 4.'
          : 'Biotine · Zink · MSM — Voed je haar van binnenuit voor zichtbare glans vanaf week 4.',
    },
    {
      image: '/image/nukuBleu.png',
      name: lang === 'fr' ? 'Sommeil' : lang === 'en' ? 'Sleep' : 'Slaap',
      tagline:
        lang === 'fr'
          ? 'Endors-toi vite. Réveille-toi bien.'
          : lang === 'en'
          ? 'Fall asleep fast. Wake up right.'
          : 'Snel in slaap. Goed wakker.',
      detail:
        lang === 'fr'
          ? 'Mélatonine · L-théanine · Magnésium — Le trio qui prépare ton corps et ton esprit au repos profond.'
          : lang === 'en'
          ? 'Melatonin · L-theanine · Magnesium — The trio that prepares body and mind for deep rest.'
          : 'Melatonine · L-theanine · Magnesium — Het trio voor diepe rust.',
    },
    {
      image: '/image/nukuViolet.png',
      name: lang === 'fr' ? 'Relax & équilibre' : lang === 'en' ? 'Relax & balance' : 'Rust & balans',
      tagline:
        lang === 'fr'
          ? 'Le calme, en gummies.'
          : lang === 'en'
          ? 'Calm, in a gummy.'
          : 'Rust, in een gummy.',
      detail:
        lang === 'fr'
          ? 'Ashwagandha · Rhodiola · Safran — Adaptogènes puissants pour garder la tête froide même les jours intenses.'
          : lang === 'en'
          ? 'Ashwagandha · Rhodiola · Saffron — Powerful adaptogens to stay cool even on intense days.'
          : 'Ashwagandha · Rhodiola · Saffraan — Krachtige adaptogens voor de drukste dagen.',
    },
    {
      image: '/image/nukuRouge.png',
      name:
        lang === 'fr'
          ? 'Force & endurance'
          : lang === 'en'
          ? 'Strength & endurance'
          : 'Kracht & uithoudingsvermogen',
      tagline:
        lang === 'fr'
          ? 'Pour les jours où tu te dépasses.'
          : lang === 'en'
          ? 'For the days you push further.'
          : 'Voor de dagen dat je verder gaat.',
      detail:
        lang === 'fr'
          ? 'Créatine · Vitamine B12 · Vitamine D3 — Optimise ta récupération et booste tes performances naturellement.'
          : lang === 'en'
          ? 'Creatine · Vitamin B12 · Vitamin D3 — Optimize recovery and boost performance naturally.'
          : 'Creatine · Vitamine B12 · D3 — Optimaliseer herstel en prestaties.',
    },
    {
      image: '/image/nukuVert.png',
      name: lang === 'fr' ? 'Digestion' : lang === 'en' ? 'Digestion' : 'Spijsvertering',
      tagline:
        lang === 'fr'
          ? 'Votre ventre dit merci.'
          : lang === 'en'
          ? 'Your gut says thank you.'
          : 'Je buik zegt dankjewel.',
      detail:
        lang === 'fr'
          ? 'Matcha · Artichaut · Pissenlit — Soutient le transit, réduit les ballonnements. Un ventre léger au quotidien.'
          : lang === 'en'
          ? 'Matcha · Artichoke · Dandelion — Supports transit, reduces bloating. A light feeling every day.'
          : 'Matcha · Artisjok · Paardenbloem — Ondersteunt de spijsvertering en vermindert een opgeblazen gevoel.',
    },
  ]

  const reviews = [
    {
      name: 'Claire D.',
      initials: 'CD',
      title: lang === 'fr' ? 'Simple et efficace' : lang === 'en' ? 'Simple and effective' : 'Eenvoudig en effectief',
      text:
        lang === 'fr'
          ? "J'ai intégré NUKU à ma routine depuis un mois et je sens une vraie différence. Simple et agréable à prendre."
          : lang === 'en'
          ? "I've incorporated NUKU into my routine for a month and I feel a real difference."
          : 'Ik heb NUKU een maand in mijn routine opgenomen en ik voel een echt verschil.',
      stars: 5,
    },
    {
      name: 'Thomas R.',
      initials: 'TR',
      title: lang === 'fr' ? 'Produits de qualité' : lang === 'en' ? 'Quality products' : 'Kwaliteitsproducten',
      text:
        lang === 'fr'
          ? 'Composition clean, exactement ce que je recherchais. Je recommande sans hésiter.'
          : lang === 'en'
          ? 'Clean composition, exactly what I was looking for. I recommend without hesitation.'
          : 'Schone samenstelling, precies wat ik zocht.',
      stars: 5,
    },
    {
      name: 'Sophie L.',
      initials: 'SL',
      title: lang === 'fr' ? "J'adore l'univers" : lang === 'en' ? 'Love the brand' : 'Geweldige uitstraling',
      text:
        lang === 'fr'
          ? "Une approche douce et honnête du bien-être. L'univers de la marque est vraiment inspirant."
          : lang === 'en'
          ? "A gentle and honest approach to well-being. The brand's world is truly inspiring."
          : 'Een zachte en eerlijke benadering van welzijn.',
      stars: 5,
    },
    {
      name: 'Amélie V.',
      initials: 'AV',
      title: lang === 'fr' ? 'Routine quotidienne' : lang === 'en' ? 'Daily routine' : 'Dagelijkse routine',
      text:
        lang === 'fr'
          ? "Les gummies sont bons et faciles à intégrer au quotidien. Mention spéciale pour le sans sucre ajouté."
          : lang === 'en'
          ? 'The gummies are good and easy to integrate daily. Special mention for no added sugar.'
          : 'De gummies zijn goed en gemakkelijk dagelijks in te nemen.',
      stars: 5,
    },
    {
      name: 'Julien M.',
      initials: 'JM',
      title: lang === 'fr' ? 'Très bonne surprise' : lang === 'en' ? 'Great surprise' : 'Geweldige verrassing',
      text:
        lang === 'fr'
          ? "Packaging soigné et résultats progressifs mais réels. Une marque qui tient ses promesses."
          : lang === 'en'
          ? 'Careful packaging and progressive but real results. A brand that keeps its promises.'
          : 'Verzorgde verpakking en progressieve maar echte resultaten.',
      stars: 5,
    },
  ]

  const subBenefits = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      ),
      title: lang === 'fr' ? 'Aucune charge mentale' : lang === 'en' ? 'No mental load' : 'Geen mentale last',
      sub:
        lang === 'fr'
          ? 'Vos produits arrivent toujours au bon moment.'
          : lang === 'en'
          ? 'Your products always arrive on time.'
          : 'Uw producten komen altijd op het juiste moment.',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M17 2l4 4-4 4" />
          <path d="M3 11V9a4 4 0 014-4h14" />
          <path d="M7 22l-4-4 4-4" />
          <path d="M21 13v2a4 4 0 01-4 4H3" />
        </svg>
      ),
      title: lang === 'fr' ? 'Liberté totale.' : lang === 'en' ? 'Total freedom.' : 'Totale vrijheid.',
      sub:
        lang === 'fr'
          ? 'Changez, mettez en pause, arrêtez quand vous voulez.'
          : lang === 'en'
          ? 'Change, pause, stop whenever you want.'
          : 'Wijzig, pauzeer, stop wanneer u wilt.',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
      title: lang === 'fr' ? 'Prix préférentiel.' : lang === 'en' ? 'Best price.' : 'Voordeligste prijs.',
      sub:
        lang === 'fr'
          ? 'Économisez 20% sur chaque livraison.'
          : lang === 'en'
          ? 'Save 20% on every delivery.'
          : 'Bespaar 20% op elke levering.',
    },
  ]

  const badges = [
    {
      label: 'NO SUGAR',
      icon: (
        <svg className="w-[20px] h-[20px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
      ),
    },
    {
      label: 'VEGAN',
      icon: (
        <svg className="w-[20px] h-[20px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <path d="M12 2C6 2 3 8 3 12s3 10 9 10 9-4 9-8-3-12-9-12z" />
        </svg>
      ),
    },
    {
      label: 'LOCAL',
      icon: (
        <svg className="w-[20px] h-[20px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      ),
    },
  ]
  const HEADER_H = 72

  return (
    <div className="min-h-screen bg-white">

      {/* ── POPUP ── */}
      {showPopup && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl md:text-5xl mb-3 md:mb-4 text-center">🎁</div>
            <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 text-center text-neutral-900">{t('popup_title')}</h3>
            <p className="text-neutral-600 mb-5 md:mb-6 text-center text-sm md:text-base">
              {t('popup_subtitle').split('-20%')[0]}
              <span className="font-black text-orange-500">-20%</span>
              {t('popup_subtitle').split('-20%')[1]}
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="w-full py-3 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 transition-all text-sm tracking-wide uppercase"
            >
              {t('popup_cta')}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          HERO — mobile: image + texte stacked / desktop: background image
      ══════════════════════════════════════════ */}
{/* ─── MOBILE HERO ─── */}
<section className="md:hidden relative overflow-hidden" style={{ minHeight: '280px' }}>
  <div
    className="absolute inset-0"
    style={{
      backgroundImage: "url('/image/fruitbackroundTel.png')",
      backgroundSize: '150%',
      backgroundPosition: '70% 10%',
      backgroundRepeat: 'no-repeat',
    }}
  />
  <div
    className="absolute inset-0"
    style={{
    background: 'linear-gradient(to bottom, rgba(253,250,245,0.6) 0%, rgba(253,250,245,0.3) 40%, rgba(253,250,245,0.0) 100%)',
    }}
  />
  <div className="relative z-10 px-5 pt-12 pb-10 flex flex-col gap-4" style={{ minHeight: '280px' }}>
    <span
      className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full w-fit"
      style={{ background: '#ebebeb', color: '#777' }}
    >
      {lang === 'fr' ? 'Nouveauté' : lang === 'en' ? 'New' : 'Nieuw'}
    </span>
    <h1
      className="font-black leading-[1.05]"
      style={{
        fontSize: 'clamp(30px, 9vw, 40px)',
        color: '#111',
        whiteSpace: 'pre-line',
      }}
    >
      {lang === 'fr'
        ? 'Mieux dans ta peau.\nNaturellement.'
        : lang === 'en'
        ? 'Feel better.\nNaturally.'
        : 'Beter in je vel.\nNatuurlijk.'}
    </h1>
    <p className="text-xs text-neutral-700 leading-relaxed max-w-xs">
      {lang === 'fr'
        ? 'Des gummies simples & clean, conçus pour ton rythme quotidien.'
        : lang === 'en'
        ? 'Simple & clean gummies, designed for your daily rhythm.'
        : 'Eenvoudige & schone gummies, ontworpen voor jouw dagelijks ritme.'}
    </p>
    <div className="flex items-center gap-2.5 flex-wrap">
      <Link
        href={`/${lang}/shop`}
        className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide"
        style={{ background: '#ED9446', color: '#fff' }}
      >
        {lang === 'fr' ? 'Découvrir' : lang === 'en' ? 'Shop now' : 'Ontdekken'}
      </Link>
    </div>
    <div className="flex items-center gap-6 pt-2">
      {badges.map((b, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div style={{ color: '#111' }}>{b.icon}</div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-900">{b.label}</span>
        </div>
      ))}
    </div>
  </div>
</section>

{/* ─── DESKTOP HERO ─── */}
<section
  className="hidden md:block relative w-full overflow-hidden"
  style={{ height: '75vh', minHeight: '560px' }}
>
  <div
    className="absolute inset-0"
    style={{
      backgroundImage: "url('/image/fruitbackround.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
    }}
  />
  <div
    className="absolute inset-0"
    style={{
      background: 'linear-gradient(to right, rgba(253,250,245,0.92) 0%, rgba(253,250,245,0.75) 30%, rgba(253,250,245,0.15) 55%, transparent 70%)',
      zIndex: 1,
    }}
  />
  <div
    className="relative h-full flex items-center px-6 md:px-16"
    style={{ zIndex: 2 }}
  >
    <div className="flex flex-col gap-6" style={{ maxWidth: '480px' }}>
      <span
        className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full w-fit"
        style={{ background: '#ebebeb', color: '#777' }}
      >
        {lang === 'fr' ? 'Nouveauté' : lang === 'en' ? 'New' : 'Nieuw'}
      </span>
      <h1
        className="font-black leading-[1.05]"
        style={{
          fontSize: 'clamp(38px, 4vw, 62px)',
          color: '#111',
          whiteSpace: 'pre-line',
        }}
      >
        {lang === 'fr'
          ? 'Mieux dans ta peau.\nNaturellement.'
          : lang === 'en'
          ? 'Feel better.\nNaturally.'
          : 'Beter in je vel.\nNatuurlijk.'}
      </h1>
      <p className="text-sm text-neutral-600 leading-relaxed" style={{ maxWidth: '340px' }}>
        {lang === 'fr'
          ? 'Des gummies simples & clean,\nConçus pour ton rythme quotidien.'
          : lang === 'en'
          ? 'Simple & clean gummies,\nDesigned for your daily rhythm.'
          : 'Eenvoudige & schone gummies,\nOntworpen voor jouw dagelijks ritme.'}
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          href={`/${lang}/shop`}
          className="px-6 py-3 rounded-full text-[13px] font-bold uppercase tracking-wide"
          style={{ background: '#ED9446', color: '#fff' }}
        >
          {lang === 'fr' ? 'Découvrir' : lang === 'en' ? 'Shop now' : 'Ontdekken'}
        </Link>
        <Link
          href={`/${lang}/build-pack`}
          className="px-6 py-3 rounded-full text-[13px] font-medium border"
          style={{ borderColor: '#ccc', color: '#444', background: 'rgba(255,255,255,0.65)' }}
        >
          {lang === 'fr' ? 'Créer ma routine' : lang === 'en' ? 'Create my routine' : 'Mijn routine maken'}
        </Link>
      </div>
      <div className="flex items-center gap-8 pt-1">
        {badges.map((b, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div style={{ color: '#aaa' }}>{b.icon}</div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

      {/* ══════════════════════════════════════════
          CHOOSE YOUR GOAL
      ══════════════════════════════════════════ */}
      <section className="py-8 md:py-12 px-4 md:px-16 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <h2
            className="text-xl md:text-4xl font-black text-neutral-900 mb-6 md:mb-12 text-center"
            style={{ fontFamily: "'Georgia',serif" }}
          >
            {lang === 'fr' ? 'Choisissez votre objectif' : lang === 'en' ? 'Choose your Goal' : 'Kies jouw doel'}
          </h2>

          {/* Mobile — 3 produits fixes, pas de scroll */}
          <div className="grid md:hidden grid-cols-3 gap-3">
            {categories.slice(0, 3).map((cat, i) => (
              <Link
                key={i}
                href={cat.link}
                className="rounded-2xl overflow-hidden border border-neutral-100 shadow-sm active:scale-95 transition-transform"
              >
                <div className="w-full flex items-end justify-center overflow-hidden" style={{ background: '#f0eeec', height: '120px' }}>
                  <img src={cat.image} alt={cat.name} className="w-[60%] object-contain" style={{ filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.15))' }} />
                </div>
                <div className="px-2.5 py-2.5 bg-white">
                  <p className="text-[10px] font-black text-neutral-900 uppercase tracking-wide leading-tight">{cat.name}</p>
                  <p className="text-[8px] text-neutral-400 mt-0.5 leading-tight line-clamp-2">{cat.sub}</p>
                  <p className="text-[12px] font-bold text-neutral-900 mt-1.5">{cat.prix}€</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop — 3 produits */}
          <div className="hidden md:grid grid-cols-3 gap-5 max-w-3xl mx-auto">
            {categories.slice(0, 3).map((cat, i) => (
              <Link key={i} href={cat.link}
                className="rounded-2xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-lg transition-all duration-300 bg-white group cursor-pointer">
                <div className="w-full flex items-end justify-center overflow-hidden" style={{ background: '#f0eeec', height: '240px' }}>
                  <img src={cat.image} alt={cat.name} className="w-[58%] object-contain group-hover:scale-105 transition-transform duration-500"
                    style={{ filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.18))' }} />
                </div>
                <div className="px-5 py-5">
                  <p className="text-[13px] font-black text-neutral-900 uppercase tracking-wide leading-tight mb-2">{cat.name}</p>
                  <p className="text-[11px] text-neutral-400 mb-4 leading-relaxed">{cat.sub}</p>
                  <p className="text-[14px] font-bold text-neutral-900">{cat.prix}€</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 md:mt-10 text-center">
            <Link
              href={`/${lang}/shop`}
              className="inline-block px-8 md:px-10 py-3 md:py-3.5 rounded-full text-[13px] md:text-[14px] font-bold text-white uppercase tracking-wide hover:opacity-90 transition-all"
              style={{ background: '#ED9446' }}
            >
              {lang === 'fr' ? 'Voir tout' : lang === 'en' ? 'Shop all' : 'Alles bekijken'}
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SLIDER 5 PRODUITS
      ══════════════════════════════════════════ */}
      <section className="w-full py-10 md:py-14" style={{ background: '#efede9' }}>
        <div className="max-w-[1400px] mx-auto px-4 md:px-5 relative">

          <button
            onClick={() => setProductSlide((prev) => (prev - 1 + productSlides.length) % productSlides.length)}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white rounded-full shadow hover:bg-neutral-100 items-center justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div
            className="relative w-full overflow-hidden rounded-2xl md:rounded-3xl"
            style={{ minHeight: '300px' }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchStartX === null) return
              const diff = touchStartX - e.changedTouches[0].clientX
              if (Math.abs(diff) > 40) {
                diff > 0
                  ? setProductSlide((p) => (p + 1) % productSlides.length)
                  : setProductSlide((p) => (p - 1 + productSlides.length) % productSlides.length)
              }
              setTouchStartX(null)
            }}
          >
            {productSlides.map((slide, i) => (
              <div
                key={i}
                className="transition-all duration-700"
                style={{
                  background: slide.bg,
                  opacity: productSlide === i ? 1 : 0,
                  position: productSlide === i ? 'relative' : 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: productSlide === i ? 'translateX(0)' : 'translateX(60px)',
                  pointerEvents: productSlide === i ? 'auto' : 'none',
                  padding: 'clamp(20px, 5vw, 48px)',
                }}
              >
                <div className="flex flex-col md:grid md:grid-cols-2 md:gap-10 md:items-center gap-5">
                  <div className="flex justify-center items-center order-1 md:order-2">
                    <img
                      src={slide.image1}
                      className="object-contain drop-shadow-xl"
                      style={{ width: 'clamp(100px, 45vw, 300px)' }}
                    />
                    <img
                      src={slide.image2}
                      className="object-contain drop-shadow-xl -ml-10 md:-ml-14 rotate-12"
                      style={{ width: 'clamp(100px, 45vw, 300px)' }}
                    />
                  </div>
                  <div className="space-y-3 md:space-y-4 order-2 md:order-1 md:pl-5">
                    <div className="text-[10px] md:text-xs font-bold text-neutral-400 uppercase tracking-widest">
                      {LANG_LABEL}
                    </div>
                    <h2
                      className="font-black text-neutral-800 whitespace-pre-line"
                      style={{ fontSize: 'clamp(22px, 4vw, 42px)', lineHeight: 1.05 }}
                    >
                      {slide.title}
                    </h2>
                    <p className="text-neutral-600 leading-relaxed" style={{ fontSize: 'clamp(12px, 3vw, 14px)' }}>
                      {slide.desc}
                    </p>
                    <div className="flex gap-5 md:gap-10 font-semibold uppercase tracking-wider" style={{ fontSize: 'clamp(10px, 2vw, 11px)', color: '#5a4a3a' }}>
                      <span>NO SUGAR</span>
                      <span>VEGAN</span>
                      <span>LOCAL</span>
                    </div>
                    <div className="flex gap-2.5 md:gap-4 flex-wrap pt-1 md:pt-5">
                      <Link href={slide.productLink}>
                        <span className="inline-block px-5 md:px-6 py-2.5 md:py-3 rounded-full text-[12px] font-bold text-white uppercase" style={{ background: '#ED9446' }}>
                           {lang === 'fr' ? 'Découvrir' : lang === 'en' ? 'shop now' : 'Koop nu'}
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setProductSlide((prev) => (prev + 1) % productSlides.length)}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white rounded-full shadow hover:bg-neutral-100 items-center justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="flex justify-center gap-2 mt-5 md:mt-6">
            {productSlides.map((_, i) => (
              <div
                key={i}
                onClick={() => setProductSlide(i)}
                className="cursor-pointer transition-all"
                style={{
                  width: productSlide === i ? '22px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: productSlide === i ? '#ED9446' : '#ccc',
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CRÉEZ VOTRE ROUTINE
      ══════════════════════════════════════════ */}
      <PackSection
        title={lang === 'fr' ? 'Créez votre pack' : lang === 'en' ? 'Create your pack' : 'Maak je pack'}
        subtitle={lang === 'fr' ? "Choisissez vos produits et composez la routine qui vous ressemble jusqu'à -30%" : lang === 'en' ? 'Choose your products and build your routine up to -30%' : 'Kies uw producten en stel uw routine samen tot -30%'}
        packLabel={lang === 'fr' ? 'Mon pack personnalisé :' : lang === 'en' ? 'My custom pack:' : 'Mijn persoonlijk pakket:'}
        oneTimeLabel={lang === 'fr' ? 'Achat unique' : lang === 'en' ? 'One-time purchase' : 'Eenmalig'}
        subLabel="Abonnement"
        monthLabel={lang === 'fr' ? 'mois' : lang === 'en' ? 'month' : 'maand'}
        addedLabel={lang === 'fr' ? 'Produits ajoutés au panier !' : lang === 'en' ? 'Products added to cart!' : 'Producten toegevoegd!'}
      />

      {/* ══ ABONNEMENT ══ */}
      <section className="py-10 px-4 md:px-16" style={{ background: '#f5f3ef' }}>
        <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h2 className="font-black leading-tight text-neutral-900"
              style={{ fontSize: 'clamp(28px, 4vw, 48px)', whiteSpace: 'pre-line' }}>
              {lang === 'fr' ? 'Une routine sans efforts ?\nPrenez un abonnement !' : lang === 'en' ? 'Effortless routine?\nGet a subscription!' : 'Routine zonder moeite?\nNeem een abonnement!'}
            </h2>
            <p className="text-sm text-neutral-500">
              {lang === 'fr' ? 'Recevez automatiquement vos formules. À votre rythme. Sans engagement.' : lang === 'en' ? 'Receive your formulas automatically. At your pace. No commitment.' : 'Ontvang automatisch uw formules. Op uw tempo. Zonder engagement.'}
            </p>
            <div className="space-y-6">
              {subBenefits.map((b, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="text-neutral-400 mt-0.5 flex-shrink-0">{b.icon}</div>
                  <div>
                    <p className="font-bold text-neutral-900 text-[15px]">{b.title}</p>
                    <p className="text-neutral-500 text-[13px]">{b.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 flex-wrap pt-2">
              <Link href={`/${lang}/subscription`}
                className="px-6 py-3 rounded-full text-[13px] font-bold text-white uppercase tracking-wide"
                style={{ background: '#ED9446' }}>
                {lang === 'fr' ? 'Voir les produits' : lang === 'en' ? 'See products' : 'Bekijken'}
              </Link>
            </div>
          </div>

          {/* Pots — mobile : côte à côte en bas, desktop : empilés à droite */}

          {/* Mobile */}
          <div className="flex justify-center items-end gap-4 mt-4 md:hidden">
            {[
              { src: '/image/nukuViolet.png', w: 110, rot: -6, mb: 0 },
              { src: '/image/nukuRouge.png', w: 130, rot: 0, mb: 10 },
              { src: '/image/nukuBleu.png', w: 110, rot: 6, mb: 0 },
            ].map((p, i) => (
              <img key={i} src={p.src} alt="nuku pot"
                className="object-contain drop-shadow-lg"
                style={{
                  width: `${p.w}px`,
                  transform: `rotate(${p.rot}deg)`,
                  marginBottom: `${p.mb}px`,
                }} />
            ))}
          </div>

          {/* Desktop */}
          <div className="hidden md:flex flex-col items-end gap-3">
            {[
              { src: '/image/nukuRouge.png', w: 150, mr: 0, rot: -4 },
              { src: '/image/nukuViolet.png', w: 135, mr: 20, rot: 4 },
              { src: '/image/nukuBleu.png', w: 120, mr: 40, rot: -4 },
            ].map((p, i) => (
              <img key={i} src={p.src} alt="nuku pot"
                className="object-contain drop-shadow-lg"
                style={{
                  width: `${p.w}px`,
                  marginRight: `${p.mr}px`,
                  transform: `rotate(${p.rot}deg)`,
                }} />
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════
          AVIS CLIENTS
      ══════════════════════════════════════════ */}
      <section className="py-8 md:py-12 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 md:px-16">
          <h2
            className="text-xl md:text-4xl font-black text-neutral-900 mb-1 md:mb-2"
            style={{ fontFamily: "'Georgia',serif" }}
          >
            {lang === 'fr' ? 'Vous en parlez mieux que nous !' : lang === 'en' ? 'You say it best!' : 'U zegt het beter dan wij!'}
          </h2>
          <p className="text-[11px] md:text-[13px] text-neutral-400 mb-6 md:mb-10">
            {lang === 'fr'
              ? 'Votre confiance et votre fidélité sont notre priorité.'
              : lang === 'en'
              ? 'Your trust and loyalty are our priority.'
              : 'Uw vertrouwen en loyaliteit zijn onze prioriteit.'}
          </p>

          {/* Mobile — scroll horizontal */}
          <div className="flex md:hidden gap-3 overflow-x-auto pb-4 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
            {reviews.map((r, i) => (
              <div key={i} className="flex-none snap-start w-[200px] bg-white rounded-xl border border-neutral-100 shadow-sm p-3.5">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-[9px] font-bold text-neutral-500">{r.initials}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-neutral-800 truncate">{r.name}</p>
                    <p className="text-[9px] text-neutral-400">
                      {lang === 'fr' ? 'Acheteur vérifié ✓' : lang === 'en' ? 'Verified buyer ✓' : 'Geverifieerde koper ✓'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-1.5">
                  {Array.from({ length: r.stars }).map((_, j) => (
                    <svg key={j} className="w-2.5 h-2.5" fill="#f97316" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[11px] font-semibold text-neutral-800 mb-1">{r.title}</p>
                <p className="text-[10px] text-neutral-500 leading-relaxed line-clamp-3">"{r.text}"</p>
              </div>
            ))}
          </div>

          {/* Desktop — grid 5 colonnes */}
          <div className="hidden md:grid grid-cols-5 gap-5">
            {reviews.map((r, i) => (
              <div key={i} className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 hover:shadow-md transition-all">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-[11px] font-bold text-neutral-500">{r.initials}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-neutral-800 truncate">{r.name}</p>
                    <p className="text-[10px] text-neutral-400">
                      {lang === 'fr' ? 'Acheteur vérifié ✓' : lang === 'en' ? 'Verified buyer ✓' : 'Geverifieerde koper ✓'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: r.stars }).map((_, j) => (
                    <svg key={j} className="w-3.5 h-3.5" fill="#f97316" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[13px] font-bold text-neutral-800 mb-1.5">{r.title}</p>
                <p className="text-[11px] text-neutral-500 leading-relaxed">"{r.text}"</p>
              </div>
            ))}
          </div>

          <div className="mt-8 md:mt-10 text-center">
            <Link
              href={`/${lang}/shop`}
              className="inline-flex items-center gap-2 px-7 md:px-8 py-3 md:py-3.5 rounded-full text-[13px] font-bold text-white uppercase tracking-wide hover:opacity-90 transition-all"
              style={{ background: '#ED9446' }}
            >
              {lang === 'fr' ? 'Voir les produits' : lang === 'en' ? 'See products' : 'Bekijken'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}