"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "@/lib/contexts/CartContext";
import RatingStars from "@/components/RatingStars";
import { motion } from "framer-motion";
import ProductReviews from "@/app/components/ProductReview";
import useEmblaCarousel from "embla-carousel-react";
import { useTranslations } from "next-intl";

type DbProduct = {
  id: number; nom: string; prix: number; tagline?: string | null; story?: string | null;
  description?: string | null; images?: string[] | null; benefits?: string[] | null;
  ingredients?: string[] | null; usage_instructions?: string | null; gummies_per_jar?: number | null;
  flavor?: string | null; shipping_note?: string | null; category?: string | null;
};

type ProductKey = "sleep" | "shine" | "source" | "strength" | "soul";
type ProductHighlight = { emoji: string; text: string };
type ProductConfig = {
  key: ProductKey; folder: string; emoji: string; highlights: ProductHighlight[];
  routineTitle: string; routineSubtitle: string; routineIntro: string; routineSub: string;
  routineTips: string[]; routineNote: string; mythsTitle: string;
  myths: { id: number; myth: string; reality: string }[];
  faqTitle: string; faqSubtitle: string; faqs: { id: number; question: string; answer: string }[];
};

const HIGHLIGHT_EMOJIS: Record<ProductKey, string[]> = {
  sleep:    ["🫐", "🌙", "🧘‍♂️", "😴"],
  shine:    ["🍋", "💇", "🧬", "✨"],
  source:   ["🍎", "🌿", "💨", "⚖️"],
  strength: ["🍉", "⚡", "🏃", "🧠"],
  soul:     ["🍒", "🧘", "🧠", "🌿"],
};

const PRODUCT_EMOJIS: Record<ProductKey, string> = {
  sleep: "🌙", shine: "✨", source: "🌿", strength: "💪", soul: "🕊️",
};

const INGREDIENT_IMAGES: Record<string, { path: string; label: string; benefit: string }> = {
  "sleep-melatonine":  { path: "/image/sleep/melatonin.jpg",    label: "Mélatonine",   benefit: "Aide à réduire le temps d'endormissement et à réguler le rythme veille-sommeil." },
  "sleep-theanine":    { path: "/image/sleep/l-theanine.jpg",   label: "L-théanine",   benefit: "Favorise la détente et la relaxation sans provoquer de somnolence." },
  "sleep-gaba":        { path: "/image/sleep/gaba.jpg",         label: "GABA",         benefit: "Aide à apaiser le mental et à favoriser un état de calme propice au sommeil." },
  "sleep-valeriane":   { path: "/image/sleep/valeriane.jpg",    label: "Valériane",    benefit: "Contribue à un sommeil de qualité et facilite l'endormissement." },
  "sleep-passiflore":  { path: "/image/sleep/passiflore.jpg",   label: "Passiflore",   benefit: "Aide à réduire le stress et la nervosité pour mieux se préparer au sommeil." },
  "sleep-magnesium":   { path: "/image/sleep/magnesium.jpg",    label: "Magnésium",    benefit: "Réduit la fatigue et contribue au fonctionnement normal du système nerveux." },
  "sleep-vitb6":       { path: "/image/sleep/vitamine-b6.jpg",  label: "Vitamine B6",  benefit: "Contribue au fonctionnement normal du système nerveux et réduit la fatigue." },
  "shine-biotine":     { path: "/image/shine/Biotine .jpg",              label: "Biotine",             benefit: "Contribue au maintien de cheveux normaux et d'ongles normaux." },
  "shine-roquette":    { path: "/image/shine/Extrait de roquette .jpg",  label: "Extrait de roquette", benefit: "Riche en antioxydants, soutient l'éclat et la vitalité de la peau." },
  "shine-msm":         { path: "/image/shine/MSM.jpg",                   label: "MSM",                 benefit: "Contribue à la souplesse de la peau et au maintien du collagène." },
  "shine-silicium":    { path: "/image/shine/Silicium.jpg",              label: "Silicium",            benefit: "Soutient la résistance des cheveux, des ongles et l'élasticité de la peau." },
  "shine-vitb6":       { path: "/image/shine/Vitamine B6.jpg",           label: "Vitamine B6",         benefit: "Contribue au fonctionnement normal du système nerveux et à la réduction de la fatigue." },
  "shine-zinc":        { path: "/image/shine/Zinc.jpg",                  label: "Zinc",                benefit: "Contribue au maintien d'une peau normale et à la protection contre le stress oxydatif." },
  "shine-vitd3":       { path: "/image/shine/Vitamine D3.jpg",           label: "Vitamine D3",         benefit: "Contribue au maintien d'une fonction musculaire normale et soutient le système immunitaire." },
  "source-chlorella":  { path: "/image/source/Chlorella .jpg",                       label: "Chlorella",   benefit: "Microalgue riche en chlorophylle, soutient la détoxification naturelle de l'organisme." },
  "source-curcuma":    { path: "/image/source/Curcuma.jpg",                          label: "Curcuma",     benefit: "Contribue à réduire l'inflammation et soutient les défenses naturelles de l'organisme." },
  "source-pissenlit":  { path: "/image/source/Extrait de racine de pissenlit .jpg",  label: "Pissenlit",   benefit: "Soutient la fonction hépatique et contribue à la digestion normale." },
  "source-artichaut":  { path: "/image/source/artichaut.jpg",                        label: "Artichaut",   benefit: "Favorise une digestion normale et contribue au bon fonctionnement du foie." },
  "source-matcha":     { path: "/image/source/Matcha.jpg",                           label: "Matcha",      benefit: "Source d'antioxydants, soutient l'énergie et la concentration au quotidien." },
  "source-vitb6":      { path: "/image/source/Vitamine B6.jpg",                      label: "Vitamine B6", benefit: "Contribue au fonctionnement normal du système nerveux et au métabolisme énergétique." },
  "strength-creatine": { path: "/image/strength/monohydrate.jpg",    label: "Créatine monohydrate", benefit: "Augmente les performances physiques lors d'exercices intenses et répétés." },
  "strength-vitb12":   { path: "/image/strength/Vitamine B12.jpg",   label: "Vitamine B12",         benefit: "Contribue à réduire la fatigue et soutient le métabolisme énergétique normal." },
  "strength-vitd3":    { path: "/image/strength/Vitamine D3.jpg",    label: "Vitamine D3",          benefit: "Contribue au maintien d'une fonction musculaire normale et soutient la récupération." },
  "soul-ashwagandha":  { path: "/image/soul/Ashwagandha ksm 66.jpg", label: "Ashwagandha KSM-66", benefit: "Aide à réduire le stress et à améliorer la résistance mentale et physique au stress." },
  "soul-gaba":         { path: "/image/soul/Gaba.jpg",               label: "GABA",               benefit: "Aide à apaiser le mental et à favoriser un état de calme et de sérénité." },
  "soul-theanine":     { path: "/image/soul/L-theanine.jpg",         label: "L-théanine",         benefit: "Favorise la détente et la relaxation sans provoquer de somnolence." },
  "soul-rhodiola":     { path: "/image/soul/Rhodiola.jpg",           label: "Rhodiola",           benefit: "Contribue à réduire la fatigue et soutient l'équilibre émotionnel." },
  "soul-safran":       { path: "/image/soul/Safran.jpg",             label: "Safran",             benefit: "Contribue à l'équilibre de l'humeur et favorise un état émotionnel positif." },
  "soul-vitb6":        { path: "/image/soul/Vitamine b6.jpg",        label: "Vitamine B6",        benefit: "Contribue au fonctionnement normal du système nerveux." },
};

const euroFmt = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });

function getProductKey(product: DbProduct): ProductKey | null {
  const rawNom = (product.nom ?? "").toLowerCase();
  const rawCat = (product.category ?? "").toLowerCase();
  const normalize = (s: string) => s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s-]/g, " ").replace(/\s+/g, " ").trim();
  const nom = normalize(rawNom);
  let cat = normalize(rawCat);
  if (cat === "strenght") cat = "strength";
  const KNOWN: ProductKey[] = ["sleep", "shine", "source", "strength", "soul"];
  if (KNOWN.includes(cat as ProductKey)) return cat as ProductKey;
  if (nom.includes("sleep"))    return "sleep";
  if (nom.includes("shine"))    return "shine";
  if (nom.includes("source"))   return "source";
  if (nom.includes("strength")) return "strength";
  if (nom.includes("soul"))     return "soul";
  return null;
}

/* ── Image Gallery ── */
function ProductImageGallery({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const goTo = (index: number) => {
    const next = (index + images.length) % images.length;
    setCurrentIndex(next);
    const container = thumbsRef.current;
    if (container) { const thumb = container.children[next] as HTMLElement; if (thumb) thumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" }); }
  };
  if (!images.length) return null;
  return (
    <div className="pg-wrap">
      <div className="pg-main">
        <img key={currentIndex} src={images[currentIndex]} alt={`Photo produit ${currentIndex + 1}`} className="pg-img" draggable={false} loading="lazy" />
        {images.length > 1 && (
          <>
            <button className="pg-arrow pg-arrow-prev" onClick={() => goTo(currentIndex - 1)} aria-label="Image précédente">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className="pg-arrow pg-arrow-next" onClick={() => goTo(currentIndex + 1)} aria-label="Image suivante">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <div className="pg-counter" aria-live="polite">{currentIndex + 1} / {images.length}</div>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="pg-thumbs" ref={thumbsRef} role="list">
          {images.map((src, i) => (
            <button key={i} className={`pg-thumb ${i === currentIndex ? "pg-thumb-active" : ""}`} onClick={() => goTo(i)} aria-label={`Voir image ${i + 1}`} aria-current={i === currentIndex} role="listitem">
              <img src={src} alt={`Miniature ${i + 1}`} draggable={false} />
            </button>
          ))}
        </div>
      )}
      <style jsx>{`
        .pg-wrap{display:flex;flex-direction:column;gap:12px;width:100%;user-select:none;}
        .pg-main{position:relative;width:100%;aspect-ratio:1/1;border-radius:32px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:transparent;}
        .pg-img{height:90%;width:90%;object-fit:contain;position:relative;z-index:1;filter:drop-shadow(0 20px 35px rgba(0,0,0,0.22));animation:pgFade 0.22s ease;}
        @keyframes pgFade{from{opacity:0.4;transform:scale(0.97);}to{opacity:1;transform:scale(1);}}
        .pg-arrow{position:absolute;top:50%;transform:translateY(-50%);z-index:10;width:44px;height:44px;border-radius:50%;border:none;background:rgba(255,255,255,0.90);color:#1a1a1a;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 14px rgba(0,0,0,0.13);transition:background 0.2s,box-shadow 0.2s,transform 0.2s;}
        .pg-arrow:hover{background:#fff;box-shadow:0 4px 20px rgba(0,0,0,0.18);}
        .pg-arrow:active{transform:translateY(-50%) scale(0.91);}
        .pg-arrow-prev{left:14px;}.pg-arrow-next{right:14px;}
        .pg-counter{position:absolute;bottom:14px;right:16px;z-index:10;background:rgba(0,0,0,0.42);color:#fff;font-size:12px;font-weight:600;padding:3px 11px;border-radius:20px;backdrop-filter:blur(6px);letter-spacing:0.05em;}
        .pg-thumbs{display:flex;gap:8px;overflow-x:auto;scroll-behavior:smooth;padding-bottom:2px;scrollbar-width:none;}
        .pg-thumbs::-webkit-scrollbar{display:none;}
        .pg-thumb{flex-shrink:0;width:72px;height:72px;border-radius:12px;overflow:hidden;border:2px solid transparent;background:#f0ede8;cursor:pointer;padding:0;opacity:0.60;transition:opacity 0.2s,border-color 0.2s,transform 0.2s;}
        .pg-thumb:hover{opacity:0.85;transform:scale(1.04);}
        .pg-thumb-active{border-color:#ef8035;opacity:1;transform:scale(1.05);}
        .pg-thumb img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;}
        @media(max-width:480px){.pg-thumb{width:58px;height:58px;}.pg-arrow{width:38px;height:38px;}}
      `}</style>
    </div>
  );
}

/* ── Highlights ── */
function ProductHighlights({ highlights }: { highlights: ProductHighlight[] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}
      className="grid grid-cols-2 gap-x-6 gap-y-4 mt-5 pt-5 border-t border-neutral-100">
      {highlights.map((h, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-2xl leading-none select-none flex-shrink-0" aria-hidden>{h.emoji}</span>
          <span className="text-[14px] text-neutral-700 leading-snug">{h.text}</span>
        </div>
      ))}
    </motion.div>
  );
}

/* ── Benefits ── */
function getBenefitEmoji(text: string) {
  const t = text.toLowerCase();
  if (t.includes("endorm") || t.includes("sleep") || t.includes("slaap")) return "🌙";
  if (t.includes("stress")) return "🧘";
  if (t.includes("humeur") || t.includes("mood") || t.includes("stemming")) return "😊";
  if (t.includes("fatigue") || t.includes("tired") || t.includes("vermoei")) return "🔋";
  if (t.includes("sommeil") || t.includes("dorm") || t.includes("slaap")) return "😴";
  if (t.includes("immun") || t.includes("défense") || t.includes("defense")) return "🛡️";
  if (t.includes("cheveu") || t.includes("peau") || t.includes("hair") || t.includes("haar")) return "💆";
  if (t.includes("force") || t.includes("muscu") || t.includes("strength") || t.includes("spier")) return "💪";
  if (t.includes("énergi") || t.includes("energy") || t.includes("energie")) return "⚡";
  return "✔️";
}

function chunkTwo<T>(arr: T[]): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += 2) out.push(arr.slice(i, i + 2));
  return out;
}

function BenefitsNoMiddle({ benefits }: { benefits: string[] }) {
  const rows = chunkTwo(benefits);
  return (
    <div className="mt-3">
      {rows.map((row, idx) => (
        <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5 py-1">
          {row.map((text, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-xl md:text-2xl leading-none select-none" aria-hidden>{getBenefitEmoji(text)}</span>
              <span className="text-[15px] md:text-base text-neutral-800">{text}</span>
            </div>
          ))}
          {row.length === 1 && <div className="hidden md:block" />}
        </div>
      ))}
    </div>
  );
}

/* ── Ingredients Slider ── */
function IngredientsSlider({ productKey, t }: { productKey: ProductKey | null; t: any }) {
  const allIngredients = useMemo(() => {
    if (!productKey) return [];
    const out: { label: string; image: string; benefit: string }[] = [];
    Object.entries(INGREDIENT_IMAGES).forEach(([key, value]) => {
      if (key.startsWith(productKey + "-")) {
        // Récupère le bienfait traduit, fallback sur le français si absent
        let benefit: string;
        try {
          benefit = t(`ingredient_benefits.${key}`);
        } catch {
          benefit = value.benefit;
        }
        out.push({ label: value.label, image: value.path, benefit });
      }
    });
    return out;
  }, [productKey, t]);

  const total = allIngredients.length;
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: total > 3, align: "center", containScroll: false, slidesToScroll: 1, dragFree: false });
  const [activeIndex, setActiveIndex] = useState(Math.floor(total / 2));
  const [openBenefitIndex, setOpenBenefitIndex] = useState<number | null>(null);
  const [isTouch, setIsTouch] = useState(false);
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  useEffect(() => { setIsTouch(window.matchMedia("(hover: none), (pointer: coarse)").matches); }, []);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
    setOpenBenefitIndex(null);
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.scrollTo(Math.floor(total / 2), true);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); emblaApi.off("reInit", onSelect); };
  }, [emblaApi, onSelect, total]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (!total) return null;

  const desktopSlotsForWidth = Math.min(total >= 5 ? 5 : total || 1, 5);
  const wrapMaxWidth = desktopSlotsForWidth === 5 ? "1200px" : desktopSlotsForWidth === 4 ? "980px" : desktopSlotsForWidth === 3 ? "760px" : desktopSlotsForWidth === 2 ? "520px" : "320px";
  const slideWidthDesktop = total <= 2 ? "100%" : total === 3 ? "42%" : total === 4 ? "30%" : total === 5 ? "22%" : "21%";
  const activeScale = total === 3 ? 1.14 : total >= 6 ? 1.1 : 1.08;

  return (
    <section className="ing-section">
      <div className="luxury-header">
        <span className="luxury-badge">{t("ingredients_badge")}</span>
        <h2 className="luxury-title">{t("ingredients_title_section")}</h2>
        <div className="luxury-divider"></div>
        <p className="luxury-subtitle">{t("ingredients_subtitle")}</p>
      </div>
      <div className="ing-wrap" data-few={total <= 3 ? "true" : undefined} style={{ ["--active-scale" as any]: activeScale } as React.CSSProperties}>
        <div className="ing-viewport" ref={emblaRef}>
          <div className="ing-container">
            {allIngredients.map((item, i) => {
              const isActive = i === activeIndex;
              const benefitOpen = isTouch && openBenefitIndex === i;
              return (
                <div key={`${item.label}-${i}`} className="ing-slide">
                  <div className={`ing-card ${isActive ? "ing-card--active" : ""}`}
                    onClick={() => { if (!isActive) emblaApi?.scrollTo(i); }}
                    role={!isActive ? "button" : undefined} tabIndex={!isActive ? 0 : undefined}>
                    <h4 className="ing-card-name">{item.label}</h4>
                    <div className="ing-img-wrap"><img src={item.image} alt={item.label} loading="lazy" draggable={false} /></div>
                    <div className={`ing-benefit ${benefitOpen ? "ing-benefit--open" : ""}`}><p>{item.benefit}</p></div>
                    {isActive && isTouch && (
                      <button type="button" className={`ing-touch-btn ${benefitOpen ? "ing-touch-btn--open" : ""}`}
                        aria-label={benefitOpen ? t("hide_benefit") : t("show_benefit")}
                        onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); setOpenBenefitIndex(benefitOpen ? null : i); }}>
                        {benefitOpen
                          ? <svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>
                          : <svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {!isTouch && (
          <>
            <button className="ing-nav-btn ing-nav-prev" onClick={scrollPrev} disabled={!prevBtnEnabled && !(total > 3)} aria-label="Précédent">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M12.5 5L7.5 10l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className="ing-nav-btn ing-nav-next" onClick={scrollNext} disabled={!nextBtnEnabled && !(total > 3)} aria-label="Suivant">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M7.5 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </>
        )}
      </div>
      <style jsx>{`
        .luxury-header{text-align:center;margin-bottom:50px;padding-top:52px;}
        .luxury-badge{text-transform:uppercase;letter-spacing:3px;font-size:11px;color:#b58e58;font-weight:700;}
        .luxury-title{font-size:40px;font-weight:300;margin:10px 0;}
        .luxury-divider{width:40px;height:1px;background:#b58e58;margin:15px auto;}
        .luxury-subtitle{font-size:14px;color:#888;font-weight:300;}
        .ing-section{margin-top:80px;width:100vw;position:relative;left:50%;right:50%;margin-left:-50vw;margin-right:-50vw;background:#fff;padding-bottom:52px;}
        .ing-wrap{position:relative;max-width:${wrapMaxWidth};margin:0 auto;padding:20px 0 8px;width:100%;}
        .ing-wrap::before,.ing-wrap::after{content:"";position:absolute;top:0;bottom:0;width:40px;z-index:5;pointer-events:none;}
        .ing-wrap::before{left:0;background:linear-gradient(to right,#fff 0%,rgba(255,255,255,0) 100%);}
        .ing-wrap::after{right:0;background:linear-gradient(to left,#fff 0%,rgba(255,255,255,0) 100%);}
        .ing-wrap[data-few="true"]::before,.ing-wrap[data-few="true"]::after{display:none;}
        .ing-viewport{overflow:hidden;padding:16px 0;}
        .ing-container{display:flex;user-select:none;-webkit-touch-callout:none;gap:20px;}
        .ing-slide{flex:0 0 50%;min-width:0;display:flex;align-items:center;justify-content:center;}
        @media(min-width:480px){.ing-slide{flex:0 0 36%;}}
        @media(min-width:900px){.ing-slide{flex:0 0 ${slideWidthDesktop};}}
        .ing-card{width:100%;background:#fff;border-radius:20px;border:none;box-shadow:0 4px 18px rgba(0,0,0,0.07);display:flex;flex-direction:column;align-items:center;padding:16px 14px 14px;gap:10px;cursor:pointer;transform:scale(0.82);opacity:0.50;filter:saturate(0.6) brightness(1.02);transform-origin:center center;transition:transform 0.4s cubic-bezier(0.34,1.26,0.64,1),opacity 0.35s ease,box-shadow 0.35s ease,filter 0.35s ease;}
        .ing-card--active{transform:scale(var(--active-scale,1.08));opacity:1;filter:none;box-shadow:0 12px 36px rgba(180,130,80,0.18),0 4px 12px rgba(0,0,0,0.07);cursor:default;}
        .ing-card-name{font-size:13px;font-weight:700;color:#2f261f;margin:0;text-align:center;opacity:0;transition:opacity 0.3s ease;}
        @media(hover:hover) and (pointer:fine){.ing-card--active .ing-card-name{opacity:1;}}
        @media(hover:none),(pointer:coarse){.ing-card--active .ing-card-name{opacity:1;}}
        .ing-img-wrap{width:100%;aspect-ratio:1/1;border-radius:14px;overflow:hidden;}
        .ing-img-wrap img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;user-select:none;transition:transform 0.32s ease;}
        @media(hover:hover) and (pointer:fine){.ing-card--active:hover .ing-img-wrap img{transform:scale(1.06);}}
        .ing-benefit{width:100%;max-height:0;overflow:hidden;opacity:0;transition:max-height 0.4s cubic-bezier(0.4,0,0.2,1),opacity 0.3s ease;}
        .ing-benefit p{margin:0;font-size:12px;line-height:1.65;color:#5a3e2b;font-style:italic;text-align:center;padding:4px 0;}
        @media(hover:hover) and (pointer:fine){.ing-card--active .ing-img-wrap:hover ~ .ing-benefit{max-height:120px;opacity:1;}}
        .ing-benefit--open{max-height:120px!important;opacity:1!important;}
        .ing-touch-btn{width:28px;height:28px;border-radius:50%;border:1.5px solid rgba(180,130,80,0.4);background:#fff;color:#3b2a22;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;touch-action:manipulation;-webkit-tap-highlight-color:transparent;}
        .ing-touch-btn--open{background:#ef8035;border-color:#ef8035;color:#fff;}
        .ing-nav-btn{position:absolute;top:50%;transform:translateY(-50%);width:42px;height:42px;border-radius:50%;border:1.5px solid rgba(180,130,80,0.3);background:#fff;color:#3b2a22;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,0.07);transition:all 0.2s ease;z-index:10;}
        .ing-nav-btn:disabled{opacity:0.3;cursor:default;}
        .ing-nav-prev{left:4px;}.ing-nav-next{right:4px;}
        .ing-nav-btn:not(:disabled):hover{background:#fff;border-color:rgba(239,128,53,0.5);transform:translateY(-50%) scale(1.07);}
        .ing-nav-btn:not(:disabled):active{transform:translateY(-50%) scale(0.94);}
        @media(hover:none),(pointer:coarse){.ing-nav-btn{display:none!important;}.ing-wrap::before,.ing-wrap::after{width:30px;}}
        @media(max-width:899px){.ing-wrap{max-width:100%!important;}}
        @media(prefers-reduced-motion:reduce){.ing-card,.ing-img-wrap img,.ing-benefit{transition:none!important;}}
      `}</style>
    </section>
  );
}

/* ── Routine Section ── */
function ProductRoutineSection({ config, t }: { config: ProductConfig; t: any }) {
  const { folder, emoji, routineTitle, routineSubtitle, routineIntro, routineSub, routineTips, routineNote } = config;
  const cleanTitle = routineTitle.replace(/^[\p{Emoji}\s]+/u, "").replace(/Optimiser/i, "Optimisez").replace(/Optimise/i, "Optimise").replace(/Optimaliseer/i, "Optimaliseer");
  return (
    <section className="routine-section">
      <div className="routine-inner">
        <div className="routine-left">
          <p className="routine-eyebrow">{t("ritual_eyebrow")}</p>
          <h2 className="routine-title">{cleanTitle}</h2>
          <p className="routine-intro">{routineIntro}</p>
          {routineSub && <p className="routine-sub">{routineSub}</p>}
          <div className="routine-img-wrap"><img src={`/image/${folder}/${folder}1.png`} alt="Rituel" className="routine-img" /></div>
        </div>
        <div className="routine-right">
          <div className="routine-card-header">
            <span className="routine-emoji">{emoji}</span>
            <div>
              <p className="routine-card-label">{t("protocol_label")}</p>
              <p className="routine-card-subtitle">{routineSubtitle}</p>
            </div>
          </div>
          <ol className="routine-tips">
            {routineTips.map((tip, i) => (
              <li key={i} className="routine-tip"><p>{tip}</p></li>
            ))}
          </ol>
          {routineNote && <p className="routine-note">"{routineNote}"</p>}
        </div>
      </div>
      <style jsx>{`
        .routine-section{padding:80px 24px;background:#fff;}
        .routine-inner{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:start;}
        .routine-left{position:sticky;top:90px;}
        .routine-eyebrow{font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#b58e58;margin:0 0 16px;font-weight:400;}
        .routine-title{font-family:'Cormorant Garamond',Georgia,serif;font-size:clamp(34px,4vw,52px);font-weight:300;line-height:1.1;color:#1a1a1a;margin:0 0 24px;letter-spacing:-0.01em;}
        .routine-intro{font-size:15px;line-height:1.75;color:#666;font-weight:300;margin:0 0 16px;}
        .routine-sub{font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:18px;color:#9a8a78;margin:0;line-height:1.5;font-weight:300;}
        .routine-img-wrap{margin-top:40px;border-radius:4px;overflow:hidden;aspect-ratio:3/4;max-width:400px;}
        .routine-img{width:100%;height:100%;object-fit:cover;display:block;transition:transform 0.7s ease;}
        .routine-img-wrap:hover .routine-img{transform:scale(1.03);}
        .routine-card-header{display:flex;align-items:flex-start;gap:14px;padding-bottom:24px;border-bottom:1px solid #e8e0d6;margin-bottom:8px;}
        .routine-emoji{font-size:22px;flex-shrink:0;margin-top:2px;}
        .routine-card-label{font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#b58e58;margin:0 0 4px;font-weight:400;}
        .routine-card-subtitle{font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#1a1a1a;margin:0;font-weight:400;line-height:1.4;}
        .routine-tips{list-style:none;padding:0;margin:0;}
        .routine-tip{padding:20px 0;border-bottom:1px solid #f0ece6;}
        .routine-tip:last-child{border-bottom:none;}
        .routine-tip p{font-size:14px;line-height:1.75;color:#4a4a4a;margin:0;font-weight:300;}
        .routine-note{font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:16px;font-weight:300;color:#9a8a78;margin:32px 0 0;line-height:1.6;text-align:center;padding-top:24px;border-top:1px solid #e8e0d6;}
        @media(max-width:768px){
          .routine-section{padding:48px 20px 56px;}
          .routine-inner{grid-template-columns:1fr;gap:0;}
          .routine-left{position:static;}
          .routine-img-wrap{display:block;max-width:100%;margin-top:28px;border-radius:20px;aspect-ratio:4/3;}
          .routine-title{font-size:clamp(28px,7vw,36px);margin-bottom:16px;}
          .routine-right{margin-top:36px;}
          .routine-tip{padding:16px 0;}
          .routine-note{font-size:15px;margin-top:24px;padding-top:20px;}
        }
        @media(max-width:480px){.routine-section{padding:40px 20px 48px;}.routine-title{font-size:26px;}}
      `}</style>
    </section>
  );
}

/* ── Myth Accordions ── */
function MythAccordion({ id, myth, reality, realityLabel }: { id: number; myth: string; reality: string; realityLabel: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const el = ref.current; if (!el) return; el.style.maxHeight = isOpen ? `${el.scrollHeight}px` : "0px"; }, [isOpen]);
  useEffect(() => {
    if (!ref.current || !isOpen) return;
    const el = ref.current;
    const ro = new ResizeObserver(() => { el.style.maxHeight = `${el.scrollHeight}px`; });
    ro.observe(el); return () => ro.disconnect();
  }, [isOpen]);
  return (
    <div className={`acc-item ${isOpen ? "open" : ""}`}>
      <button className="acc-btn" onClick={() => setIsOpen(v => !v)} aria-expanded={isOpen} aria-controls={`reality-${id}`}>
        <span className="num" aria-hidden="true">{id}</span>
        <span className="q">{myth}</span>
        <span className={`plus ${isOpen ? "rot" : ""}`} aria-hidden="true">{isOpen ? "×" : "+"}</span>
      </button>
      <div id={`reality-${id}`} className="acc-body" ref={ref} role="region" aria-live="polite">
        <p className="a"><strong>{realityLabel}</strong> {reality}</p>
      </div>
      <style jsx>{`
        .acc-item{border-radius:18px;background:linear-gradient(180deg,#fffdfb 0%,#f9f4ed 100%);border:1.4px solid #e5d8c7;box-shadow:inset 0 0 12px rgba(255,237,220,.45),inset 0 1px 1px rgba(255,255,255,.6);overflow:hidden;transition:box-shadow .25s ease,border-color .25s ease,background .25s ease,transform .2s ease;}
        @media(hover:hover){.acc-item:hover{box-shadow:0 10px 30px rgba(0,0,0,.10),inset 0 0 14px rgba(255,240,225,.45);transform:translateY(-1px);}}
        .acc-item.open{background:linear-gradient(180deg,#ffffff 0%,#fdf8f3 100%);border-color:#dacbb9;box-shadow:0 10px 22px rgba(0,0,0,.07),inset 0 0 24px rgba(255,235,215,.5);}
        .acc-btn{width:100%;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:16px;padding:18px 22px;background:transparent;border:0;cursor:pointer;text-align:left;transition:background .18s ease;}
        .acc-btn:hover{background:rgba(255,248,236,.7);}
        .num{width:34px;height:34px;display:grid;place-items:center;flex-shrink:0;color:#fff;font-weight:800;font-size:16px;border-radius:50%;background:linear-gradient(135deg,#ffb98f 0%,#ff8d58 100%);box-shadow:0 5px 18px rgba(255,135,90,.42),inset 0 1px 0 rgba(255,255,255,.45);}
        .q{font-weight:600;color:#3f372f;font-size:15.5px;line-height:1.55;letter-spacing:-0.01em;}
        .plus{font-size:22px;color:#9f9f9f;line-height:1;transition:transform .28s ease,color .2s ease;font-weight:300;}
        .plus.rot{color:#ff7b42;animation:pop .25s ease-out;}
        @keyframes pop{0%{transform:scale(.85);}60%{transform:scale(1.1);}100%{transform:scale(1);}}
        .acc-body{max-height:0;overflow:hidden;transition:max-height .35s cubic-bezier(.4,0,.2,1),opacity .25s ease,transform .25s ease;opacity:0;transform:translateY(-4px);}
        .acc-item.open .acc-body{opacity:1;transform:translateY(0);}
        .a{margin:0;padding:0 22px 18px 74px;color:#6a5f57;font-size:15.3px;line-height:1.72;letter-spacing:-0.005em;}
        .a strong{color:#ff7b42;font-weight:600;}
        @media(max-width:640px){.acc-btn{padding:16px 18px;gap:14px;}.num{width:32px;height:32px;font-size:14px;}.q{font-size:14.5px;}.a{padding:0 18px 16px 18px;font-size:14px;}}
        @media(prefers-reduced-motion:reduce){.acc-item,.acc-btn,.acc-body,.plus{transition:none!important;animation:none!important;}}
      `}</style>
    </div>
  );
}

function MythAccordionMobile({ id, myth, reality }: { id: number; myth: string; reality: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const el = ref.current; if (!el) return; el.style.maxHeight = isOpen ? `${el.scrollHeight}px` : "0px"; }, [isOpen]);
  useEffect(() => {
    if (!ref.current || !isOpen) return;
    const el = ref.current;
    const ro = new ResizeObserver(() => { el.style.maxHeight = `${el.scrollHeight}px`; });
    ro.observe(el); return () => ro.disconnect();
  }, [isOpen]);
  return (
    <div className={`ma-item ${isOpen ? "open" : ""}`}>
      <button className="ma-btn" onClick={() => setIsOpen(v => !v)} aria-expanded={isOpen} aria-controls={`ma-reality-${id}`}>
        <span className={`ma-num ${isOpen ? "ma-num--active" : ""}`}>{id}</span>
        <span className="ma-q">{myth}</span>
        <span className="ma-plus" aria-hidden="true">{isOpen ? "−" : "+"}</span>
      </button>
      <div id={`ma-reality-${id}`} className="ma-body" ref={ref} role="region">
        <p className="ma-a">{reality}</p>
      </div>
      <style jsx>{`
        .ma-item{border-bottom:1px solid #e8e2da;}
        .ma-btn{width:100%;display:flex;align-items:center;gap:16px;padding:20px 0;background:transparent;border:0;cursor:pointer;text-align:left;}
        .ma-num{width:36px;height:36px;border-radius:50%;border:2px solid #ef8035;display:grid;place-items:center;font-size:15px;font-weight:700;color:#ef8035;flex-shrink:0;transition:background .2s,color .2s;}
        .ma-num--active{background:#ef8035;color:#fff;}
        .ma-q{flex:1;font-size:16px;font-weight:500;color:#1a1a1a;line-height:1.45;letter-spacing:-0.01em;}
        .ma-plus{font-size:22px;color:#9a9a9a;font-weight:300;flex-shrink:0;line-height:1;}
        .ma-body{max-height:0;overflow:hidden;transition:max-height .35s cubic-bezier(.4,0,.2,1),opacity .25s ease;opacity:0;}
        .ma-item.open .ma-body{opacity:1;}
        .ma-a{margin:0;padding:0 0 20px 52px;font-size:14.5px;line-height:1.75;color:#666;font-weight:300;}
        @media(prefers-reduced-motion:reduce){.ma-body{transition:none!important;}}
      `}</style>
    </div>
  );
}

function ProductMythsSection({ config, t }: { config: ProductConfig; t: any }) {
  const { folder, mythsTitle, myths } = config;
  const fewItems = myths.length <= 2;
  return (
    <section className="myths-section" aria-labelledby={`myths-title-${folder}`}>
      <div className="ambient" aria-hidden="true" />
      <div className="myths-desktop">
        <div className="myths-wrapper">
          <figure className="myths-img"><img src={`/image/${folder}/${folder}3.jpg`} alt={`Photo ${folder}`} loading="lazy" decoding="async" /></figure>
          <div className="card-stack stack-1" aria-hidden="true" />
          <div className="card-stack stack-2" aria-hidden="true" />
          <article className={`myths-card ${fewItems ? "is-compact" : ""}`} role="region" aria-labelledby={`myths-title-${folder}`}>
            <span className="card-border" aria-hidden="true" />
            <h2 id={`myths-title-${folder}`} className="myths-title">
              <span className="moon" aria-hidden="true">🌙</span>
              <span>{mythsTitle}</span>
            </h2>
            <div className="myths-accordion">
              {myths.map(item => <MythAccordion key={item.id} id={item.id} myth={item.myth} reality={item.reality} realityLabel={t("reality_label")} />)}
            </div>
          </article>
        </div>
      </div>
      <div className="myths-mobile">
        <div className="mob-img-wrap"><img src={`/image/${folder}/${folder}3.jpg`} alt={`Photo ${folder}`} loading="lazy" /></div>
        <h2 className="mob-title">{mythsTitle}</h2>
        <div className="mob-list">
          <div className="mob-list-top-border" />
          {myths.map(item => <MythAccordionMobile key={item.id} id={item.id} myth={item.myth} reality={item.reality} />)}
        </div>
      </div>
      <style jsx>{`
        .myths-section{position:relative;width:100%;background:#ffffff;overflow:hidden;isolation:isolate;}
        .ambient{position:absolute;inset:-10% -10% -15% -10%;opacity:.65;background:radial-gradient(1200px 460px at 60% 85%,rgba(255,236,220,.65),transparent 70%),radial-gradient(900px 360px at 80% 30%,rgba(255,240,230,.55),transparent 70%);filter:blur(.3px);mix-blend-mode:screen;pointer-events:none;z-index:0;}
        .myths-desktop{display:block;padding:clamp(70px,8vw,110px) 20px;}
        .myths-mobile{display:none;}
        .myths-wrapper{position:relative;max-width:1240px;margin:0 auto;min-height:600px;z-index:1;}
        .myths-img{position:absolute;left:0;top:50%;transform:translateY(-50%);width:360px;height:520px;border-radius:28px;overflow:hidden;border:1px solid rgba(255,255,255,.4);box-shadow:0 22px 60px rgba(0,0,0,.07),0 10px 30px rgba(0,0,0,.05),0 0 46px rgba(255,230,210,.6);z-index:2;background:#000;margin:0;}
        .myths-img img{width:100%;height:100%;object-fit:cover;display:block;}
        .card-stack{position:absolute;right:0;top:50%;background:linear-gradient(135deg,#f4ece2,#efe3d7);filter:blur(.2px);width:72%;height:74%;border-radius:28px;box-shadow:0 20px 50px rgba(0,0,0,.08);z-index:1;}
        .stack-1{opacity:.75;transform:translate(32px,-50%);}
        .stack-2{opacity:.48;transform:translate(60px,-48%);}
        .myths-card{position:relative;margin-left:260px;padding:54px 56px;border-radius:30px;background:rgba(255,252,248,.82);border:1.6px solid rgba(240,224,210,.9);backdrop-filter:blur(14px) saturate(140%);box-shadow:0 30px 90px rgba(0,0,0,.08),0 12px 42px rgba(0,0,0,.06),0 0 60px rgba(255,230,210,.75);overflow:hidden;z-index:3;}
        .myths-card::before{content:"";position:absolute;inset:0;background:linear-gradient(to bottom,rgba(255,245,235,.55) 0%,rgba(255,253,250,0) 18%);opacity:.55;mix-blend-mode:screen;pointer-events:none;}
        .card-border{position:absolute;inset:0;border-radius:inherit;pointer-events:none;box-shadow:inset 0 0 36px rgba(255,236,220,.6),inset 0 2px 4px rgba(255,255,255,.9);}
        .myths-card.is-compact{padding:36px 40px;}
        .myths-title{margin:0 0 26px;font-size:28px;font-weight:800;color:#3c3631;letter-spacing:-0.02em;display:flex;align-items:center;gap:12px;position:relative;z-index:1;}
        .moon{font-size:30px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.08));}
        .myths-accordion{display:flex;flex-direction:column;gap:16px;position:relative;z-index:1;}
        @media(max-width:900px){
          .myths-desktop{display:none;}
          .myths-mobile{display:block;padding:48px 20px 56px;}
          .mob-img-wrap{width:100%;border-radius:20px;overflow:hidden;aspect-ratio:4/3;margin-bottom:36px;}
          .mob-img-wrap img{width:100%;height:100%;object-fit:cover;display:block;}
          .mob-title{font-size:clamp(28px,7vw,36px);font-weight:700;color:#1a1a1a;letter-spacing:-0.02em;margin:0 0 28px;line-height:1.15;}
          .mob-list-top-border{border-top:1px solid #e8e2da;}
        }
        @media(max-width:480px){.myths-mobile{padding:40px 20px 48px;}.mob-img-wrap{border-radius:16px;margin-bottom:28px;}.mob-title{font-size:26px;margin-bottom:24px;}}
      `}</style>
    </section>
  );
}

/* ── FAQ ── */
function FAQItem({ id, question, answer }: { id: number; question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const el = ref.current; if (!el) return; el.style.maxHeight = isOpen ? `${el.scrollHeight}px` : "0px"; }, [isOpen]);
  useEffect(() => {
    if (!ref.current || !isOpen) return;
    const el = ref.current;
    const ro = new ResizeObserver(() => { el.style.maxHeight = `${el.scrollHeight}px`; });
    ro.observe(el); return () => ro.disconnect();
  }, [isOpen]);
  return (
    <div className={`faq-item ${isOpen ? "open" : ""}`}>
      <button className="faq-btn" onClick={() => setIsOpen(v => !v)} aria-expanded={isOpen} aria-controls={`faq-answer-${id}`}>
        <span className="faq-q">{question}</span>
        <span className={`faq-plus ${isOpen ? "rot" : ""}`} aria-hidden="true">{isOpen ? "−" : "+"}</span>
      </button>
      <div id={`faq-answer-${id}`} className="faq-body" ref={ref} role="region" aria-live="polite">
        <p className="faq-a">{answer}</p>
      </div>
      <style jsx>{`
        .faq-item{border-radius:16px;background:linear-gradient(180deg,#fffefb 0%,#faf6f0 100%);border:1.4px solid #e8dcc9;box-shadow:inset 0 0 10px rgba(255,240,228,.4),inset 0 1px 1px rgba(255,255,255,.7);overflow:hidden;transition:box-shadow .25s ease,border-color .25s ease,background .25s ease,transform .2s ease;}
        @media(hover:hover){.faq-item:hover{box-shadow:0 8px 24px rgba(0,0,0,.08),inset 0 0 12px rgba(255,240,228,.45);transform:translateY(-1px);}}
        .faq-item.open{background:linear-gradient(180deg,#ffffff 0%,#fdfaf5 100%);border-color:#dccebb;box-shadow:0 8px 20px rgba(0,0,0,.06),inset 0 0 20px rgba(255,237,218,.5);}
        .faq-btn{width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 20px;background:transparent;border:0;cursor:pointer;text-align:left;transition:background .18s ease;}
        .faq-btn:hover{background:rgba(255,250,240,.6);}
        .faq-q{flex:1;font-weight:600;color:#3f372f;font-size:15px;line-height:1.5;letter-spacing:-0.01em;}
        .faq-plus{flex-shrink:0;width:28px;height:28px;display:grid;place-items:center;font-size:20px;color:#9f9f9f;line-height:1;transition:transform .28s ease,color .2s ease;font-weight:300;border-radius:50%;background:rgba(255,250,245,.6);}
        .faq-plus.rot{color:#ff7b42;background:rgba(255,123,66,.1);animation:popFaq .25s ease-out;}
        @keyframes popFaq{0%{transform:scale(.88);}60%{transform:scale(1.08);}100%{transform:scale(1);}}
        .faq-body{max-height:0;overflow:hidden;transition:max-height .35s cubic-bezier(.4,0,.2,1),opacity .25s ease;opacity:0;}
        .faq-item.open .faq-body{opacity:1;}
        .faq-a{margin:0;padding:4px 20px 18px 20px;color:#6a5f57;font-size:14.5px;line-height:1.7;letter-spacing:-0.005em;}
        @media(max-width:640px){.faq-btn{padding:16px 18px;gap:12px;}.faq-q{font-size:14.5px;}.faq-plus{width:26px;height:26px;font-size:18px;}.faq-a{padding:4px 18px 16px 18px;font-size:14px;}}
        @media(prefers-reduced-motion:reduce){.faq-item,.faq-btn,.faq-body,.faq-plus{transition:none!important;animation:none!important;}}
      `}</style>
    </div>
  );
}

function FAQItemMobile({ id, question, answer }: { id: number; question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const el = ref.current; if (!el) return; el.style.maxHeight = isOpen ? `${el.scrollHeight}px` : "0px"; }, [isOpen]);
  useEffect(() => {
    if (!ref.current || !isOpen) return;
    const el = ref.current;
    const ro = new ResizeObserver(() => { el.style.maxHeight = `${el.scrollHeight}px`; });
    ro.observe(el); return () => ro.disconnect();
  }, [isOpen]);
  return (
    <div className={`fmob-item ${isOpen ? "open" : ""}`}>
      <button className="fmob-btn" onClick={() => setIsOpen(v => !v)} aria-expanded={isOpen} aria-controls={`fmob-answer-${id}`}>
        <span className="fmob-q">{question}</span>
        <span className="fmob-plus" aria-hidden="true">{isOpen ? "−" : "+"}</span>
      </button>
      <div id={`fmob-answer-${id}`} className="fmob-body" ref={ref} role="region">
        <p className="fmob-a">{answer}</p>
      </div>
      <style jsx>{`
        .fmob-item{border-bottom:1px solid #e8e2da;}
        .fmob-btn{width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 0;background:transparent;border:0;cursor:pointer;text-align:left;}
        .fmob-q{flex:1;font-size:16px;font-weight:500;color:#1a1a1a;line-height:1.45;letter-spacing:-0.01em;}
        .fmob-plus{font-size:22px;color:#9a9a9a;font-weight:300;flex-shrink:0;line-height:1;}
        .fmob-body{max-height:0;overflow:hidden;transition:max-height .35s cubic-bezier(.4,0,.2,1),opacity .25s ease;opacity:0;}
        .fmob-item.open .fmob-body{opacity:1;}
        .fmob-a{margin:0;padding:0 0 20px 0;font-size:14.5px;line-height:1.75;color:#666;font-weight:300;}
        @media(prefers-reduced-motion:reduce){.fmob-body{transition:none!important;}}
      `}</style>
    </div>
  );
}

function ProductFAQSection({ config, t }: { config: ProductConfig; t: any }) {
  const { folder, faqTitle, faqSubtitle, faqs } = config;
  return (
    <section className="faq-section" aria-labelledby={`faq-title-${folder}`}>
      <div className="faq-ambient" aria-hidden="true" />
      <div className="faq-container">
        <header className="faq-header">
          <h2 id={`faq-title-${folder}`} className="faq-main-title">
            <span className="faq-icon" aria-hidden="true">💬</span>
            <span>{faqTitle}</span>
          </h2>
          {faqSubtitle && <p className="faq-subtitle">{faqSubtitle}</p>}
        </header>
        <div className="faq-desktop">
          <div className="faq-grid">
            {faqs.map(item => <FAQItem key={item.id} id={item.id} question={item.question} answer={item.answer} />)}
          </div>
        </div>
        <div className="faq-mobile">
          <div className="fmob-top-border" />
          {faqs.map(item => <FAQItemMobile key={item.id} id={item.id} question={item.question} answer={item.answer} />)}
        </div>
        <footer className="faq-footer">
          <p className="faq-footer-text">
            {t("faq_footer")}{" "}
            <a href="/contact" className="faq-footer-link">{t("faq_contact")}</a>
          </p>
        </footer>
      </div>
      <style jsx>{`
        .faq-section{position:relative;width:100%;padding:clamp(70px,8vw,110px) 20px;background:#ffffff;overflow:hidden;isolation:isolate;}
        .faq-ambient{position:absolute;inset:-10% -10% -15% -10%;opacity:.5;background:radial-gradient(1000px 400px at 50% 90%,rgba(255,236,220,.5),transparent 65%),radial-gradient(800px 320px at 50% 10%,rgba(254,240,230,.4),transparent 65%);filter:blur(.4px);mix-blend-mode:screen;pointer-events:none;z-index:0;}
        .faq-container{position:relative;max-width:960px;margin:0 auto;z-index:1;}
        .faq-header{text-align:center;margin-bottom:clamp(40px,6vw,60px);}
        .faq-main-title{margin:0 0 12px;font-size:clamp(28px,4vw,36px);font-weight:800;color:#3c3631;letter-spacing:-0.02em;display:flex;align-items:flex-start;justify-content:center;gap:14px;}
        .faq-icon{font-size:clamp(32px,4.5vw,40px);filter:drop-shadow(0 2px 4px rgba(0,0,0,.06));flex-shrink:0;margin-top:0.1em;}
        .faq-subtitle{margin:0;font-size:clamp(14px,1.8vw,16px);color:#6a5f57;font-weight:400;letter-spacing:.01em;}
        .faq-desktop{display:block;}
        .faq-mobile{display:none;}
        .faq-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;align-items:start;}
        @media(max-width:767px){
          .faq-desktop{display:none;}
          .faq-mobile{display:block;}
          .fmob-top-border{border-top:1px solid #e8e2da;}
          .faq-section{padding:48px 20px 56px;}
          .faq-header{margin-bottom:32px;}
        }
        @media(max-width:480px){.faq-section{padding:40px 20px 48px;}.faq-main-title{font-size:24px;}}
        .faq-footer{margin-top:clamp(50px,7vw,70px);text-align:center;padding-top:32px;border-top:1px solid rgba(233,221,205,.6);}
        .faq-footer-text{margin:0;font-size:15px;color:#6a5f57;}
        .faq-footer-link{color:#ff7b42;font-weight:600;text-decoration:none;transition:color .2s ease;}
        .faq-footer-link:hover{color:#ff8d58;text-decoration:underline;}
      `}</style>
    </section>
  );
}

/* ── Accordion générique ── */
function AccordionItem({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
      <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center px-6 py-4 text-left font-medium text-neutral-900 hover:bg-neutral-50 transition-colors">
        {title}
        <span className="text-xl text-neutral-600">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="px-6 pb-6 pt-2 bg-white">{children}</div>}
    </div>
  );
}

/* ============================================================================
   PAGE PRODUIT PRINCIPALE
   ============================================================================ */
export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  const t = useTranslations("product");
  const subscriptionMode = searchParams.get("mode") === "subscription";

  const [product, setProduct] = useState<DbProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchaseType, setPurchaseType] = useState<"unique" | "subscription">(subscriptionMode ? "subscription" : "unique");
  const [avg, setAvg] = useState(0);
  const [count, setCount] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { if (subscriptionMode && purchaseType !== "subscription") setPurchaseType("subscription"); }, [subscriptionMode, purchaseType]);

  useEffect(() => {
    if (!id) return;
    const numericId = Number(id);
    if (!Number.isFinite(numericId) || numericId <= 0) { router.replace("/shop"); return; }
    (async () => {
      try {
        setLoading(true); setFetchError(null);
        const { data: prod, error } = await supabase.from("products").select("*").eq("id", numericId).single();
        if (error || !prod) throw error ?? new Error("Produit introuvable");
        if (!mounted.current) return;
        setProduct(prod as DbProduct);
        const { data: summary, error: sumError } = await supabase.from("reviews_summary").select("*").eq("product_id", numericId).maybeSingle();
        if (sumError) console.warn("reviews_summary error:", sumError.message);
        if (!mounted.current) return;
        setAvg(Number(summary?.rating_avg ?? 0));
        setCount(Number(summary?.reviews_count ?? 0));
      } catch (e: any) {
        if (!mounted.current) return;
        setFetchError("Une erreur est survenue. Redirection vers la boutique…");
        setTimeout(() => router.replace("/shop"), 900);
      } finally { if (mounted.current) setLoading(false); }
    })();
  }, [id, router]);

  const productKey = useMemo(() => product ? getProductKey(product) : null, [product]);

  // Construit la config depuis les traductions JSON
  const productConfig = useMemo((): ProductConfig | null => {
    if (!productKey) return null;
    const pd = t.raw(`products.${productKey}`) as any;
    if (!pd) return null;
    const highlightTexts: string[] = pd.highlights ?? [];
    const emojis = HIGHLIGHT_EMOJIS[productKey];
    return {
      key: productKey,
      folder: productKey,
      emoji: PRODUCT_EMOJIS[productKey],
      highlights: highlightTexts.map((text, i) => ({ emoji: emojis[i] ?? "✨", text })),
      routineTitle: pd.routineTitle ?? "",
      routineSubtitle: pd.routineSubtitle ?? "",
      routineIntro: pd.routineIntro ?? "",
      routineSub: pd.routineSub ?? "",
      routineTips: pd.routineTips ?? [],
      routineNote: pd.routineNote ?? "",
      mythsTitle: pd.mythsTitle ?? "",
      myths: (pd.myths ?? []).map((m: any, i: number) => ({ id: i + 1, myth: m.myth, reality: m.reality })),
      faqTitle: pd.faqTitle ?? "",
      faqSubtitle: pd.faqSubtitle ?? "",
      faqs: (pd.faqs ?? []).map((f: any, i: number) => ({ id: i + 1, question: f.question, answer: f.answer })),
    };
  }, [productKey, t]);

  const productImages = useMemo(() => {
    if (!product?.images?.length) return ["https://images.unsplash.com/photo-1556228852-80c63843f03c?w=800&h=800&fit=crop&auto=format&q=60"];
    return product.images;
  }, [product]);

  const unitPrice = product?.prix ?? 0;
  const subPrice = unitPrice * 0.8;
  const priceLabel = useMemo(() => euroFmt.format(purchaseType === "subscription" ? subPrice : unitPrice), [purchaseType, subPrice, unitPrice]);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    addToCart({ id: product.id, nom: product.nom, prix: product.prix, images: product.images, purchaseType } as any, purchaseType === "subscription");
  }, [addToCart, product, purchaseType]);

  if (loading) return (
    <div className="min-h-screen bg-white pt-[73px] grid place-items-center">
      <div className="relative w-16 h-16" role="status">
        <div className="absolute inset-0 border-4 border-neutral-200 rounded-full" />
        <div className="absolute inset-0 border-4 border-neutral-900 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
  if (!product) return null;

  return (
    <main className="bg-white min-h-screen text-neutral-900 pt-[73px]">
      {subscriptionMode && (
        <div className="max-w-[1400px] mx-auto w-full px-6 pb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {t("subscription_mode")}
          </div>
        </div>
      )}

      {fetchError && (
        <div className="max-w-[1400px] mx-auto w-full px-6 pb-2">
          <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm">{fetchError}</div>
        </div>
      )}

      <section className="max-w-[1400px] mx-auto w-full px-6 pb-20">
        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <ProductImageGallery images={productImages} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="space-y-5 md:space-y-6">
            <div>
              <h1 className="text-4xl md:text-[42px] font-semibold tracking-tight mb-4 text-neutral-800">{product.nom}</h1>
              {count > 0 && (
                <div className="flex items-center gap-3 text-sm text-neutral-600">
                  <RatingStars value={avg} readonly />
                  <span>({count} {t("verified_reviews")})</span>
                </div>
              )}
            </div>

            {(product.story || product.description) && (
              <div>
                <p className="text-neutral-600 leading-relaxed text-[15px] max-w-prose">{product.story || product.description}</p>
                {productConfig && <ProductHighlights highlights={productConfig.highlights} />}
                {!productKey && (product.benefits?.length ?? 0) > 0 && <BenefitsNoMiddle benefits={product.benefits!} />}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4 py-6">
              {product.gummies_per_jar && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50">
                  <svg className="w-5 h-5 text-neutral-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                  <p className="text-sm text-neutral-700">{product.gummies_per_jar} gummies/potje</p>
                </div>
              )}
              {product.flavor && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50">
                  <svg className="w-5 h-5 text-neutral-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p className="text-sm text-neutral-700">{product.flavor}</p>
                </div>
              )}
              {product.shipping_note && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50">
                  <svg className="w-5 h-5 text-neutral-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 01-1 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/>
                  </svg>
                  <p className="text-sm text-neutral-700">{product.shipping_note}</p>
                </div>
              )}
            </div>

            <fieldset className="space-y-3 mt-1 md:mt-2" aria-label={t("one_time")}>
              {!subscriptionMode && (
                <label className={`relative flex items-center justify-between p-5 border-2 rounded-2xl transition-colors cursor-pointer ${purchaseType === "unique" ? "border-neutral-900 bg-white shadow-lg" : "border-neutral-200 bg-white/60 hover:border-neutral-300 hover:bg-white/80"}`}>
                  <div>
                    <span className="text-lg font-semibold block">{t("one_time")}</span>
                    <span className="text-sm text-neutral-600">{t("one_time_sub")}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-neutral-900">{euroFmt.format(unitPrice)}</span>
                    <input type="radio" name="purchaseType" aria-label={t("one_time")} checked={purchaseType === "unique"} onChange={() => setPurchaseType("unique")} className="w-5 h-5" />
                  </div>
                </label>
              )}
              <label className={`relative flex items-center justify-between p-5 border-2 rounded-2xl cursor-pointer transition-colors ${purchaseType === "subscription" ? "border-green-500 bg-green-50 shadow-lg" : "border-neutral-200 bg-white/60 hover:border-neutral-300 hover:bg-white/80"}`}>
                <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {subscriptionMode ? t("subscription_mode") : t("recommended")}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">{t("subscription")}</span>
                    <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded">-20%</span>
                  </div>
                  <span className="text-sm text-neutral-600">{t("subscription_sub")}</span>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div className="leading-tight">
                    <span className="block text-sm text-neutral-400 line-through">{euroFmt.format(unitPrice)}</span>
                    <span className="block text-lg font-semibold text-green-700">{euroFmt.format(subPrice)}</span>
                  </div>
                  <input type="radio" name="purchaseType" aria-label={t("subscription")} checked={purchaseType === "subscription"} onChange={() => setPurchaseType("subscription")} className="w-5 h-5" />
                </div>
              </label>
            </fieldset>

            <button onClick={handleAddToCart} className="w-full py-5 bg-gradient-to-b from-neutral-900 to-neutral-800 text-white font-semibold text-lg rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all shadow-xl" aria-live="polite">
              {subscriptionMode ? t("add_to_routine") : t("add_to_cart")} — {priceLabel}
            </button>

            {(product.ingredients?.length || product.usage_instructions) && (
              <div className="mt-10 space-y-3">
                {(product.ingredients?.length ?? 0) > 0 && (
                  <AccordionItem title={t("ingredients_title")}>
                    <p className="text-sm text-neutral-600 leading-relaxed font-light">{product.ingredients!.join(", ")}.</p>
                  </AccordionItem>
                )}
                {product.usage_instructions && (
                  <AccordionItem title={t("usage_title")}>
                    <p className="text-neutral-700 leading-relaxed whitespace-pre-line">{product.usage_instructions}</p>
                  </AccordionItem>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {productKey && <IngredientsSlider productKey={productKey} t={t} />}

        {productConfig && (
          <>
            <ProductRoutineSection config={productConfig} t={t} />
            <ProductMythsSection config={productConfig} t={t} />
            <ProductFAQSection config={productConfig} t={t} />
          </>
        )}

        <div className="mt-20 pt-12 border-t border-neutral-300">
          <h2 className="text-3xl font-light tracking-tight mb-8 text-neutral-800">{t("reviews_title")}</h2>
          <ProductReviews productId={product.id} />
        </div>
      </section>
    </main>
  );
}