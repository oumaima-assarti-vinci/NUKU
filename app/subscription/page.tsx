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

/* ================== HELPERS ROBUSTES ================== */
function normalizeImagesField(images: Product["images"]): string[] {
  try {
    if (!images) return [];
    if (Array.isArray(images)) {
      return images.filter((x) => typeof x === "string" && x.trim().length > 0);
    }
    if (typeof images === "string") {
      const t = images.trim();
      // JSON array / JSON string
      if ((t.startsWith("[") && t.endsWith("]")) || (t.startsWith('"') && t.endsWith('"'))) {
        const parsed = JSON.parse(t);
        if (Array.isArray(parsed))
          return parsed.filter((x) => typeof x === "string" && x.trim().length > 0);
        if (typeof parsed === "string" && parsed.trim()) return [parsed.trim()];
      }
      // CSV
      if (t.includes(",")) {
        return t
          .split(",")
          .map((s) => s.trim())
          .filter((x) => x.length > 0);
      }
      // Single
      if (t.length > 0) return [t];
    }
    return [];
  } catch {
    return [];
  }
}
function uniqueUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of urls) {
    const k = (u || "").trim();
    if (k && !seen.has(k)) {
      seen.add(k);
      out.push(k);
    }
  }
  return out;
}

/* ================== CARROUSEL : ORBITE X/Z (PAS DE rotateY SUR L'IMAGE) ==================
   Principe :
   - On anime un angle global `spin` (0→360).
   - Pour chaque item i, on calcule angle_i = spin + i*step.
   - On positionne l’item avec translate3d( x(angle_i), 0, z(angle_i) ).
   - AUCUNE rotation n’est appliquée aux images → elles restent de face.
   ====================================================================== */
function FaceLockedOrbitCarousel({
  images,
  height = 300,
  width = 220,
  radius = 380, // distance caméra
  speed = 14, // secondes par tour
  perspective = 1600,
  dropShadow = true,
}: {
  images: string[];
  height?: number;
  width?: number;
  radius?: number;
  speed?: number;
  perspective?: number;
  dropShadow?: boolean;
}) {
  const items = images.slice(0, 10).filter(Boolean);
  const count = Math.max(1, items.length);
  const stepDeg = 360 / count;
  const deg2rad = Math.PI / 180;

  // Angle partagé
  const spin = useMotionValue(0);

  useEffect(() => {
    const controls = animate(spin, 360, {
      duration: speed,
      ease: "linear",
      repeat: Infinity,
    });
    return () => controls.stop();
  }, [spin, speed]);

  return (
    <div className="w-full flex justify-center items-center" style={{ perspective: `${perspective}px` }}>
      <div
        className="relative select-none"
        style={{
          width: `${width + radius * 0.8}px`,
          height: `${height + 120}px`,
          transformStyle: "preserve-3d",
        }}
      >
        {items.map((src, i) => {
          // angle_i = spin + i*step
          const angleRad = useTransform(spin, (deg) => {
            return (deg + i * stepDeg) * deg2rad;
          });

          // x = sin(a)*R, z = cos(a)*R
          const xPx = useTransform(angleRad, (a) => Math.sin(a) * radius);
          const zPx = useTransform(angleRad, (a) => Math.cos(a) * radius);

          // transform complet : translate(-50%, -50%) + translate3d(x,0,z)
          const transformStr = useTransform([xPx, zPx], ([x, z]) => `translate(-50%, -50%) translate3d(${x}px, 0, ${z}px)`);

          return (
            <motion.div
              key={`${src}-${i}`}
              className="absolute left-1/2 top-1/2 will-change-transform"
              style={{
                transform: transformStr,
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
              }}
            >
              <img
                src={src}
                alt={`slide-${i + 1}`}
                draggable={false}
                style={{
                  width,
                  height,
                  objectFit: "contain",
                  // AUCUNE rotation ici → image reste de face
                  filter: dropShadow ? "drop-shadow(0 25px 50px rgba(0,0,0,0.35))" : "none",
                }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.opacity = "0.25";
                }}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ================== PAGE ABONNEMENT ================== */
export default function SubscriptionPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger Supabase
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from("products").select("*").order("id");
        if (error) {
          console.error("❌ Supabase error:", error);
          setProducts([]);
        } else {
          setProducts((data as Product[]) ?? []);
        }
      } catch (err) {
        console.error("❌ Unexpected fetch error:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Images du carrousel (1ère image par produit) + fallback si < 2
  const heroImages = useMemo(() => {
    const firstByProduct = products
      .map((p) => normalizeImagesField(p.images)[0])
      .filter((x): x is string => typeof x === "string" && x.trim().length > 0);

    const unique = uniqueUrls(firstByProduct);

    console.group("🎯 HERO IMAGES – BUILD (orbit face-on)");
    console.log("Products count:", products.length);
    console.log("First image per product:", firstByProduct);
    console.log("Unique images:", unique);
    console.groupEnd();

    if (unique.length >= 2) return unique.slice(0, 10);
    return STATIC_HERO_IMAGES;
  }, [products]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f5f0ec] to-[#ebe6e0] pt-[73px]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-neutral-200 rounded-full" />
          <div className="absolute inset-0 border-4 border-neutral-900 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[ #ffffff] to-[ #ffffff] pt-[73px]">
      {/* HERO */}
      <section className="pt-32 pb-20 px-6 relative overflow-visible">
        <div className="max-w-[1200px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-light tracking-tight text-neutral-700 mb-6 leading-[1.1]">
              Votre routine bien-être,
              <br />
              <span className="text-neutral-900">sans y penser.</span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 font-light max-w-2xl mx-auto leading-relaxed mb-10">
              Recevez automatiquement vos formules.
              <br />
              À votre rythme. Sans engagement.
            </p>
          </motion.div>

          {/* 🌈 Carrousel par orbite (sans rotation d'image) */}
          <FaceLockedOrbitCarousel
            images={heroImages}
            height={300}
            width={220}
            radius={380}
            speed={14}
            perspective={1600}
            dropShadow
          />
        </div>
      </section>

      {/* SECTION AVANTAGES */}
      <section className="py-16 px-6 bg-white/50">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-light text-center text-neutral-700 mb-12">Une routine qui s&apos;adapte à vous</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-900 text-white mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-neutral-800 mb-2">Zéro charge mentale</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">Vos produits arrivent toujours au bon moment.</p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-900 text-white mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-neutral-800 mb-2">Liberté totale</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">Changez, mettez en pause, arrêtez quand vous voulez.</p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-900 text-white mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-neutral-800 mb-2">Avantages réservés</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">Réductions automatiques, livraisons offertes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUITS */}
      <section className="py-16 px-6">
        <div className="max-w-[1300px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-light text-center text-neutral-700 mb-12">Construisez votre routine</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {products.map((product: Product, idx: number) => {
              const firstImage = normalizeImagesField(product.images)[0];

              return (
                <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  {/* LIEN AVEC MODE SUBSCRIPTION */}
                  <Link href={`/product/${product.id}?mode=subscription`} className="group block">
                    <div className="bg-white/60 backdrop-blur-sm rounded-[28px] p-6 md:p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                      <div className="relative aspect-square flex items-center justify-center mb-6">
                        {firstImage ? (
                          <img
                            src={firstImage}
                            alt={product.nom}
                            className="h-56 md:h-64 object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.25)] group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => {
                              console.error("❌ Image failed to load:", firstImage);
                              (e.currentTarget as HTMLImageElement).style.opacity = "0.25";
                            }}
                          />
                        ) : (
                          <div className="h-56 md:h-64 flex items-center justify-center text-neutral-400">Image indisponible</div>
                        )}
                      </div>

                      <h3 className="text-base md:text-lg font-medium text-neutral-800 mb-2 text-center">{product.nom}</h3>

                      {product.tagline && (
                        <p className="text-xs text-neutral-500 mb-4 text-center font-light">{product.tagline}</p>
                      )}

                      <div className="text-center mb-4">
                        <p className="text-2xl font-bold text-neutral-900">
                          {product.prix ? (product.prix * 0.8).toFixed(2) : "—"}€
                          <span className="text-sm font-normal text-neutral-500"> / mois</span>
                        </p>
                      </div>

                      <button className="w-full py-3 bg-neutral-900 text-white rounded-full text-sm font-medium hover:scale-[1.02] transition-transform">
                        Ajouter à ma routine
                      </button>

                      <p className="mt-3 text-center text-xs text-neutral-400">
                        <Link href={`/product/${product.id}`} className="underline hover:text-neutral-600 transition-colors">
                          Essayer une fois
                        </Link>
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA FINALE */}
      <section className="py-20 px-6 bg-neutral-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-light mb-6">Prêt à commencer ?</h2>
          <p className="text-lg text-neutral-300 mb-8 font-light leading-relaxed">
            Votre routine bien-être vous attend.
            <br />
            Livraison automatique. Contrôle total. Sans engagement.
          </p>
        </div>
      </section>
    </div>
  );
}