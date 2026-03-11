"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, animate, useTransform } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

/* ================== TYPES ================== */
type Product = {
  id: number;
  nom: string;
  images?: string[] | string | null;
  prix?: number;
  tagline?: string | null;
};

/* ================== FALLBACK LOCAL ================== */
const STATIC_HERO_IMAGES: string[] = [
  "/image/nukuBleu.png",
  "/image/nukuJaune.png",
  "/image/nukuRouge.png",
  "/image/nukuVert.png",
  "/image/nukuViolet.png",
];

/* ================== HELPERS ================== */
function normalizeImagesField(images: Product["images"]): string[] {
  try {
    if (!images) return [];
    if (Array.isArray(images)) return images.filter((x) => typeof x === "string" && x.trim().length > 0);
    if (typeof images === "string") {
      const t = images.trim();
      if ((t.startsWith("[") && t.endsWith("]")) || (t.startsWith('"') && t.endsWith('"'))) {
        const parsed = JSON.parse(t);
        if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === "string" && x.trim().length > 0);
        if (typeof parsed === "string" && parsed.trim()) return [parsed.trim()];
      }
      if (t.includes(",")) return t.split(",").map((s) => s.trim()).filter((x) => x.length > 0);
      if (t.length > 0) return [t];
    }
    return [];
  } catch { return []; }
}

function uniqueUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of urls) {
    const k = (u || "").trim();
    if (k && !seen.has(k)) { seen.add(k); out.push(k); }
  }
  return out;
}

/* ================== CARROUSEL ORBIT RESPONSIVE ================== */
function FaceLockedOrbitCarousel({
  images,
  speed = 14,
}: {
  images: string[];
  speed?: number;
}) {
  const items = images.slice(0, 10).filter(Boolean);
  const count = Math.max(1, items.length);
  const stepDeg = 360 / count;
  const deg2rad = Math.PI / 180;

  // Responsive dimensions via state
  const [dims, setDims] = useState({ width: 160, height: 220, radius: 300, perspective: 1400 });

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w < 480) {
        setDims({ width: 100, height: 140, radius: 160, perspective: 800 });
      } else if (w < 768) {
        setDims({ width: 130, height: 180, radius: 220, perspective: 1000 });
      } else if (w < 1024) {
        setDims({ width: 160, height: 220, radius: 300, perspective: 1200 });
      } else {
        setDims({ width: 200, height: 280, radius: 380, perspective: 1600 });
      }
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const spin = useMotionValue(0);
  useEffect(() => {
    const controls = animate(spin, 360, { duration: speed, ease: "linear", repeat: Infinity });
    return () => controls.stop();
  }, [spin, speed]);

  const { width, height, radius, perspective } = dims;

  return (
    <div
      className="w-full flex justify-center items-center"
      style={{ perspective: `${perspective}px`, height: `${height + 60}px` }}
    >
      <div
        className="relative select-none"
        style={{
          width: `${width + radius * 1.6}px`,
          height: `${height + 60}px`,
          transformStyle: "preserve-3d",
        }}
      >
        {items.map((src, i) => {
          const angleRad = useTransform(spin, (deg) => (deg + i * stepDeg) * deg2rad);
          const xPx = useTransform(angleRad, (a) => Math.sin(a) * radius);
          const zPx = useTransform(angleRad, (a) => Math.cos(a) * radius);
          const transformStr = useTransform([xPx, zPx], ([x, z]) =>
            `translate(-50%, -50%) translate3d(${x}px, 0, ${z}px)`
          );

          return (
            <motion.div
              key={`${src}-${i}`}
              className="absolute left-1/2 top-1/2 will-change-transform"
              style={{ transform: transformStr, transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
            >
              <img
                src={src}
                alt={`slide-${i + 1}`}
                draggable={false}
                style={{
                  width,
                  height,
                  objectFit: "contain",
                  filter: "drop-shadow(0 16px 32px rgba(0,0,0,0.18))",
                }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0.2"; }}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ================== CARD PRODUIT ================== */
function ProductCard({ product, idx }: { product: Product; idx: number }) {
  const firstImage = normalizeImagesField(product.images)[0];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.07 }}
    >
      <Link href={`/product/${product.id}?mode=subscription`} className="group block">
        <div className="flex flex-col items-center text-center">

          {/* Image flottante */}
          <div className="relative w-full flex items-center justify-center mb-2 md:mb-3">
            {firstImage ? (
              <img
                src={firstImage}
                alt={product.nom}
                className="w-full object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-[0_16px_32px_rgba(0,0,0,0.14)]"
                style={{ maxHeight: "180px" }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0.2"; }}
              />
            ) : (
              <div className="text-neutral-300 text-sm h-32">Image indisponible</div>
            )}
            <span className="absolute top-0 right-0 bg-[#ef8035] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
              −20%
            </span>
          </div>

          {/* Nom */}
          <p className="text-[11px] md:text-xs tracking-[0.14em] uppercase text-neutral-500 font-medium mb-1.5">{product.nom}</p>

          {/* Prix */}
          <div className="flex items-baseline justify-center gap-1.5 mb-4">
            <span className="text-sm md:text-base font-semibold text-neutral-900">
              {product.prix ? (product.prix * 0.8).toFixed(2) : "—"}€
            </span>
            {product.prix && (
              <span className="text-[11px] text-neutral-400 line-through">{product.prix.toFixed(2)}€</span>
            )}
            <span className="text-[11px] text-neutral-400">/ mois</span>
          </div>

          {/* Bouton toujours visible */}
          <button className="w-full py-2 md:py-2.5 bg-neutral-900 text-white rounded-full text-xs md:text-sm font-medium transition-all duration-200 hover:bg-neutral-700 active:scale-[0.98]">
            Ajouter à ma routine
          </button>
        </div>
      </Link>
    </motion.div>
  );
}

/* ================== PAGE ABONNEMENT ================== */
export default function SubscriptionPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from("products").select("*").order("id");
        if (error) { setProducts([]); }
        else { setProducts((data as Product[]) ?? []); }
      } catch { setProducts([]); }
      finally { setLoading(false); }
    })();
  }, []);

  const heroImages = useMemo(() => {
    const firstByProduct = products
      .map((p) => normalizeImagesField(p.images)[0])
      .filter((x): x is string => typeof x === "string" && x.trim().length > 0);
    const unique = uniqueUrls(firstByProduct);
    return unique.length >= 2 ? unique.slice(0, 10) : STATIC_HERO_IMAGES;
  }, [products]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white pt-[73px]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-neutral-200 rounded-full" />
          <div className="absolute inset-0 border-4 border-neutral-900 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-[73px]">

      {/* ══ HERO ══════════════════════════════════════════════════════ */}
      <section className="pt-10 md:pt-16 pb-4 md:pb-8 px-6 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 md:mb-10"
          >
            <h1 className="text-4xl md:text-6xl font-light tracking-tight text-neutral-800 mb-4 leading-[1.1]">
              Votre routine bien-être,
              <br />
              <span className="text-neutral-900 font-medium">sans y penser.</span>
            </h1>
            <p className="text-base md:text-xl text-neutral-500 font-light max-w-xl mx-auto leading-relaxed">
              Recevez automatiquement vos formules.
              <br />À votre rythme. Sans engagement.
            </p>
          </motion.div>

          {/* Carrousel responsive */}
          <FaceLockedOrbitCarousel images={heroImages} speed={14} />
        </div>
      </section>

      {/* ══ AVANTAGES ════════════════════════════════════════════════ */}
      <section className="py-10 md:py-16 px-6 bg-white">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="text-2xl md:text-4xl font-light text-center text-neutral-700 mb-8 md:mb-12">
            Une routine qui s&apos;adapte à vous
          </h2>
          {/* Desktop : 3 colonnes — Mobile : 1 ligne flex avec items plus compacts */}
          <div className="hidden md:grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Zéro charge mentale",
                desc: "Vos produits arrivent toujours au bon moment.",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ),
                title: "Liberté totale",
                desc: "Changez, mettez en pause, arrêtez quand vous voulez.",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                ),
                title: "Avantages réservés",
                desc: "Réductions automatiques, livraisons offertes.",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="text-center p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-900 text-white mb-4">
                  {icon}
                </div>
                <h3 className="text-base md:text-lg font-medium text-neutral-800 mb-2">{title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Mobile : 1 seule ligne horizontale, icône + titre seulement */}
          <div className="flex md:hidden justify-around items-start gap-2">
            {[
              {
                icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
                title: "Zéro stress",
              },
              {
                icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>),
                title: "Liberté totale",
              },
              {
                icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>),
                title: "−20%",
              },
            ].map(({ icon, title }) => (
              <div key={title} className="flex flex-col items-center text-center gap-2 flex-1">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-neutral-900 text-white flex-shrink-0">
                  {icon}
                </div>
                <span className="text-[11px] font-medium text-neutral-700 leading-tight">{title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRODUITS — style Shop ════════════════════════════════════ */}
      <section className="py-14 md:py-20 px-4 md:px-6 bg-white">
        <div className="max-w-[1300px] mx-auto">
          <h2 className="text-2xl md:text-4xl font-light text-center text-neutral-700 mb-10 md:mb-14">
            Construisez votre routine
          </h2>

          {/* Rangée 1 — desktop: 3 col / mobile: 2 col */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 md:gap-x-8 gap-y-8 md:gap-y-0">
            {products.slice(0, 3).map((product, idx) => (
              <ProductCard key={product.id} product={product} idx={idx} />
            ))}
          </div>

          {/* Rangée 2 desktop : disposition W (6 col) */}
          <div className="hidden md:grid grid-cols-6 gap-x-8 mt-10">
            <div className="col-start-2 col-span-2">
              {products[3] && <ProductCard product={products[3]} idx={3} />}
            </div>
            <div className="col-start-4 col-span-2">
              {products[4] && <ProductCard product={products[4]} idx={4} />}
            </div>
          </div>

          {/* Rangée 2 mobile : 2 col côte à côte */}
          <div className="grid grid-cols-2 md:hidden gap-x-5 gap-y-8 mt-8">
            {products[3] && <ProductCard product={products[3]} idx={3} />}
            {products[4] && <ProductCard product={products[4]} idx={4} />}
          </div>
        </div>
      </section>

      {/* ══ CTA FINALE — fond beige chaud au lieu de noir ════════════ */}
      <section className="py-16 md:py-20 px-6 bg-white border-t border-neutral-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-light text-neutral-900 mb-6">Prêt à commencer ?</h2>
          <p className="text-base md:text-lg text-neutral-500 mb-10 font-light leading-relaxed">
            Votre routine bien-être vous attend.
            <br />
            Livraison automatique. Contrôle total. Sans engagement.
          </p>
          <Link
            href="/shop"
            className="inline-block px-8 py-4 bg-neutral-900 text-white rounded-full text-sm font-semibold tracking-wide hover:bg-neutral-700 transition-colors"
          >
            Voir tous les produits
          </Link>
        </div>
      </section>
    </div>
  );
}