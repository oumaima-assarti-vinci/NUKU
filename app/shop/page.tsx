"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/contexts/CartContext";
import { supabase } from "@/lib/supabaseClient";
import CartSidebar from "@/components/CartSidebar";
import ProductReviews from "../components/ProductReview";

/* ================== TYPES ================== */

type DbProduct = {
  id: number;
  nom: string;
  prix: number;
  tagline?: string | null;
  story?: string | null;
  images?: string[] | string | null;
  benefits?: string[] | null;
  ingredients?: string[] | null;
  usage_instructions?: string | null;
  gummies_per_jar?: number | null;
  flavor?: string | null;
  shipping_note?: string | null;
};

type ReviewSummary = {
  product_id: number;
  reviews_count: number;
  rating_avg: number;
};

/* ================== HELPERS ================== */

function normalizeImagesField(images: DbProduct["images"]): string[] {
  try {
    if (!images) return [];
    if (Array.isArray(images)) {
      return images.filter((x) => typeof x === "string" && x.trim().length > 0);
    }
    if (typeof images === "string") {
      const trimmed = images.trim();
      if (
        (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
        (trimmed.startsWith('"') && trimmed.endsWith('"'))
      ) {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.filter((x) => typeof x === "string" && x.trim().length > 0);
        }
        if (typeof parsed === "string" && parsed.trim()) return [parsed.trim()];
      }
      if (trimmed.includes(",")) {
        return trimmed.split(",").map((s) => s.trim()).filter((x) => x.length > 0);
      }
      if (trimmed.length > 0) return [trimmed];
    }
    return [];
  } catch {
    return [];
  }
}

function getFirstImage(images: DbProduct["images"]): string {
  const list = normalizeImagesField(images);
  return (
    list[0] ??
    "https://images.unsplash.com/photo-1556228852-80c63843f03c?w=800&auto=format&fit=crop"
  );
}

function getProductGlowColor(name: string) {
  const n = (name || "").toUpperCase();
  if (n.includes("SOUL"))     return { color: "rgba(112,142,255,1)", bg: "rgba(112,142,255,0.12)" };
  if (n.includes("SHINE"))    return { color: "rgba(255,215,70,1)",  bg: "rgba(255,215,70,0.12)"  };
  if (n.includes("SLEEP"))    return { color: "rgba(130,160,255,1)", bg: "rgba(130,160,255,0.12)" };
  if (n.includes("SOURCE"))   return { color: "rgba(80,170,80,1)",   bg: "rgba(80,170,80,0.12)"   };
  if (n.includes("STRENGTH") || n.includes("STRENGHT") || n.includes("FORCE"))
                              return { color: "rgba(255,80,80,1)",   bg: "rgba(255,80,80,0.12)"   };
  return { color: "rgba(180,160,140,1)", bg: "rgba(180,160,140,0.10)" };
}

function getBenefitEmoji(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("stress")) return "🧘";
  if (t.includes("humeur")) return "😊";
  if (t.includes("fatigue")) return "🔋";
  if (t.includes("sommeil") || t.includes("dorm")) return "😴";
  if (t.includes("immun") || t.includes("defense")) return "🛡️";
  if (t.includes("cheveu") || t.includes("peau")) return "💆";
  return "✔️";
}

function chunkTwo<T>(arr: T[]): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += 2) out.push(arr.slice(i, i + 2));
  return out;
}

/* ================== SOUS-COMPOSANTS ================== */

function BenefitsNoMiddle({ benefits }: { benefits: string[] }) {
  const rows = chunkTwo(benefits);
  return (
    <div className="mt-4">
      {rows.map((row, idx) => (
        <div
          key={idx}
          className={`grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 py-5 ${
            idx !== 0 ? "border-t border-neutral-200" : ""
          }`}
        >
          {row.map((text, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-xl md:text-2xl leading-none select-none">
                {getBenefitEmoji(text)}
              </span>
              <span className="text-sm md:text-base text-neutral-800">{text}</span>
            </div>
          ))}
          {row.length === 1 && <div className="hidden md:block" />}
        </div>
      ))}
    </div>
  );
}

function ProductLabel({ title }: { title: string }) {
  return (
    <div className="mt-4 text-center">
      <h3 className="text-xs md:text-sm font-light tracking-[0.2em] text-neutral-400 uppercase">
        {title}
      </h3>
    </div>
  );
}

/**
 * Pot produit avec :
 * - Fond circulaire coloré (pas carré) derrière le pot
 * - Glow drop-shadow sur l'image PNG
 * - Taille normalisée via un conteneur fixe 160x160px → l'image s'adapte dedans
 */
function ProductCard({
  product,
  onClickProduct,
}: {
  product: DbProduct;
  onClickProduct: (id: number) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const img = getFirstImage(product.images);
  const { color, bg } = getProductGlowColor(product.nom);

  const cWeak   = color.replace("1)", "0.15)");
  const cMed    = color.replace("1)", "0.30)");
  const cStrong = color.replace("1)", "0.55)");

  return (
    <div
      className="relative flex flex-col items-center cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClickProduct(product.id)}
    >




      {/* Conteneur fixe 160×160 pour normaliser toutes les images */}
      <div className="relative z-10 w-[140px] h-[140px] md:w-[180px] md:h-[180px] flex items-center justify-center">
        <motion.img
          src={img}
          alt={product.nom}
          className="w-full h-full object-contain"
          style={{ willChange: "filter, transform" }}
          animate={{
            scale: isHovered ? 1.1 : 1,
            y: isHovered ? -8 : 0,
            filter: isHovered
              ? `drop-shadow(0 16px 28px ${cStrong}) drop-shadow(0 0 28px ${cMed}) drop-shadow(0 0 56px ${cWeak})`
              : `drop-shadow(0 8px 16px ${cMed}) drop-shadow(0 0 16px ${cWeak})`,
          }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1556228852-80c63843f03c?w=800&auto=format&fit=crop";
          }}
        />
      </div>
    </div>
  );
}

/* ================== PAGE SHOP ================== */

export default function ShopPage() {
  const router = useRouter();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<DbProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<DbProduct | null>(null);
  const [purchaseType, setPurchaseType] = useState<"unique" | "subscription">("unique");
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"details" | "reviews">("details");
  const [summaryMap, setSummaryMap] = useState<Record<number, { avg: number; count: number }>>({});

  const handleProductClick = (productId: number) => {
    router.push(`/product/${productId}`);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: prod, error: e1 }, { data: summaries, error: e2 }] = await Promise.all([
        supabase.from("products").select("*").order("id", { ascending: true }),
        supabase.from("reviews_summary").select("*"),
      ]);
      if (e1) console.error("❌ Supabase products error:", e1);
      if (e2) console.error("❌ Supabase reviews_summary error:", e2);
      setProducts((prod as DbProduct[]) ?? []);
      const map: Record<number, { avg: number; count: number }> = {};
      (summaries as ReviewSummary[] | null)?.forEach((r) => {
        map[r.product_id] = { avg: Number(r.rating_avg ?? 0), count: Number(r.reviews_count ?? 0) };
      });
      setSummaryMap(map);
      setLoading(false);
    })();
  }, []);

  const priceLabel = (p: DbProduct, type: "unique" | "subscription") =>
    type === "subscription" ? (p.prix * 0.8).toFixed(2) : Number(p.prix).toFixed(2);

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
    <div className="bg-white text-neutral-900 min-h-screen pt-[73px]">
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* HERO */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-light tracking-wide text-neutral-700 mb-16 text-center"
          >
            Build your balance.
          </motion.h1>

          {/* Rangée 1 — 3 produits */}
          <div className="flex justify-center items-end gap-8 md:gap-20 mb-12">
            {[products[0], products[1], products[2]].map((p, i) =>
              p ? (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: i * 0.1 }}
                  className="flex flex-col items-center"
                >
                  <ProductCard product={p} onClickProduct={handleProductClick} />
                  <ProductLabel title={p.nom} />
                </motion.div>
              ) : null
            )}
          </div>

          {/* Rangée 2 — 2 produits centrés */}
          <div className="flex justify-center items-end gap-8 md:gap-20">
            {[products[3], products[4]].map((p, i) =>
              p ? (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3 + i * 0.1 }}
                  className="flex flex-col items-center"
                >
                  <ProductCard product={p} onClickProduct={handleProductClick} />
                  <ProductLabel title={p.nom} />
                </motion.div>
              ) : null
            )}
          </div>
        </div>
      </section>

      {/* MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                <h2 className="text-2xl font-semibold">{selectedProduct.nom}</h2>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-6 border-b border-neutral-200">
                <nav className="flex items-center gap-6">
                  {(["details", "reviews"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-3 font-semibold border-b-2 transition-colors capitalize ${
                        activeTab === tab
                          ? "border-neutral-900 text-neutral-900"
                          : "border-transparent text-neutral-500 hover:text-neutral-800"
                      }`}
                    >
                      {tab === "details" ? "Détails" : "Avis"}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
                {activeTab === "details" ? (
                  <div className="grid md:grid-cols-2 gap-8 p-6">
                    <div className="bg-neutral-100 rounded-2xl aspect-square flex items-center justify-center p-12">
                      <img
                        src={getFirstImage(selectedProduct.images)}
                        className="h-[60%] object-contain drop-shadow-2xl"
                        alt={selectedProduct.nom}
                      />
                    </div>
                    <div className="space-y-6">
                      {selectedProduct.story && (
                        <p className="text-neutral-700 leading-relaxed">{selectedProduct.story}</p>
                      )}
                      {(selectedProduct.benefits?.length ?? 0) > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-1">Bénéfices</h3>
                          <BenefitsNoMiddle benefits={selectedProduct.benefits!} />
                        </div>
                      )}
                      <div className="p-6 bg-neutral-50 rounded-2xl">
                        <div className="flex items-baseline gap-2 mb-4">
                          <span className="text-4xl font-bold">
                            {priceLabel(selectedProduct, purchaseType)}€
                          </span>
                          <span className="text-sm text-neutral-500">
                            {purchaseType === "subscription" ? "par mois" : "prix unitaire"}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {(["unique", "subscription"] as const).map((type) => (
                          <label
                            key={type}
                            className={`flex items-center justify-between p-5 border-2 rounded-2xl cursor-pointer transition-colors ${
                              purchaseType === type
                                ? type === "unique"
                                  ? "border-neutral-900 bg-neutral-50"
                                  : "border-green-500 bg-green-50"
                                : "border-neutral-200"
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold">
                                  {type === "unique" ? "Achat unique" : "Abonnement"}
                                </span>
                                {type === "subscription" && (
                                  <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded">-20%</span>
                                )}
                              </div>
                              <span className="text-sm text-neutral-600">
                                {type === "unique" ? "Commande ponctuelle" : "Livraison automatique"}
                              </span>
                            </div>
                            <input
                              type="radio"
                              checked={purchaseType === type}
                              onChange={() => setPurchaseType(type)}
                              className="w-5 h-5"
                            />
                          </label>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          addToCart(
                            {
                              id: selectedProduct.id,
                              nom: selectedProduct.nom,
                              prix: selectedProduct.prix,
                              images: normalizeImagesField(selectedProduct.images),
                            },
                            purchaseType === "subscription"
                          );
                          setSelectedProduct(null);
                          setCartOpen(true);
                        }}
                        className="w-full py-5 bg-neutral-900 text-white font-semibold text-lg rounded-2xl hover:opacity-90 transition-all shadow-xl"
                      >
                        Ajouter au panier — {priceLabel(selectedProduct, purchaseType)}€
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    <ProductReviews productId={selectedProduct.id} />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}