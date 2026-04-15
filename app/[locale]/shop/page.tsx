"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/contexts/CartContext";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { usePathname } from "next/navigation";

type DbProduct = {
  id: number; nom: string; prix: number; tagline?: string | null; story?: string | null;
  images?: string[] | string | null; benefits?: string[] | null; ingredients?: string[] | null;
  usage_instructions?: string | null; gummies_per_jar?: number | null; flavor?: string | null;
  shipping_note?: string | null; category?: string | null;
};

type ReviewSummary = { product_id: number; reviews_count: number; rating_avg: number; };

const PRODUCT_IMAGE_MAP: Record<string, string> = {
  shine:    "/image/nukuJaune.png",
  sleep:    "/image/nukuBleu.png",
  soul:     "/image/nukuViolet.png",
  strength: "/image/nukuRouge.png",
  source:   "/image/nukuVert.png",
};

const PRODUCT_COLOR_MAP: Record<string, { accent: string; bg: string; light: string; dot: string }> = {
  shine:    { accent: "#E8B84B", bg: "#f0eeec", light: "rgba(232,184,75,0.15)", dot: "#E8B84B" },
  sleep:    { accent: "#7B9FE0", bg: "#f0eeec", light: "rgba(123,159,224,0.15)", dot: "#7B9FE0" },
  soul:     { accent: "#9B8EC4", bg: "#f0eeec", light: "rgba(155,142,196,0.15)", dot: "#9B8EC4" },
  strength: { accent: "#E05A4E", bg: "#f0eeec", light: "rgba(224,90,78,0.15)", dot: "#E05A4E" },
  source:   { accent: "#5BA85A", bg: "#f0eeec", light: "rgba(91,168,90,0.15)", dot: "#5BA85A" },
};

const BUILD_BODY: Record<string, string> = {
  fr: "Chaque formule Nuku est pensée pour un besoin précis — sommeil, énergie, beauté, récupération ou équilibre.",
  en: "Each Nuku formula is designed for a specific need — sleep, energy, beauty, recovery or balance.",
  nl: "Elke Nuku-formule is ontworpen voor een specifieke behoefte — slaap, energie, schoonheid, herstel of balans.",
};

const COMBOS = [
  {
    key: "peace",
    nameKey: { fr: "Peace & Calm", en: "Peace & Calm", nl: "Peace & Calm" },
    descKey: { fr: "Sommeil & Relax — Le duo pour décompresser.", en: "Sleep & Relax — The duo for deep decompression.", nl: "Slaap & Rust — Het duo voor diepe ontspanning." },
    images: ["/image/nukuBleu.png", "/image/nukuViolet.png"],
    prix: 32,
  },
  {
    key: "beauty",
    nameKey: { fr: "Beauty Inside", en: "Beauty Inside", nl: "Beauty Inside" },
    descKey: { fr: "Cheveux & Digestion — Beauté et légèreté.", en: "Hair & Digestion — Daily beauty and lightness.", nl: "Haar & Spijsvertering — Dagelijkse schoonheid." },
    images: ["/image/nukuJaune.png", "/image/nukuVert.png"],
    prix: 32,
  },
  {
    key: "performance",
    nameKey: { fr: "Full Performance", en: "Full Performance", nl: "Full Performance" },
    descKey: { fr: "Force & Sommeil — Entraîne-toi fort, récupère mieux.", en: "Strength & Sleep — Train hard, recover better.", nl: "Kracht & Slaap — Train hard, herstel beter." },
    images: ["/image/nukuRouge.png", "/image/nukuBleu.png"],
    prix: 32,
  },
];

const CURES = [
  {
    key: "cure1",
    nameKey: { fr: "3 Months Cure", en: "3 Months Cure", nl: "3 Months Cure" },
    descKey: { fr: "Un trimestre complet pour ancrer vos habitudes.", en: "A full quarter to anchor your new habits.", nl: "Een volledig kwartaal om nieuwe gewoonten te vestigen." },
    images: ["/image/nukuRouge.png", "/image/nukuRouge.png", "/image/nukuRouge.png"],
    prix: 48,
  },
  {
    key: "cure2",
    nameKey: { fr: "3 Months Cure", en: "3 Months Cure", nl: "3 Months Cure" },
    descKey: { fr: "Profondeur et résultats durables sur 90 jours.", en: "Depth and lasting results over 90 days.", nl: "Diepte en duurzame resultaten over 90 dagen." },
    images: ["/image/nukuBleu.png", "/image/nukuBleu.png", "/image/nukuBleu.png"],
    prix: 48,
  },
  {
    key: "cure3",
    nameKey: { fr: "3 Months Cure", en: "3 Months Cure", nl: "3 Months Cure" },
    descKey: { fr: "La cure recommandée pour des effets visibles.", en: "The recommended cure for visible effects.", nl: "De aanbevolen kuur voor zichtbare effecten." },
    images: ["/image/nukuViolet.png", "/image/nukuViolet.png", "/image/nukuViolet.png"],
    prix: 48,
  },
];

function getProductKey(nom: string): string {
  const n = nom.toLowerCase();
  if (n.includes("shine"))    return "shine";
  if (n.includes("sleep"))    return "sleep";
  if (n.includes("soul"))     return "soul";
  if (n.includes("strength") || n.includes("strenght")) return "strength";
  if (n.includes("source"))   return "source";
  return "shine";
}

function getLocalImage(nom: string): string {
  return PRODUCT_IMAGE_MAP[getProductKey(nom)] ?? "/image/nukuJaune.png";
}

function getColors(nom: string) {
  return PRODUCT_COLOR_MAP[getProductKey(nom)] ?? PRODUCT_COLOR_MAP.shine;
}

const euroFmt = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className="w-3.5 h-3.5" fill={i <= Math.round(value) ? "#f97316" : "#e5e7eb"} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
}

// ─── Mobile Product Card (full-width, horizontal layout) ────────────────────
function MobileProductCard({
  p, i, lang, type, price, summary, isAdded, colors, img,
  onTypeChange, onAdd, onView,
}: {
  p: DbProduct; i: number; lang: string;
  type: "unique" | "subscription"; price: number;
  summary?: { avg: number; count: number };
  isAdded: boolean; colors: ReturnType<typeof getColors>;
  img: string;
  onTypeChange: (t: "unique" | "subscription") => void;
  onAdd: () => void;
  onView: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: i * 0.07 }}
      className="rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden"
    >
      <div className="flex">
        {/* Left: image */}
        <div
          className="flex-none flex items-end justify-center relative"
          style={{ background: "#f0eeec", width: 110, minHeight: 130 }}
        >
          <img
            src={img}
            alt={p.nom}
            className="object-contain"
            style={{ height: "88%", width: "auto", filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.14))" }}
          />
          <div
            className="absolute top-2 left-2 text-[8px] font-black px-1.5 py-0.5 rounded-full"
            style={{ background: colors.accent, color: "#fff" }}
          >
            -20%
          </div>
        </div>

        {/* Right: content */}
        <div className="flex-1 px-3.5 py-3.5 flex flex-col gap-2 min-w-0">
          <div>
            <p className="text-[12px] font-black text-neutral-900 uppercase tracking-wide leading-tight">{p.nom}</p>
            {p.tagline && (
              <p className="text-[10px] text-neutral-400 leading-snug mt-0.5 line-clamp-2">{p.tagline}</p>
            )}
            {summary && summary.count > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <StarRating value={summary.avg} />
                <span className="text-[9px] text-neutral-400">({summary.count})</span>
              </div>
            )}
          </div>

          {/* Toggle one-time / subscription */}
          <div className="flex gap-1">
            {(["unique", "subscription"] as const).map(tp => (
              <button
                key={tp}
                onClick={() => onTypeChange(tp)}
                className="flex-1 text-[9px] font-bold py-1 rounded-lg border transition-all"
                style={{
                  borderColor: type === tp ? colors.accent : "#e5e7eb",
                  background: type === tp ? colors.light : "transparent",
                  color: type === tp ? colors.accent : "#9ca3af",
                }}
              >
                {tp === "unique"
                  ? (lang === "fr" ? "Unique" : lang === "en" ? "One-time" : "Eenmalig")
                  : (lang === "fr" ? "Abo" : lang === "en" ? "Subscribe" : "Abonnement")}
              </button>
            ))}
          </div>

          {/* Price row + add button */}
          <div className="flex items-center justify-between gap-2 mt-auto">
            <div className="flex flex-col leading-none">
              {type === "subscription" && (
                <span className="text-[9px] text-neutral-300 line-through">{euroFmt.format(p.prix)}</span>
              )}
              <span className="text-[15px] font-black text-neutral-900">{euroFmt.format(price)}</span>
            </div>
            <button
              onClick={onAdd}
              className="flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-all"
              style={{
                background: isAdded ? "#22c55e" : "#ED9446",
                color: "#fff",
                maxWidth: 110,
              }}
            >
              {isAdded
                ? "✓ " + (lang === "fr" ? "Ajouté!" : lang === "en" ? "Added!" : "Toegevoegd!")
                : (lang === "fr" ? "Ajouter" : lang === "en" ? "Add to cart" : "Toevoegen")}
            </button>
          </div>

          <button onClick={onView} className="text-left text-[9px] text-neutral-400 underline underline-offset-2 -mt-1">
            {lang === "fr" ? "Voir le produit →" : lang === "en" ? "View product →" : "Bekijk →"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ShopPage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const pathname = usePathname();
  const segments = pathname?.split("/").filter(Boolean) ?? [];
  const lang = ["fr", "en", "nl"].includes(segments[0]) ? segments[0] : "fr";

  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [summaryMap, setSummaryMap] = useState<Record<number, { avg: number; count: number }>>({});
  const [addedId, setAddedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [purchaseTypes, setPurchaseTypes] = useState<Record<number, "unique" | "subscription">>({});

  const categories = [
    { name: lang === 'fr' ? 'Sommeil' : lang === 'en' ? 'Sleep' : 'Slaap', sub: lang === 'fr' ? 'Mélatonine · L-théanine · Magnésium' : 'Melatonin · L-theanine · Magnesium', image: '/image/nukuBleu.png', link: `/${lang}/product/12`, prix: 18 },
    { name: lang === 'fr' ? 'Relax & équilibre' : lang === 'en' ? 'Relax & balance' : 'Rust & balans', sub: lang === 'fr' ? 'Ashwagandha · Rhodiola · Safran' : 'Ashwagandha · Rhodiola · Saffron', image: '/image/nukuViolet.png', link: `/${lang}/product/16`, prix: 18 },
    { name: lang === 'fr' ? 'Force & endurance' : lang === 'en' ? 'Strength & endurance' : 'Kracht & uithoudingsvermogen', sub: lang === 'fr' ? 'Créatine · Vitamine B12 · D3' : 'Creatine · Vitamin B12 · D3', image: '/image/nukuRouge.png', link: `/${lang}/product/14`, prix: 18 },
    { name: lang === 'fr' ? 'Cheveux & beauté' : lang === 'en' ? 'Hair & beauty' : 'Haar & schoonheid', sub: lang === 'fr' ? 'Biotine · Zinc · MSM' : 'Biotin · Zinc · MSM', image: '/image/nukuJaune.png', link: `/${lang}/product/11`, prix: 18 },
    { name: lang === 'fr' ? 'Digestion' : lang === 'en' ? 'Digestion' : 'Spijsvertering', sub: lang === 'fr' ? 'Matcha · Artichaut · Pissenlit' : 'Matcha · Artichoke · Dandelion', image: '/image/nukuVert.png', link: `/${lang}/product/13`, prix: 18 },
  ];
  const [routineQty, setRoutineQty] = useState<number[]>([1, 1, 1, 1, 1]);
  const [routineAdded, setRoutineAdded] = useState(false);

  const routineTotal = routineQty.reduce((sum, q, i) => sum + q * categories[i].prix, 0);
  const routineSub = Math.round(routineTotal * 0.95);

  const changeQty = (i: number, delta: number) => {
    setRoutineQty(prev => { const next = [...prev]; next[i] = Math.max(0, next[i] + delta); return next; });
  };

  const handleRoutineAdd = (type: 'one-time' | 'sub') => {
    const isSub = type === 'sub';
    categories.forEach((cat, i) => {
      if (routineQty[i] > 0) {
        const productId = Number(cat.link.split('/').pop());
        for (let q = 0; q < routineQty[i]; q++) {
          addToCart({ id: productId, nom: cat.name, prix: cat.prix, images: [cat.image] } as any, isSub);
        }
      }
    });
    setRoutineAdded(true);
    setTimeout(() => setRoutineAdded(false), 2000);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: prod }, { data: summaries }] = await Promise.all([
        supabase.from("products").select("*").eq("actif", true).order("id", { ascending: true }),
        supabase.from("reviews_summary").select("*"),
      ]);
      setProducts((prod as DbProduct[]) ?? []);
      const map: Record<number, { avg: number; count: number }> = {};
      (summaries as ReviewSummary[] | null)?.forEach(r => {
        map[r.product_id] = { avg: Number(r.rating_avg ?? 0), count: Number(r.reviews_count ?? 0) };
      });
      setSummaryMap(map);
      setLoading(false);
    })();
  }, []);

  const getPurchaseType = (id: number) => purchaseTypes[id] ?? "unique";
  const setPurchaseType = (id: number, type: "unique" | "subscription") =>
    setPurchaseTypes(prev => ({ ...prev, [id]: type }));

  const getPrice = (p: DbProduct, type: "unique" | "subscription") =>
    type === "subscription" ? p.prix * 0.8 : p.prix;

  const handleAdd = (p: DbProduct, key?: string) => {
    const type = getPurchaseType(p.id);
    addToCart({ id: p.id, nom: p.nom, prix: p.prix, images: [getLocalImage(p.nom)] } as any, type === "subscription");
    const k = key ?? String(p.id);
    setAddedId(k);
    setTimeout(() => setAddedId(null), 1800);
  };

  const handleComboAdd = (key: string) => {
    setAddedId(key);
    setTimeout(() => setAddedId(null), 1800);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white pt-[73px]">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 border-4 border-neutral-100 rounded-full" />
        <div className="absolute inset-0 border-4 border-neutral-800 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen pt-[73px]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ══════════════════════════════════════════
          BUILD YOUR BALANCE
      ══════════════════════════════════════════ */}
      <section className="py-8 px-4 md:py-14 md:px-16 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1
              className="text-[28px] md:text-5xl font-black text-neutral-900 mb-1.5"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Build your balance
            </h1>
            <p className="text-[12px] md:text-[14px] text-neutral-400 mb-2">
              {lang === "fr"
                ? "Choisissez le produit adapté à votre objectif du moment."
                : lang === "en"
                ? "Choose the product that fits your current goal."
                : "Kies het product dat past bij uw huidige doel."}
            </p>
            <p className="text-[12px] md:text-[15px] text-neutral-500 leading-relaxed max-w-2xl mb-6 md:mb-10">
              {BUILD_BODY[lang] ?? BUILD_BODY.fr}
            </p>
          </motion.div>

          {/* ── MOBILE: vertical stacked cards ── */}
          <div className="flex flex-col gap-3 md:hidden">
            {products.map((p, i) => {
              const colors = getColors(p.nom);
              const img = getLocalImage(p.nom);
              const type = getPurchaseType(p.id);
              const price = getPrice(p, type);
              const summary = summaryMap[p.id];
              const isAdded = addedId === String(p.id);

              return (
                <MobileProductCard
                  key={p.id}
                  p={p} i={i} lang={lang}
                  type={type} price={price}
                  summary={summary && summary.count > 0 ? summary : undefined}
                  isAdded={isAdded} colors={colors} img={img}
                  onTypeChange={(t) => setPurchaseType(p.id, t)}
                  onAdd={() => handleAdd(p)}
                  onView={() => router.push(`/${lang}/product/${p.id}`)}
                />
              );
            })}
          </div>

          {/* ── DESKTOP: 3-column grid ── */}
          <div className="hidden md:grid grid-cols-3 gap-6">
            {products.map((p, i) => {
              const colors = getColors(p.nom);
              const img = getLocalImage(p.nom);
              const type = getPurchaseType(p.id);
              const price = getPrice(p, type);
              const summary = summaryMap[p.id];
              const isAdded = addedId === String(p.id);
              const isHov = hoveredId === p.id;

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  onMouseEnter={() => setHoveredId(p.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="rounded-2xl border border-neutral-100 overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <div className="w-full flex items-end justify-center overflow-hidden relative" style={{ background: "#f0eeec", height: "260px" }}>
                    <motion.img
                      src={img} alt={p.nom} className="object-contain"
                      style={{ height: "82%", width: "auto", filter: "drop-shadow(0 16px 28px rgba(0,0,0,0.14))" }}
                      animate={{ y: isHov ? -8 : 0, scale: isHov ? 1.05 : 1 }}
                      transition={{ duration: 0.35 }}
                    />
                    <div className="absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-full"
                      style={{ background: colors.accent, color: "#fff" }}>-20% ABO</div>
                  </div>
                  <div className="px-5 py-5 flex flex-col flex-1 gap-3">
                    <div>
                      <p className="text-[13px] font-black text-neutral-900 uppercase tracking-wide leading-tight mb-1">{p.nom}</p>
                      {p.tagline && <p className="text-[11px] text-neutral-400 leading-relaxed line-clamp-2">{p.tagline}</p>}
                      {summary && summary.count > 0 && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <StarRating value={summary.avg} />
                          <span className="text-[9px] text-neutral-400">({summary.count})</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      {(["unique", "subscription"] as const).map(tp => (
                        <button key={tp} onClick={() => setPurchaseType(p.id, tp)}
                          className="flex-1 text-[10px] font-bold py-1.5 rounded-xl border transition-all"
                          style={{ borderColor: type === tp ? colors.accent : "#e5e7eb", background: type === tp ? colors.light : "transparent", color: type === tp ? colors.accent : "#9ca3af" }}>
                          {tp === "unique" ? (lang === "fr" ? "Unique" : lang === "en" ? "One-time" : "Eenmalig") : (lang === "fr" ? "Abonnement" : lang === "en" ? "Subscribe" : "Abonnement")}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        {type === "subscription" && <span className="text-[10px] text-neutral-400 line-through block">{euroFmt.format(p.prix)}</span>}
                        <span className="text-[16px] font-black text-neutral-900">{euroFmt.format(price)}</span>
                      </div>
                      <Link href={`/${lang}/product/${p.id}`} className="text-[10px] font-semibold text-neutral-400 hover:text-neutral-700 underline underline-offset-2">
                        {lang === "fr" ? "Voir le produit" : lang === "en" ? "View product" : "Bekijk"}
                      </Link>
                    </div>
                    <button onClick={() => handleAdd(p)}
                      className="w-full py-3 rounded-full text-[12px] font-bold uppercase tracking-wide transition-all"
                      style={{ background: isAdded ? "#22c55e" : "#ED9446", color: "#fff", transform: isAdded ? "scale(0.97)" : "scale(1)" }}>
                      {isAdded ? "✓ " + (lang === "fr" ? "Ajouté !" : lang === "en" ? "Added!" : "Toegevoegd!") : (lang === "fr" ? "Ajouter au panier" : lang === "en" ? "Add to cart" : "Toevoegen")}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          NOS COMBOS
      ══════════════════════════════════════════ */}
      <section className="py-8 md:py-14 px-4 md:px-16 border-t border-neutral-100" style={{ background: "#FDFAF5" }}>
        <div className="max-w-[1400px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-[22px] md:text-4xl font-black text-neutral-900 mb-1" style={{ fontFamily: "'Georgia', serif" }}>
              {lang === "fr" ? "Nos combos" : lang === "en" ? "Our combos" : "Onze combo's"}
            </h2>
            <p className="text-[11px] md:text-[13px] text-neutral-400 mb-6 md:mb-10">
              {lang === "fr" ? "Deux produits pensés ensemble pour des effets amplifiés."
                : lang === "en" ? "Two products designed together for amplified effects."
                : "Twee producten samen ontworpen voor versterkte effecten."}
            </p>
          </motion.div>

          {/* Mobile: horizontal scroll for combos */}
          <div className="flex md:hidden gap-3 overflow-x-auto pb-3 snap-x -mx-4 px-4" style={{ scrollbarWidth: "none" }}>
            {COMBOS.map((combo, i) => {
              const isAdded = addedId === combo.key;
              return (
                <motion.div
                  key={combo.key}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="flex-none snap-start rounded-2xl border border-neutral-100 bg-white overflow-hidden shadow-sm"
                  style={{ width: 200 }}
                >
                  <div className="w-full flex items-end justify-center relative overflow-hidden" style={{ background: "#f0eeec", height: 150 }}>
                    <img src={combo.images[0]} alt="" className="object-contain absolute"
                      style={{ height: "70%", left: "22%", bottom: 0, filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.15))", transform: "rotate(-8deg)" }} />
                    <img src={combo.images[1]} alt="" className="object-contain absolute"
                      style={{ height: "70%", right: "22%", bottom: 0, filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.15))", transform: "rotate(6deg)" }} />
                  </div>
                  <div className="px-3.5 py-3.5">
                    <p className="text-[11px] font-black text-neutral-900 uppercase tracking-wide mb-1">
                      {combo.nameKey[lang as "fr" | "en" | "nl"]}
                    </p>
                    <p className="text-[10px] text-neutral-500 leading-snug mb-3">
                      {combo.descKey[lang as "fr" | "en" | "nl"]}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[17px] font-black text-neutral-900">{combo.prix}€</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#111", color: "#fff" }}>-10%</span>
                    </div>
                    <button
                      onClick={() => handleComboAdd(combo.key)}
                      className="w-full py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all"
                      style={{ background: isAdded ? "#22c55e" : "#ED9446", color: "#fff" }}
                    >
                      {isAdded ? "✓ " + (lang === "fr" ? "Ajouté!" : "Added!") : (lang === "fr" ? "Ajouter" : lang === "en" ? "Add to cart" : "Toevoegen")}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Desktop: 3-col grid for combos */}
          <div className="hidden md:grid grid-cols-3 gap-5">
            {COMBOS.map((combo, i) => {
              const isAdded = addedId === combo.key;
              return (
                <motion.div
                  key={combo.key}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="rounded-2xl border border-neutral-100 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-full flex items-end justify-center relative overflow-hidden" style={{ background: "#f0eeec", height: "200px" }}>
                    <img src={combo.images[0]} alt="" className="object-contain absolute"
                      style={{ height: "72%", left: "28%", bottom: "0", filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.16))", transform: "rotate(-8deg)" }} />
                    <img src={combo.images[1]} alt="" className="object-contain absolute"
                      style={{ height: "72%", right: "28%", bottom: "0", filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.16))", transform: "rotate(6deg)" }} />
                  </div>
                  <div className="px-5 py-5">
                    <p className="text-[13px] font-black text-neutral-900 uppercase tracking-wide mb-1">{combo.nameKey[lang as "fr" | "en" | "nl"]}</p>
                    <p className="text-[11px] text-neutral-500 leading-relaxed mb-4">{combo.descKey[lang as "fr" | "en" | "nl"]}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[20px] font-black text-neutral-900">{combo.prix}€</span>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "#111", color: "#fff" }}>-10%</span>
                    </div>
                    <button onClick={() => handleComboAdd(combo.key)}
                      className="w-full py-2.5 rounded-full text-[12px] font-bold uppercase tracking-wide transition-all"
                      style={{ background: isAdded ? "#22c55e" : "#ED9446", color: "#fff" }}>
                      {isAdded ? "✓ " + (lang === "fr" ? "Ajouté !" : lang === "en" ? "Added!" : "Toegevoegd!") : (lang === "fr" ? "Ajouter au panier" : lang === "en" ? "Add to cart" : "Toevoegen")}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ── Cures ── */}
          {/* Mobile: horizontal scroll */}
          <div className="flex md:hidden gap-3 overflow-x-auto pb-3 mt-4 snap-x -mx-4 px-4" style={{ scrollbarWidth: "none" }}>
            {CURES.map((cure, i) => {
              const isAdded = addedId === cure.key;
              return (
                <motion.div
                  key={cure.key}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="flex-none snap-start rounded-2xl border border-neutral-100 bg-white overflow-hidden shadow-sm"
                  style={{ width: 200 }}
                >
                  <div className="w-full relative overflow-hidden" style={{ background: "#f0eeec", height: 150 }}>
                    <img src={cure.images[0]} alt="" className="object-contain absolute"
                      style={{ height: "65%", bottom: 0, left: "10%", filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.12))", zIndex: 5 }} />
                    <img src={cure.images[1]} alt="" className="object-contain absolute"
                      style={{ height: "72%", bottom: 0, left: "50%", transform: "translateX(-50%)", filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.15))", zIndex: 10 }} />
                    <img src={cure.images[2]} alt="" className="object-contain absolute"
                      style={{ height: "65%", bottom: 0, right: "10%", filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.12))", zIndex: 5 }} />
                  </div>
                  <div className="px-3.5 py-3.5">
                    <p className="text-[11px] font-black text-neutral-900 uppercase tracking-wide mb-1">
                      {cure.nameKey[lang as "fr" | "en" | "nl"]}
                    </p>
                    <p className="text-[10px] text-neutral-500 leading-snug mb-3">
                      {cure.descKey[lang as "fr" | "en" | "nl"]}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[17px] font-black text-neutral-900">{cure.prix}€</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#111", color: "#fff" }}>-15%</span>
                    </div>
                    <button
                      onClick={() => { setAddedId(cure.key); setTimeout(() => setAddedId(null), 1800); }}
                      className="w-full py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all"
                      style={{ background: isAdded ? "#22c55e" : "#ED9446", color: "#fff" }}
                    >
                      {isAdded ? "✓ " + (lang === "fr" ? "Ajouté!" : "Added!") : (lang === "fr" ? "Ajouter" : lang === "en" ? "Add to cart" : "Toevoegen")}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Desktop: 3-col grid for cures */}
          <div className="hidden md:grid grid-cols-3 gap-5 mt-6">
            {CURES.map((cure, i) => {
              const isAdded = addedId === cure.key;
              return (
                <motion.div
                  key={cure.key}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="rounded-2xl border border-neutral-100 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-full relative overflow-hidden" style={{ background: "#f0eeec", height: "200px" }}>
                    <img src={cure.images[0]} alt="" className="object-contain absolute"
                      style={{ height: "68%", bottom: "0", left: "15%", filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.12))", zIndex: 5 }} />
                    <img src={cure.images[1]} alt="" className="object-contain absolute"
                      style={{ height: "75%", bottom: "0", left: "50%", transform: "translateX(-50%)", filter: "drop-shadow(0 12px 22px rgba(0,0,0,0.16))", zIndex: 10 }} />
                    <img src={cure.images[2]} alt="" className="object-contain absolute"
                      style={{ height: "68%", bottom: "0", right: "15%", filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.12))", zIndex: 5 }} />
                  </div>
                  <div className="px-5 py-5">
                    <p className="text-[13px] font-black text-neutral-900 uppercase tracking-wide mb-1">{cure.nameKey[lang as "fr" | "en" | "nl"]}</p>
                    <p className="text-[11px] text-neutral-500 leading-relaxed mb-4">{cure.descKey[lang as "fr" | "en" | "nl"]}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[20px] font-black text-neutral-900">{cure.prix}€</span>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "#111", color: "#fff" }}>-15%</span>
                    </div>
                    <button onClick={() => { setAddedId(cure.key); setTimeout(() => setAddedId(null), 1800); }}
                      className="w-full py-2.5 rounded-full text-[12px] font-bold uppercase tracking-wide transition-all"
                      style={{ background: isAdded ? "#22c55e" : "#ED9446", color: "#fff" }}>
                      {isAdded ? "✓ " + (lang === "fr" ? "Ajouté !" : lang === "en" ? "Added!" : "Toegevoegd!") : (lang === "fr" ? "Ajouter au panier" : lang === "en" ? "Add to cart" : "Toevoegen")}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PERSONNALISEZ VOTRE PACK
      ══════════════════════════════════════════ */}
      <section className="py-8 md:py-12 px-4 md:px-16 bg-white border-t border-neutral-100">
        <div className="max-w-[1400px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-[22px] md:text-4xl font-black text-neutral-900 mb-1" style={{ fontFamily: "'Georgia', serif" }}>
              {lang === "fr" ? "Votre pack" : lang === "en" ? "Customize your pack" : "Uw pakket"}
            </h2>
            <p className="text-[11px] md:text-[13px] text-neutral-400 mb-5 md:mb-10">
              {lang === "fr" ? "Composez votre routine — jusqu'à -30%"
                : lang === "en" ? "Build your routine — up to -30%"
                : "Stel uw routine samen — tot -30%"}
            </p>
          </motion.div>

          {/* Product selector: horizontal scroll on mobile */}
          <div className="flex gap-3 overflow-x-auto pb-3 snap-x -mx-4 px-4 md:mx-0 md:px-0" style={{ scrollbarWidth: "none" }}>
            {categories.map((cat, i) => (
              <div
                key={i}
                className="flex-none snap-start rounded-xl border border-neutral-100 overflow-hidden bg-white"
                style={{ width: 120 }}
              >
                <div className="w-full flex items-end justify-center overflow-hidden" style={{ background: "#f0eeec", height: 110 }}>
                  <img src={cat.image} alt={cat.name} className="w-[80%] object-contain"
                    style={{ filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.14))" }} />
                </div>
                <div className="px-2.5 py-2.5">
                  <p className="text-[9px] font-black text-neutral-900 uppercase tracking-wide leading-tight">{cat.name}</p>
                  <p className="text-[8px] text-neutral-400 mt-0.5 leading-tight mb-2 line-clamp-2">{cat.sub}</p>
                  {/* Qty controls — larger tap targets on mobile */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => changeQty(i, -1)}
                      className="w-[26px] h-[26px] rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 active:bg-neutral-100 text-sm leading-none"
                      style={{ touchAction: "manipulation" }}
                    >−</button>
                    <span className="text-[13px] font-semibold text-neutral-800 w-5 text-center">{routineQty[i]}</span>
                    <button
                      onClick={() => changeQty(i, 1)}
                      className="w-[26px] h-[26px] rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 active:bg-neutral-100 text-sm leading-none"
                      style={{ touchAction: "manipulation" }}
                    >+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary / CTA box */}
          <div className="mt-4 md:mt-8 border border-neutral-200 rounded-2xl p-4 md:p-8">
            <p className="text-[11px] md:text-[13px] font-semibold text-neutral-600 mb-3">
              {lang === "fr" ? "Mon pack :" : lang === "en" ? "My pack:" : "Mijn pakket:"}
            </p>

            {/* Preview images — compact on mobile */}
            <div className="flex items-center gap-1.5 flex-wrap mb-4 min-h-[40px]">
              {categories.map((cat, i) =>
                Array.from({ length: routineQty[i] }).map((_, j) => (
                  <div key={`${i}-${j}`} className="flex items-center gap-1">
                    {(i > 0 || j > 0) && <span className="text-neutral-300 text-base font-light">+</span>}
                    <img src={cat.image} alt={cat.name} className="object-contain"
                      style={{ height: 38, width: "auto", filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.12))" }} />
                  </div>
                ))
              )}
            </div>

            {/* Buy buttons — stacked on mobile */}
            <div className="flex flex-col gap-2.5 sm:grid sm:grid-cols-2">
              <button
                onClick={() => handleRoutineAdd("one-time")}
                className="flex items-center justify-between border border-neutral-200 rounded-xl px-4 py-3.5 active:bg-neutral-50 transition-all w-full text-left"
                style={{ touchAction: "manipulation" }}
              >
                <span className="text-[12px] md:text-[13px] font-medium text-neutral-600">
                  {lang === "fr" ? "Achat unique" : lang === "en" ? "One-time" : "Eenmalig"}
                </span>
                <span className="text-[16px] font-bold text-neutral-900">{routineTotal}€</span>
              </button>

              <button
                onClick={() => handleRoutineAdd("sub")}
                className="flex items-center justify-between border-2 rounded-xl px-4 py-3.5 active:bg-orange-50 transition-all w-full text-left"
                style={{ borderColor: "#ED9446", touchAction: "manipulation" }}
              >
                <span className="text-[12px] md:text-[13px] font-medium text-neutral-600">
                  {lang === "fr" ? "Abonnement" : lang === "en" ? "Subscribe" : "Abonnement"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: "#111", color: "#fff" }}>-5%</span>
                  <span className="text-[15px] font-bold text-neutral-900">
                    {routineSub}€<span className="text-[10px] font-medium text-neutral-500">/{lang === "fr" ? "mois" : lang === "en" ? "mo" : "mnd"}</span>
                  </span>
                </div>
              </button>
            </div>

            <AnimatePresence>
              {routineAdded && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[12px] font-semibold"
                  style={{ background: "#f0faf0", color: "#2d7a2d", border: "1px solid #b6e6b6" }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {lang === "fr" ? "Produits ajoutés au panier !" : lang === "en" ? "Products added to cart!" : "Producten toegevoegd!"}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

    </div>
  );
}