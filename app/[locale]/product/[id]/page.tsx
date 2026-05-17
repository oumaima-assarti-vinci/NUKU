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

// Plan images for "Optimisez votre routine" section
const PLAN_IMAGES: Record<ProductKey, string | undefined> = {
  sleep:    "/image/PlanBleu.png",
  soul:     "/image/PlanViolet.png",
  strength: "/image/PlanRouge.png",
  shine:    "/image/PlanJaune.png",
  source:   "/image/PlanVert.png",
};

// ── Other products static config ──
const OTHER_PRODUCTS_CONFIG: Record<ProductKey, {
  label: string;
  labelFr: string;
  ingredients: string;
  color: string;
}> = {
  sleep:    { label: "SOMMEIL",           labelFr: "SOMMEIL",           ingredients: "Mélatonine · L-théanine · Magnésium", color: "#7B9EC4" },
  soul:     { label: "RELAX & ÉQUILIBRE", labelFr: "RELAX & ÉQUILIBRE", ingredients: "Ashwagandha · Rhodiola · Safran",       color: "#9B7BB8" },
  strength: { label: "FORCE & ENDURANCE", labelFr: "FORCE & ENDURANCE", ingredients: "Créatine · Vitamine B12 · Vitamine D3",  color: "#C0392B" },
  shine:    { label: "CHEVEUX & BEAUTÉ",  labelFr: "CHEVEUX & BEAUTÉ",  ingredients: "Biotine · Zinc · MSM",                  color: "#C8B84A" },
  source:   { label: "DIGESTION",         labelFr: "DIGESTION",         ingredients: "Matcha · Artichaut · Pissenlit",          color: "#4A7C59" },
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

const PRODUCT_MAIN_IMAGES: Record<ProductKey, string> = {
  sleep:    "/image/nukuBleu.png",
  soul:     "/image/nukuViolet.png",
  strength: "/image/nukuRouge.png",
  shine:    "/image/nukuJaune.png",
  source:   "/image/nukuVert.png",
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
        .pg-main{position:relative;width:100%;aspect-ratio:3/4;max-height:340px;border-radius:24px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:transparent;}
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
        @media(max-width:640px){
          .pg-main{border-radius:20px;aspect-ratio:4/3;}
          .pg-thumb{width:56px;height:56px;border-radius:10px;}
          .pg-arrow{width:40px;height:40px;}
          .pg-arrow-prev{left:10px;}
          .pg-arrow-next{right:10px;}
        }
        @media(max-width:380px){
          .pg-thumb{width:48px;height:48px;}
          .pg-arrow{width:36px;height:36px;}
        }
      `}</style>
    </div>
  );
}

/* ── Highlights ── */
function ProductHighlights({ highlights }: { highlights: ProductHighlight[] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}
      className="grid grid-cols-2 gap-x-4 gap-y-3 sm:gap-x-6 sm:gap-y-4 mt-4 pt-4 sm:mt-5 sm:pt-5 border-t border-neutral-100">
      {highlights.map((h, i) => (
        <div key={i} className="flex items-center gap-2 sm:gap-3">
          <span className="text-xl sm:text-2xl leading-none select-none flex-shrink-0" aria-hidden>{h.emoji}</span>
          <span className="text-[12px] sm:text-[14px] text-neutral-700 leading-snug">{h.text}</span>
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
        <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 sm:gap-y-5 py-1">
          {row.map((text, i) => (
            <div key={i} className="flex items-center gap-3 sm:gap-4">
              <span className="text-xl sm:text-2xl leading-none select-none" aria-hidden>{getBenefitEmoji(text)}</span>
              <span className="text-[14px] sm:text-[15px] md:text-base text-neutral-800">{text}</span>
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
        let benefit: string;
        try { benefit = t(`ingredient_benefits.${key}`); } catch { benefit = value.benefit; }
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
        .luxury-header{text-align:center;margin-bottom:40px;padding-top:48px;}
        .luxury-badge{text-transform:uppercase;letter-spacing:3px;font-size:11px;color:#b58e58;font-weight:700;}
        .luxury-title{font-size:clamp(26px,5vw,40px);font-weight:400;margin:10px 0;font-family:'Coolvetica',sans-serif !important}
        .luxury-divider{width:40px;height:1px;background:#b58e58;margin:15px auto;}
        .luxury-subtitle{font-size:13px;color:#888;font-weight:300;padding:0 16px;}
        .ing-section{margin:80px auto;width:100%;max-width:1200px;padding:0 40px;position:relative;left:0;}
        .ing-wrap{position:relative;max-width:${wrapMaxWidth};margin:0 auto;padding:0;width:100%;}
        .ing-wrap::before,.ing-wrap::after{content:"";position:absolute;top:0;bottom:0;width:40px;z-index:5;pointer-events:none;}
        .ing-wrap::before{left:0;width:80px;background:linear-gradient(to right,#fff 0%,rgba(255,255,255,0) 100%);}
        .ing-wrap::after{right:0;width:80px;background:linear-gradient(to left,#fff 0%,rgba(255,255,255,0) 100%);} .ing-wrap[data-few="true"]::before,.ing-wrap[data-few="true"]::after{display:none;}
        .ing-viewport{overflow:hidden;padding:40px 0;}
        .ing-wrap{overflow:hidden;}
        .ing-container{display:flex;user-select:none;-webkit-touch-callout:none;gap:16px;}
        .ing-slide{flex:0 0 52%;min-width:0;display:flex;align-items:center;justify-content:center;}
        @media(min-width:480px){.ing-slide{flex:0 0 38%;}}
        @media(min-width:900px){.ing-slide{flex:0 0 ${slideWidthDesktop};}}
        .ing-card{width:100%;background:#fff;border-radius:20px;border:none;box-shadow:0 4px 18px rgba(0,0,0,0.07);display:flex;flex-direction:column;align-items:center;padding:14px 12px 12px;gap:8px;cursor:pointer;transform:scale(0.82);opacity:0.50;filter:saturate(0.6) brightness(1.02);transform-origin:center center;transition:transform 0.4s cubic-bezier(0.34,1.26,0.64,1),opacity 0.35s ease,box-shadow 0.35s ease,filter 0.35s ease;}
        .ing-card--active{transform:scale(var(--active-scale,1.08));opacity:1;filter:none;box-shadow:0 12px 36px rgba(180,130,80,0.18),0 4px 12px rgba(0,0,0,0.07);cursor:default;}
        .ing-card-name{font-size:12px;font-weight:700;color:#2f261f;margin:0;text-align:center;opacity:0;transition:opacity 0.3s ease;}
        @media(hover:hover) and (pointer:fine){.ing-card--active .ing-card-name{opacity:1;}}
        @media(hover:none),(pointer:coarse){.ing-card--active .ing-card-name{opacity:1;}}
        .ing-img-wrap{width:100%;aspect-ratio:1/1;border-radius:14px;overflow:hidden;}
        .ing-img-wrap img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;user-select:none;transition:transform 0.32s ease;}
        @media(hover:hover) and (pointer:fine){.ing-card--active:hover .ing-img-wrap img{transform:scale(1.06);}}
        .ing-benefit{width:100%;max-height:0;overflow:hidden;opacity:0;transition:max-height 0.4s cubic-bezier(0.4,0,0.2,1),opacity 0.3s ease;}
        .ing-benefit p{margin:0;font-size:11px;line-height:1.6;color:#5a3e2b;font-style:italic;text-align:center;padding:4px 0;}
        @media(hover:hover) and (pointer:fine){.ing-card--active .ing-img-wrap:hover ~ .ing-benefit{max-height:120px;opacity:1;}}
        .ing-benefit--open{max-height:120px!important;opacity:1!important;}
        .ing-touch-btn{width:28px;height:28px;border-radius:50%;border:1.5px solid rgba(180,130,80,0.4);background:#fff;color:#3b2a22;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;touch-action:manipulation;-webkit-tap-highlight-color:transparent;}
        .ing-touch-btn--open{background:#ef8035;border-color:#ef8035;color:#fff;}
        .ing-nav-btn{position:absolute;top:50%;transform:translateY(-50%);width:42px;height:42px;border-radius:50%;border:1.5px solid rgba(180,130,80,0.3);background:#fff;color:#3b2a22;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,0.07);transition:all 0.2s ease;z-index:10;}
        .ing-nav-btn:disabled{opacity:0.3;cursor:default;}
        .ing-nav-prev{left:4px;}.ing-nav-next{right:4px;}
        .ing-nav-btn:not(:disabled):hover{background:#fff;border-color:rgba(239,128,53,0.5);transform:translateY(-50%) scale(1.07);}
        .ing-nav-btn:not(:disabled):active{transform:translateY(-50%) scale(0.94);}
        @media(hover:none),(pointer:coarse){.ing-nav-btn{display:none!important;}.ing-wrap::before,.ing-wrap::after{width:24px;}}
        @media(max-width:899px){.ing-wrap{max-width:100%!important;}}
        @media(max-width:480px){
          .luxury-header{margin-bottom:28px;padding-top:36px;}
          .luxury-title{font-size:24px;}
          .luxury-subtitle{font-size:12px;}
          .ing-section{margin-top:56px;margin-bottom:56px;padding-bottom:40px;}
          .ing-container{gap:12px;}
          .ing-viewport{padding:28px 0 20px;}
        }
        @media(prefers-reduced-motion:reduce){.ing-card,.ing-img-wrap img,.ing-benefit{transition:none!important;}}
      `}</style>
    </section>
  );
}

/* ── Routine Icons ── */
const ROUTINE_ICONS: Record<ProductKey, React.ReactElement[]> = {
  sleep: [
    <svg key="sl1" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M30 10a14 14 0 1 1-14 20A10 10 0 0 0 30 10z" fill="currentColor" fillOpacity="0.08"/><path d="M30 10a14 14 0 1 1-14 20A10 10 0 0 0 30 10z"/><line x1="36" y1="8" x2="38" y2="6"/><line x1="40" y1="14" x2="43" y2="13"/><line x1="38" y1="18" x2="41" y2="19"/></svg>,
    <svg key="sl2" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 18h8v20a4 4 0 01-8 0V18z" fill="currentColor" fillOpacity="0.1"/><path d="M20 18h8v20a4 4 0 01-8 0V18z"/><path d="M24 18c0 0-3-4-3-7a3 3 0 016 0c0 3-3 7-3 7z" fill="currentColor" fillOpacity="0.15"/><path d="M24 18c0 0-3-4-3-7a3 3 0 016 0c0 3-3 7-3 7z"/><line x1="16" y1="38" x2="32" y2="38"/></svg>,
    <svg key="sl3" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="14" y="6" width="20" height="36" rx="4" fill="currentColor" fillOpacity="0.08"/><rect x="14" y="6" width="20" height="36" rx="4"/><line x1="21" y1="38" x2="27" y2="38"/><line x1="10" y1="10" x2="38" y2="38" strokeWidth="2.2"/></svg>,
    <svg key="sl4" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 6h20M14 42h20M16 6c0 10 10 16 10 20s-10 10-10 20M32 6c0 10-10 16-10 20s10 10 10 20" fill="currentColor" fillOpacity="0.08"/><path d="M14 6h20M14 42h20M16 6c0 10 10 16 10 20s-10 10-10 20M32 6c0 10-10 16-10 20s10 10 10 20"/><ellipse cx="24" cy="26" rx="6" ry="3" fill="currentColor" fillOpacity="0.2"/></svg>,
    <svg key="sl5" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="10" width="36" height="32" rx="4" fill="currentColor" fillOpacity="0.08"/><rect x="6" y="10" width="36" height="32" rx="4"/><line x1="6" y1="20" x2="42" y2="20"/><line x1="16" y1="6" x2="16" y2="14"/><line x1="32" y1="6" x2="32" y2="14"/><polyline points="15,30 20,35 33,24" strokeWidth="2.2"/></svg>,
  ],
  shine: [
    <svg key="sh1" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="10" y="18" width="28" height="14" rx="7" fill="currentColor" fillOpacity="0.08"/><rect x="10" y="18" width="28" height="14" rx="7"/><line x1="24" y1="18" x2="24" y2="32"/></svg>,
    <svg key="sh2" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="24" cy="20" r="6" fill="currentColor" fillOpacity="0.1"/><circle cx="24" cy="20" r="6"/><line x1="24" y1="26" x2="24" y2="38"/><line x1="18" y1="38" x2="30" y2="38"/><line x1="14" y1="14" x2="18" y2="18"/><circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.1"/><circle cx="12" cy="12" r="3"/></svg>,
    <svg key="sh3" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="24" cy="26" r="16" fill="currentColor" fillOpacity="0.08"/><circle cx="24" cy="26" r="16"/><polyline points="24,16 24,26 32,34" strokeWidth="2.2"/><line x1="24" y1="10" x2="24" y2="8"/><line x1="14" y1="13" x2="13" y2="11"/><line x1="34" y1="13" x2="35" y2="11"/></svg>,
    <svg key="sh4" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="24" y1="40" x2="24" y2="20"/><path d="M24 20c0-8-8-12-8-12s0 10 8 12z" fill="currentColor" fillOpacity="0.1"/><path d="M24 20c0-8-8-12-8-12s0 10 8 12z"/><path d="M24 20c0-8 8-12 8-12s0 10-8 12z" fill="currentColor" fillOpacity="0.1"/><path d="M24 20c0-8 8-12 8-12s0 10-8 12z"/><path d="M24 28c0-6-6-10-6-10s0 8 6 10z" fill="currentColor" fillOpacity="0.1"/><path d="M24 28c0-6-6-10-6-10s0 8 6 10z"/></svg>,
    <svg key="sh5" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="40" x2="40" y2="40"/><line x1="8" y1="8" x2="8" y2="40"/><rect x="12" y="26" width="7" height="14" fill="currentColor" fillOpacity="0.15"/><rect x="12" y="26" width="7" height="14"/><rect x="22" y="18" width="7" height="22" fill="currentColor" fillOpacity="0.15"/><rect x="22" y="18" width="7" height="22"/><rect x="32" y="10" width="7" height="30" fill="currentColor" fillOpacity="0.15"/><rect x="32" y="10" width="7" height="30"/></svg>,
  ],
  source: [
    <svg key="so1" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="24" cy="24" r="8" fill="currentColor" fillOpacity="0.12"/><circle cx="24" cy="24" r="8"/><line x1="24" y1="8" x2="24" y2="12"/><line x1="24" y1="36" x2="24" y2="40"/><line x1="8" y1="24" x2="12" y2="24"/><line x1="36" y1="24" x2="40" y2="24"/><line x1="13" y1="13" x2="16" y2="16"/><line x1="32" y1="32" x2="35" y2="35"/><line x1="35" y1="13" x2="32" y2="16"/><line x1="16" y1="32" x2="13" y2="35"/></svg>,
    <svg key="so2" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="24" cy="26" r="14" fill="currentColor" fillOpacity="0.08"/><circle cx="24" cy="26" r="14"/><path d="M18 30c1.5 3 8.5 3 10 0"/><circle cx="20" cy="23" r="1.5" fill="currentColor"/><circle cx="28" cy="23" r="1.5" fill="currentColor"/></svg>,
    <svg key="so3" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 12l4 28h8l4-28H16z" fill="currentColor" fillOpacity="0.08"/><path d="M16 12l4 28h8l4-28H16z"/><line x1="15" y1="20" x2="33" y2="20"/><path d="M20 26c2-2 6-2 8 0"/></svg>,
    <svg key="so4" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="24" cy="24" r="16" fill="currentColor" fillOpacity="0.08"/><circle cx="24" cy="24" r="16"/><line x1="24" y1="32" x2="24" y2="16"/><polyline points="17,23 24,16 31,23" strokeWidth="2.2"/></svg>,
  ],
  strength: [
    <svg key="st1" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="16" x2="40" y2="16"/><line x1="8" y1="24" x2="40" y2="24"/><line x1="8" y1="32" x2="40" y2="32"/><circle cx="18" cy="16" r="4" fill="currentColor" fillOpacity="0.15"/><circle cx="18" cy="16" r="4"/><circle cx="30" cy="24" r="4" fill="currentColor" fillOpacity="0.15"/><circle cx="30" cy="24" r="4"/><circle cx="20" cy="32" r="4" fill="currentColor" fillOpacity="0.15"/><circle cx="20" cy="32" r="4"/></svg>,
    <svg key="st2" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8h16v14c0 7-4 11-8 11s-8-4-8-11V8z" fill="currentColor" fillOpacity="0.08"/><path d="M16 8h16v14c0 7-4 11-8 11s-8-4-8-11V8z"/><path d="M16 14H10c0 9 4 13 6 13"/><path d="M32 14h6c0 9-4 13-6 13"/><line x1="24" y1="33" x2="24" y2="40"/><line x1="16" y1="40" x2="32" y2="40"/></svg>,
    <svg key="st3" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="40" x2="40" y2="40"/><line x1="8" y1="8" x2="8" y2="40"/><polyline points="10,36 18,24 26,28 38,12" strokeWidth="2.2"/><circle cx="10" cy="36" r="2.5" fill="currentColor"/><circle cx="18" cy="24" r="2.5" fill="currentColor"/><circle cx="26" cy="28" r="2.5" fill="currentColor"/><circle cx="38" cy="12" r="2.5" fill="currentColor"/></svg>,
    <svg key="st4" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M28 6L14 26h12l-6 16 20-22H28L34 6z" fill="currentColor" fillOpacity="0.12"/><path d="M28 6L14 26h12l-6 16 20-22H28L34 6z"/></svg>,
    <svg key="st5" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 6h20M14 42h20M16 6c0 10 10 16 10 20s-10 10-10 20M32 6c0 10-10 16-10 20s10 10 10 20" fill="currentColor" fillOpacity="0.08"/><path d="M14 6h20M14 42h20M16 6c0 10 10 16 10 20s-10 10-10 20M32 6c0 10-10 16-10 20s10 10 10 20"/><ellipse cx="24" cy="26" rx="6" ry="3" fill="currentColor" fillOpacity="0.2"/></svg>,
  ],
  soul: [
    <svg key="soul1" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M24 40C12 32 6 22 6 16a10 10 0 0120-2 10 10 0 0120 2c0 6-6 16-22 24z" fill="currentColor" fillOpacity="0.12"/><path d="M24 40C12 32 6 22 6 16a10 10 0 0120-2 10 10 0 0120 2c0 6-6 16-22 24z"/></svg>,
    <svg key="soul2" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="24" cy="24" r="16" fill="currentColor" fillOpacity="0.08"/><circle cx="24" cy="24" r="16"/><line x1="18" y1="16" x2="18" y2="32"/><line x1="30" y1="16" x2="30" y2="32"/></svg>,
    <svg key="soul3" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="24" cy="26" r="16" fill="currentColor" fillOpacity="0.08"/><circle cx="24" cy="26" r="16"/><polyline points="24,16 24,26 30,32" strokeWidth="2.2"/><path d="M18 8c2-2 4-2 6 0"/></svg>,
    <svg key="soul4" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="24" cy="10" r="5" fill="currentColor" fillOpacity="0.12"/><circle cx="24" cy="10" r="5"/><path d="M24 15v12"/><path d="M12 20l12 7 12-7"/><path d="M16 38l8-11 8 11"/></svg>,
    <svg key="soul5" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="24" cy="24" r="8" fill="currentColor" fillOpacity="0.12"/><circle cx="24" cy="24" r="8"/><line x1="24" y1="6" x2="24" y2="10"/><line x1="24" y1="38" x2="24" y2="42"/><line x1="6" y1="24" x2="10" y2="24"/><line x1="38" y1="24" x2="42" y2="24"/><line x1="11" y1="11" x2="14" y2="14"/><line x1="34" y1="34" x2="37" y2="37"/><line x1="37" y1="11" x2="34" y2="14"/><line x1="14" y1="34" x2="11" y2="37"/></svg>,
  ],
};

/* ── Routine Section ── */
function ProductRoutineSection({ config, productImages }: { config: ProductConfig; productImages: string[] }) {
  const { routineIntro, routineTips } = config;
  const FIXED_TITLE = "Optimisez votre routine";
  const TIP_ICONS = ROUTINE_ICONS[config.key] ?? ROUTINE_ICONS.sleep;

  // Use plan image if available, otherwise fall back to the product pot photo
  const leftImage = PLAN_IMAGES[config.key] ?? productImages[0] ?? `/image/${config.folder}/${config.folder}1.png`;

  return (
    <section className="rs-section">
      <h2 className="rs-title">{FIXED_TITLE}</h2>
      <div className="rs-grid">
        {/* LEFT: plan image */}
        <div className="rs-img-col">
          <div className="rs-img-wrap">
            <img
              src={leftImage}
              alt="Plan routine"
              className="rs-product-img"
              onError={(e) => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = "none"; }}
            />
          </div>
        </div>
        {/* RIGHT: tips */}
        <div className="rs-right">
          {routineTips.map((tip, i) => (
            <div key={i} className="rs-tip">
              <div className="rs-icon" aria-hidden="true">{TIP_ICONS[i] ?? TIP_ICONS[0]}</div>
              <p className="rs-tip-text">{tip}</p>
            </div>
          ))}
        </div>
      </div>
      {routineIntro && <p className="rs-intro-bottom">{routineIntro}</p>}
      <style jsx>{`
        .rs-section{padding:48px 24px 56px;background:#fff;max-width:1200px;margin:0 auto;}
       .rs-title{font-size:clamp(32px,5vw,64px);font-weight:400;color:#1a1009;text-align:center;margin:0 0 40px;letter-spacing:-0.02em;line-height:1.1;font-family:'Coolvetica',sans-serif !important;}
        .rs-grid{display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:start;}
        .rs-img-col{display:flex;flex-direction:column;align-items:center;gap:20px;}
        .rs-img-wrap{width:100%;display:flex;align-items:center;justify-content:center;}
        .rs-product-img{width:75%;max-width:360px;height:auto;object-fit:contain;filter:drop-shadow(0 24px 40px rgba(0,0,0,0.12));transition:transform 0.6s ease;display:block;border-radius:16px;}
        .rs-product-img:hover{transform:scale(1.02);}
        .rs-intro-bottom{font-size:14px;line-height:1.75;color:#555;font-weight:400;text-align:center;margin-top:32px;padding:0 16px;max-width:700px;margin-left:auto;margin-right:auto;}
        .rs-right{display:flex;flex-direction:column;gap:0;padding-top:8px;}
        .rs-tip{display:flex;align-items:center;gap:20px;padding:22px 0;border-bottom:1px solid #e8e2d8;}
        .rs-tip:first-child{border-top:1px solid #e8e2d8;}
        .rs-icon{flex-shrink:0;width:48px;height:48px;color:#2a1f14;opacity:0.75;display:flex;align-items:center;justify-content:center;}
        .rs-icon svg{width:100%;height:100%;}
        .rs-tip-text{font-size:15px;line-height:1.7;color:#3a3228;margin:0;font-weight:400;}
        @media(max-width:900px){
          .rs-section{padding:40px 20px 48px;}
          .rs-grid{grid-template-columns:1fr;gap:24px;}
          .rs-img-col{display:flex;}
          .rs-product-img{width:70%;max-width:280px;border-radius:20px;filter:none;margin:0 auto;}
        }
        @media(max-width:640px){
          .rs-section{padding:32px 16px 40px;}
          .rs-title{font-size:clamp(24px,7vw,36px);margin-bottom:28px;}
          .rs-tip{gap:14px;padding:18px 0;}
          .rs-icon{width:38px;height:38px;}
          .rs-tip-text{font-size:14px;}
          .rs-intro-bottom{font-size:13px;margin-top:24px;padding:0 8px;}
        }
        @media(prefers-reduced-motion:reduce){.rs-product-img{transition:none!important;}}
      `}</style>
    </section>
  );
}

/* ── Other Products Section ── */
function OtherProductsSection({
  currentKey,
  products,
  onAddToCart,
  onNavigate,
}: {
  currentKey: ProductKey | null;
  products: DbProduct[];
  onAddToCart: (product: DbProduct) => void;
  onNavigate: (id: number) => void;
}) {
  const otherProducts = products.filter(p => getProductKey(p) !== currentKey);
  if (!otherProducts.length) return null;

  const ACCENTS: Record<ProductKey, { accent: string; light: string }> = {
    sleep:    { accent: "#7B9FE0", light: "rgba(123,159,224,0.12)" },
    soul:     { accent: "#9B8EC4", light: "rgba(155,142,196,0.12)" },
    strength: { accent: "#E05A4E", light: "rgba(224,90,78,0.12)" },
    shine:    { accent: "#E8B84B", light: "rgba(232,184,75,0.12)" },
    source:   { accent: "#5BA85A", light: "rgba(91,168,90,0.12)" },
  };

  return (
    <section className="op-section">
      <h2 className="op-title">Nos autres compléments</h2>
      <div className="op-grid">
        {otherProducts.map((product) => {
          const key = getProductKey(product);
          const config = key ? OTHER_PRODUCTS_CONFIG[key] : null;
          const mainImage = product.images?.[0] ?? (key ? PRODUCT_MAIN_IMAGES[key] : "");
          const colors = key ? ACCENTS[key] : { accent: "#ef8035", light: "rgba(239,128,53,0.12)" };
          return (
            <OtherProductCard
              key={product.id}
              product={product}
              mainImage={mainImage}
              label={config?.label ?? product.nom}
              ingredients={config?.ingredients ?? ""}
              accent={colors.accent}
              light={colors.light}
              onNavigate={onNavigate}
              onAddToCart={onAddToCart}
            />
          );
        })}
      </div>
      <style jsx>{`
        .op-section{padding:56px 24px;max-width:1400px;margin:0 auto;border-top:1px solid #e8e2d8;}
        .op-title{font-size:clamp(28px,4vw,48px);font-weight:700;color:#1a1009;text-align:center;margin:0 0 40px;letter-spacing:-0.02em;}
        .op-grid{display:flex;flex-wrap:wrap;justify-content:center;gap:20px;}
        @media(max-width:900px){.op-section{padding:40px 16px;}.op-grid{gap:14px;}}
        @media(max-width:768px){
          .op-grid{flex-wrap:nowrap;overflow-x:auto;justify-content:flex-start;padding-bottom:12px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
          .op-grid::-webkit-scrollbar{display:none;}
        }
      `}</style>
    </section>
  );
}

function OtherProductCard({
  product, mainImage, label, ingredients, accent, light, onNavigate, onAddToCart,
}: {
  product: DbProduct; mainImage: string; label: string; ingredients: string;
  accent: string; light: string;
  onNavigate: (id: number) => void; onAddToCart: (p: DbProduct) => void;
}) {
  const [type, setType] = useState<"unique" | "subscription">("unique");
  const [added, setAdded] = useState(false);
  const [hov, setHov] = useState(false);
  const price = type === "subscription" ? Math.round(product.prix * 0.8) : product.prix;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div
      onClick={() => onNavigate(product.id)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="opc-card"
      style={{
        boxShadow: hov ? "0 8px 24px rgba(0,0,0,0.11)" : "0 1px 4px rgba(0,0,0,0.06)",
        transform: hov ? "translateY(-3px)" : "translateY(0)",
      }}
      role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onNavigate(product.id); }}
    >
      {/* Image zone */}
      <div className="opc-img-zone">
        <img
          src={mainImage} alt={product.nom} draggable={false}
          style={{ transform: hov ? "scale(1.05) translateY(-4px)" : "scale(1)" }}
        />
        <div className="opc-badge">-20% ABO</div>
      </div>

      {/* Content */}
      <div className="opc-body">
        <p className="opc-name">{label}</p>
        <p className="opc-sub">{ingredients}</p>

        {/* Stars */}
        <div className="opc-stars">
          {[1,2,3,4,5].map(i => (
            <svg key={i} width="11" height="11" fill={i <= 4 ? "#f97316" : "#e5e7eb"} viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          ))}
          <span className="opc-review-count">(12)</span>
        </div>

        {/* Toggle */}
        <div className="opc-toggle">
          {(["unique", "subscription"] as const).map(tp => (
            <button
              key={tp}
              onClick={e => { e.stopPropagation(); setType(tp); }}
              className="opc-toggle-btn"
              style={{
                border: `1px solid ${type === tp ? accent : "#e5e7eb"}`,
                background: type === tp ? light : "transparent",
                color: type === tp ? accent : "#aaa",
              }}
            >
              {tp === "unique" ? "Unique" : "Abonnement"}
            </button>
          ))}
        </div>

        {/* Price */}
        <div className="opc-price-wrap">
          {type === "subscription" && (
            <span className="opc-price-old">{euroFmt.format(product.prix)}</span>
          )}
          <span className="opc-price">{euroFmt.format(price)}</span>
        </div>

        {/* CTA */}
        <button
          className="opc-btn"
          onClick={handleAdd}
          style={{ background: added ? "#22c55e" : "#ef8035" }}
        >
          {added ? "✓ Ajouté !" : "AJOUTER AU PANIER"}
        </button>
      </div>

      <style jsx>{`
        .opc-card{width:220px;flex-shrink:0;scroll-snap-align:start;border-radius:16px;border:1px solid #f0f0f0;background:#fff;display:flex;flex-direction:column;overflow:hidden;cursor:pointer;transition:box-shadow 0.25s,transform 0.25s;}
        .opc-img-zone{background:#f0eeec;height:200px;display:flex;align-items:flex-end;justify-content:center;position:relative;padding-top:16px;}
        .opc-img-zone img{height:65%;width:auto;object-fit:contain;filter:drop-shadow(0 12px 20px rgba(0,0,0,0.13));transition:transform 0.3s;}
        .opc-badge{position:absolute;top:10px;right:10px;background:#111;color:#fff;font-size:9px;font-weight:900;padding:2px 8px;border-radius:20px;}
        .opc-body{padding:14px 14px 16px;display:flex;flex-direction:column;gap:8px;flex:1;}
        .opc-name{font-size:11px;font-weight:900;color:#111;text-transform:uppercase;letter-spacing:0.5px;margin:0;}
        .opc-sub{font-size:10px;color:#aaa;margin:0;line-height:1.4;}
        .opc-stars{display:flex;align-items:center;gap:2px;}
        .opc-review-count{font-size:9px;color:#bbb;margin-left:3px;}
        .opc-toggle{display:flex;gap:4px;}
        .opc-toggle-btn{flex:1;font-size:8px;font-weight:700;padding:5px 2px;border-radius:10px;cursor:pointer;transition:all 0.15s;}
        .opc-price-wrap{display:flex;flex-direction:column;gap:1px;margin-top:auto;}
        .opc-price-old{font-size:10px;color:#ccc;text-decoration:line-through;}
        .opc-price{font-size:16px;font-weight:900;color:#111;}
        .opc-btn{width:100%;padding:10px 0;border-radius:30px;border:none;color:#fff;font-size:10px;font-weight:700;letter-spacing:0.5px;cursor:pointer;transition:background 0.2s;}
        @media(max-width:768px){.opc-card{width:170px;}.opc-img-zone{height:160px;}}
      `}</style>
    </div>
  );
}

/* ── FAQ Item ── */
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
        .faq-item{border-radius:14px;background:#ffffff;border:1.4px solid #e8e2da;box-shadow:0 2px 8px rgba(0,0,0,0.04);overflow:hidden;transition:box-shadow .25s ease,border-color .25s ease,transform .2s ease;}
        @media(hover:hover){.faq-item:hover{box-shadow:0 8px 24px rgba(0,0,0,.08);transform:translateY(-1px);}}
        .faq-item.open{background:#ffffff;border-color:#d4cdc6;box-shadow:0 8px 20px rgba(0,0,0,.06);}
        .faq-btn{width:100%;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:16px 18px;background:transparent;border:0;cursor:pointer;text-align:left;transition:background .18s ease;}
        .faq-btn:hover{background:rgba(0,0,0,.02);}
        .faq-q{flex:1;font-weight:600;color:#3f372f;font-size:14px;line-height:1.5;letter-spacing:-0.01em;}
        .faq-plus{flex-shrink:0;width:26px;height:26px;display:grid;place-items:center;font-size:18px;color:#9f9f9f;line-height:1;transition:transform .28s ease,color .2s ease;font-weight:300;border-radius:50%;background:rgba(0,0,0,.03);}
        .faq-plus.rot{color:#ff7b42;background:rgba(255,123,66,.1);animation:popFaq .25s ease-out;}
        @keyframes popFaq{0%{transform:scale(.88);}60%{transform:scale(1.08);}100%{transform:scale(1);}}
        .faq-body{max-height:0;overflow:hidden;transition:max-height .35s cubic-bezier(.4,0,.2,1),opacity .25s ease;opacity:0;}
        .faq-item.open .faq-body{opacity:1;}
        .faq-a{margin:0;padding:4px 18px 16px 18px;color:#6a5f57;font-size:14px;line-height:1.7;letter-spacing:-0.005em;}
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
        .fmob-btn{width:100%;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:18px 0;background:transparent;border:0;cursor:pointer;text-align:left;}
        .fmob-q{flex:1;font-size:15px;font-weight:500;color:#1a1a1a;line-height:1.45;letter-spacing:-0.01em;}
        .fmob-plus{font-size:20px;color:#9a9a9a;font-weight:300;flex-shrink:0;line-height:1;}
        .fmob-body{max-height:0;overflow:hidden;transition:max-height .35s cubic-bezier(.4,0,.2,1),opacity .25s ease;opacity:0;}
        .fmob-item.open .fmob-body{opacity:1;}
        .fmob-a{margin:0;padding:0 0 18px 0;font-size:14px;line-height:1.75;color:#666;font-weight:300;}
        @media(prefers-reduced-motion:reduce){.fmob-body{transition:none!important;}}
      `}</style>
    </div>
  );
}

/* ── FAQ Section — myths merged as extra FAQ questions ── */
function ProductFAQSection({ config, t }: { config: ProductConfig; t: any }) {
  const { folder, faqTitle, faqSubtitle, faqs, myths } = config;

  // Convert myths into FAQ-style questions
  const mythFaqs = myths.map((m, i) => ({
    id: faqs.length + i + 1,
    question: m.myth,
    answer: `${t("reality_label")} ${m.reality}`,
  }));

  const allFaqs = [...faqs, ...mythFaqs];
  const leftFaqs = allFaqs.filter((_, i) => i % 2 === 0);
  const rightFaqs = allFaqs.filter((_, i) => i % 2 !== 0);

  return (
    <section className="faq-section" aria-labelledby={`faq-title-${folder}`}>
      <div className="faq-container">
        <header className="faq-header">
          <h2 id={`faq-title-${folder}`} className="faq-main-title">
            <span>{faqTitle}</span>
          </h2>
          {faqSubtitle && <p className="faq-subtitle">{faqSubtitle}</p>}
        </header>
        <div className="faq-desktop">
          <div className="faq-cols">
            <div className="faq-col">
              {leftFaqs.map(item => <FAQItem key={item.id} id={item.id} question={item.question} answer={item.answer} />)}
            </div>
            <div className="faq-col">
              {rightFaqs.map(item => <FAQItem key={item.id} id={item.id} question={item.question} answer={item.answer} />)}
            </div>
          </div>
        </div>
        <div className="faq-mobile">
          <div className="fmob-top-border" />
          {allFaqs.map(item => <FAQItemMobile key={item.id} id={item.id} question={item.question} answer={item.answer} />)}
        </div>
        <footer className="faq-footer">
          <p className="faq-footer-text">
            {t("faq_footer")}{" "}
            <a href="/contact" className="faq-footer-link">{t("faq_contact")}</a>
          </p>
        </footer>
      </div>
      <style jsx>{`
        .faq-section{position:relative;width:100%;padding:40px 20px 60px;background:#ffffff;overflow:hidden;isolation:isolate;}
        .faq-container{position:relative;max-width:960px;margin:0 auto;z-index:1;}
        .faq-header{text-align:center;margin-bottom:clamp(32px,5vw,56px);}
        .faq-main-title{margin:0 0 10px;font-size:clamp(24px,4vw,34px);font-weight:800;color:#3c3631;letter-spacing:-0.02em;display:flex;align-items:flex-start;justify-content:center;gap:12px;}
        .faq-subtitle{margin:0;font-size:clamp(13px,1.8vw,15px);color:#6a5f57;font-weight:400;letter-spacing:.01em;padding:0 16px;}
        .faq-desktop{display:block;}
        .faq-mobile{display:none;}
        .faq-cols{display:flex;gap:14px;align-items:flex-start;}
        .faq-col{flex:1;display:flex;flex-direction:column;gap:14px;}
        @media(max-width:767px){
          .faq-desktop{display:none;}
          .faq-mobile{display:block;}
          .fmob-top-border{display:none;}
          .faq-section{padding:44px 20px 52px;}
          .faq-header{margin-bottom:28px;}
          .faq-footer{border-top:none;padding-top:12px;}
        }
        @media(max-width:480px){
          .faq-section{padding:36px 16px 44px;}
          .faq-main-title{font-size:22px;gap:10px;}
        }
          .faq-footer{border-top:none;padding-top:12px;}
        .faq-footer{margin-top:clamp(40px,6vw,64px);text-align:center;padding-top:28px;border-top:1px solid #e8e2da;}
        .faq-footer-text{margin:0;font-size:14px;color:#6a5f57;}
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
      <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center px-5 py-4 text-left font-medium text-neutral-900 hover:bg-neutral-50 transition-colors text-[15px]">
        {title}
        <span className="text-xl text-neutral-600 ml-4 flex-shrink-0">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="px-5 pb-5 pt-2 bg-white">{children}</div>}
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
  const [allProducts, setAllProducts] = useState<DbProduct[]>([]);
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

        const { data: allProds } = await supabase.from("products").select("*");
        if (mounted.current && allProds) setAllProducts(allProds as DbProduct[]);

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

  const handleAddToCart = useCallback((p?: DbProduct, pt?: "unique" | "subscription") => {
    const targetProduct = p ?? product;
    const targetType = pt ?? purchaseType;
    if (!targetProduct) return;
    addToCart({ id: targetProduct.id, nom: targetProduct.nom, prix: targetProduct.prix, images: targetProduct.images, purchaseType: targetType } as any, targetType === "subscription");
  }, [addToCart, product, purchaseType]);

  const handleNavigateToProduct = useCallback((productId: number) => {
    router.push(`/product/${productId}`);
  }, [router]);

  if (loading) return (
    <div className="min-h-screen bg-white pt-[73px] grid place-items-center">
      <div className="relative w-12 h-12 sm:w-16 sm:h-16" role="status">
        <div className="absolute inset-0 border-4 border-neutral-200 rounded-full" />
        <div className="absolute inset-0 border-4 border-neutral-900 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
  if (!product) return null;

  return (
    <main className="bg-white min-h-screen text-neutral-900 pt-[73px]">

      {/* ── Subscription banner ── */}
      {subscriptionMode && (
        <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 pb-3 sm:pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm font-medium">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {t("subscription_mode")}
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {fetchError && (
        <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 pb-2">
          <div className="p-3 sm:p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm">{fetchError}</div>
        </div>
      )}

      {/* ── Hero ── */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-20">
        <div className="relative">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-start">

            {/* Colonne gauche — galerie sticky */}
            <div className="product-sticky">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <ProductImageGallery images={productImages} />
              </motion.div>
            </div>

            {/* Colonne droite */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4 sm:space-y-5 md:space-y-6"
            >
              {/* Title + rating */}
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-[42px] font-semibold tracking-tight mb-3 text-neutral-800 leading-tight">
                  {product.nom}
                </h1>
                {count > 0 && (
                  <div className="flex items-center gap-2 sm:gap-3 text-sm text-neutral-600">
                    <RatingStars value={avg} readonly />
                    <span className="text-xs sm:text-sm">({count} {t("verified_reviews")})</span>
                  </div>
                )}
              </div>

              {/* Story + highlights */}
              {(productKey || product.story || product.description) && (
                <div>
                  <p className="text-neutral-600 leading-relaxed text-[14px] sm:text-[15px] max-w-prose">
                    {productKey ? t(`products.${productKey}.story`) : (product.story || product.description)}
                  </p>
                  {productConfig && <ProductHighlights highlights={productConfig.highlights} />}
                  {!productKey && (product.benefits?.length ?? 0) > 0 && <BenefitsNoMiddle benefits={product.benefits!} />}
                </div>
              )}

              {/* Metadata chips */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 py-3 sm:py-5">
                {product.gummies_per_jar && (
                  <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-neutral-50">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                    <p className="text-xs sm:text-sm text-neutral-700 leading-snug">{product.gummies_per_jar} gummies/potje</p>
                  </div>
                )}
                {product.flavor && (
                  <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-neutral-50">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <p className="text-xs sm:text-sm text-neutral-700 leading-snug">{product.flavor}</p>
                  </div>
                )}
                {product.shipping_note && (
                  <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-neutral-50 col-span-2 sm:col-span-1">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 01-1 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>
                    <p className="text-xs sm:text-sm text-neutral-700 leading-snug">{product.shipping_note}</p>
                  </div>
                )}
              </div>

              {/* Purchase type selector */}
              <fieldset className="space-y-2.5 sm:space-y-3 mt-1" aria-label={t("one_time")}>
                {!subscriptionMode && (
                  <label className={`relative flex items-center justify-between p-4 sm:p-5 border-2 rounded-2xl transition-colors cursor-pointer ${purchaseType === "unique" ? "border-neutral-900 bg-white shadow-lg" : "border-neutral-200 bg-white/60 hover:border-neutral-300 hover:bg-white/80"}`}>
                    <div>
                      <span className="text-base sm:text-lg font-semibold block">{t("one_time")}</span>
                      <span className="text-xs sm:text-sm text-neutral-600">{t("one_time_sub")}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                      <span className="text-base sm:text-lg font-semibold text-neutral-900">{euroFmt.format(unitPrice)}</span>
                      <input type="radio" name="purchaseType" aria-label={t("one_time")} checked={purchaseType === "unique"} onChange={() => setPurchaseType("unique")} className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </label>
                )}

                <label className={`relative flex flex-col p-4 sm:p-5 border-2 rounded-2xl cursor-pointer transition-colors ${purchaseType === "subscription" ? "border-neutral-900 bg-white shadow-lg" : "border-neutral-200 bg-white/60 hover:border-neutral-300 hover:bg-white/80"}`}>
                  <span className="absolute -top-2 -right-2 bg-neutral-900 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full">
                    {subscriptionMode ? t("subscription_mode") : t("recommended")}
                  </span>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base sm:text-lg font-semibold">{t("subscription")}</span>
                      <span className="px-1.5 py-0.5 sm:px-2 bg-neutral-900 text-white text-[10px] sm:text-xs font-bold rounded">-20%</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 text-right">
                      <div className="leading-tight">
                        <span className="block text-xs sm:text-sm text-neutral-400 line-through">{euroFmt.format(unitPrice)}</span>
                        <span className="block text-base sm:text-lg font-semibold text-neutral-900">{euroFmt.format(subPrice)}</span>
                      </div>
                      <input type="radio" name="purchaseType" aria-label={t("subscription")} checked={purchaseType === "subscription"} onChange={() => setPurchaseType("subscription")} className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm text-neutral-600 mt-0.5">{t("subscription_sub")}</span>
                  <ul className="mt-3 pt-3 border-t border-neutral-200 space-y-2">
                    {[t("sub_perk_1"), t("sub_perk_2"), t("sub_perk_3"), t("sub_perk_4"), t("sub_perk_5")].map((perk, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-neutral-700">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="mt-0.5 flex-shrink-0">
                          <circle cx="8" cy="8" r="7.5" stroke="#1a1a1a"/><path d="M5 8l2 2 4-4" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {perk}
                      </li>
                    ))}
                  </ul>
                </label>
              </fieldset>

              {/* Add to cart CTA */}
              <button
                onClick={() => handleAddToCart()}
                className="w-full py-4 sm:py-5 bg-gradient-to-b from-neutral-900 to-neutral-800 text-white font-semibold text-base sm:text-lg rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all shadow-xl"
                aria-live="polite"
              >
                {subscriptionMode ? t("add_to_routine") : t("add_to_cart")} — {priceLabel}
              </button>

              {/* Ingrédients + Conseils d'utilisation */}
              {(product.ingredients?.length || productKey || product.usage_instructions) && (
                <div className="mt-6 sm:mt-10 space-y-2.5 sm:space-y-3">
                  {(product.ingredients?.length ?? 0) > 0 && (
                    <AccordionItem title={t("ingredients_title")}>
                      <p className="text-sm text-neutral-600 leading-relaxed font-light">
                        {productKey ? t(`products.${productKey}.ingredients`) : product.ingredients!.join(", ") + "."}
                      </p>
                    </AccordionItem>
                  )}
                  {(productKey || product.usage_instructions) && (
                    <AccordionItem title={t("usage_title")}>
                      <p className="text-sm sm:text-base text-neutral-700 leading-relaxed whitespace-pre-line">
                        {productKey ? t(`products.${productKey}.usage_instructions`) : product.usage_instructions}
                      </p>
                    </AccordionItem>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* ── Ingredients Slider ── */}
        {productKey && <IngredientsSlider productKey={productKey} t={t} />}

        {/* ── Routine Section ── */}
        {productConfig && (
          <ProductRoutineSection config={productConfig} productImages={productImages} />
        )}

        {/* ── Other Products Section ── */}
        <OtherProductsSection
          currentKey={productKey}
          products={allProducts}
          onAddToCart={(p) => handleAddToCart(p, "unique")}
          onNavigate={handleNavigateToProduct}
        />

        {/* ── FAQ (with myths integrated) ── */}
        {productConfig && (
          <ProductFAQSection config={productConfig} t={t} />
        )}

        {/* ── Reviews ── */}
        <div className="mt-12 sm:mt-20 pt-8 sm:pt-12 border-t border-neutral-300">
          <h2 className="text-xl sm:text-3xl font-light tracking-tight mb-6 sm:mb-8 text-neutral-800">
            {t("reviews_title")}
          </h2>
          <ProductReviews productId={product.id} />
        </div>
      </section>

      <style jsx global>{`
        .product-sticky {
          position: sticky;
          top: 90px;
          align-self: flex-start;
        }
        @media (max-width: 1023px) {
          .product-sticky {
            position: relative;
            top: auto;
          }
        }
      `}</style>
    </main>
  );
}