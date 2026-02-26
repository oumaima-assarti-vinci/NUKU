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

/** Normalise le champ "images" quelle que soit sa forme (array / JSON string / CSV / string / null) */
function normalizeImagesField(images: DbProduct["images"]): string[] {
  try {
    if (!images) return [];
    if (Array.isArray(images)) {
      return images.filter((x) => typeof x === "string" && x.trim().length > 0);
    }
    if (typeof images === "string") {
      const trimmed = images.trim();
      // JSON array ou JSON string
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
      // CSV
      if (trimmed.includes(",")) {
        return trimmed
          .split(",")
          .map((s) => s.trim())
          .filter((x) => x.length > 0);
      }
      // Single URL
      if (trimmed.length > 0) return [trimmed];
    }
    return [];
  } catch {
    return [];
  }
}

/** Récupère la 1ère image exploitable ou un fallback propre */
function getFirstImage(images: DbProduct["images"]): string {
  const list = normalizeImagesField(images);
  return (
    list[0] ??
    "https://images.unsplash.com/photo-1556228852-80c63843f03c?w=800&auto=format&fit=crop"
  );
}

/** Couleur d'ombre en fonction du nom (plus saturée pour "popper") */
function getProductShadowColor(name: string) {
  const n = (name || "").toUpperCase();
  if (n.includes("SOUL")) return "rgba(112, 142, 255, 1)"; // bleu
  if (n.includes("SHINE")) return "rgba(255, 215, 70, 1)"; // jaune
  if (n.includes("SLEEP")) return "rgba(150, 180, 255, 1)"; // bleu pastel
  if (n.includes("SOURCE")) return "rgba(80, 170, 80, 1)"; // vert
  if (n.includes("STRENGTH") || n.includes("STRENGHT") || n.includes("FORCE"))
    return "rgba(255, 80, 80, 1)"; // rouge
  return "rgba(0, 0, 0, 1)"; // défaut (on gère l'opacité après)
}

/** Emoji selon le texte du bénéfice */
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

/** Découpe un tableau en rangées de 2 éléments */
function chunkTwo<T>(arr: T[]): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += 2) out.push(arr.slice(i, i + 2));
  return out;
}

/* ================== SOUS-COMPOSANTS ================== */

/** Composant BenefitsNoMiddle - Grille 2 colonnes sans trait vertical (renforcé) */
function BenefitsNoMiddle({ benefits }: { benefits: string[] }) {
  const rows = chunkTwo(benefits);

  return (
    <div className="mt-4 divide-x-0">
      {rows.map((row, idx) => (
        <div
          key={idx}
          className={[
            // Grille 2 colonnes responsive
            "grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 py-5",
            // Forcer aucune bordure verticale même si un parent en a
            "border-x-0 md:border-x-0",
            // Ajouter seulement une ligne horizontale entre les rangées (pas la 1ère)
            idx !== 0 ? "border-t border-neutral-200" : "",
          ].join(" ")}
        >
          {row.map((text, i) => (
            <div key={i} className="flex items-center gap-4">
              <span
                aria-hidden
                className="text-xl md:text-2xl leading-none select-none"
                title={text}
              >
                {getBenefitEmoji(text)}
              </span>
              <span className="text-sm md:text-base text-neutral-800">{text}</span>
            </div>
          ))}
          {/* Si nombre impair, on laisse la 2e colonne vide sans bordure */}
          {row.length === 1 && <div className="hidden md:block" />}
        </div>
      ))}
    </div>
  );
}

function ProductLabel({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mt-3 text-center transition-all duration-300">
      <h3 className="text-sm md:text-base font-light tracking-[0.18em] text-neutral-500 uppercase">
        {title}
      </h3>
      {subtitle && (
        <p className="mt-1 text-xs tracking-[0.2em] text-neutral-400 uppercase font-light">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/**
 * VERSION "ombre autour du pot"
 * - On supprime les deux gros glows latéraux.
 * - On utilise une pile de drop-shadows colorés sur l'image du pot (suivent l'alpha du PNG).
 * - On garde un "plancher" elliptique discret sous le pot pour l'ancrer.
 */
function ProductOnStone({
  product,
  jarSize = "h-48",
  onClickProduct,
}: {
  product: DbProduct;
  jarSize?: string;
  onClickProduct: (id: number) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const img = getFirstImage(product.images);
  const baseColor = getProductShadowColor(product.nom);

  // Variantes de la même couleur avec différentes opacités
  const cWeak = baseColor.replace("1)", "0.18)");
  const cMed = baseColor.replace("1)", "0.32)");
  const cStrong = baseColor.replace("1)", "0.55)");

  return (
    <div
      className="relative flex flex-col items-center cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered((v) => !v)}
      onClick={() => onClickProduct(product.id)}
    >
      {/* Conteneur du pot + effets */}
      <div className="relative" style={{ contain: "paint" as any }}>
        {/* Plancher (ombre au sol) */}
        <motion.div
          aria-hidden
          role="presentation"
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full z-0"
          style={{
            width: "140px",
            height: "32px",
            background: cMed,
            filter: "blur(18px)",
            mixBlendMode: "multiply",
          }}
          initial={{ opacity: 0.12, scale: 0.95 }}
          animate={{ opacity: isHovered ? 0.45 : 0.2, scale: isHovered ? 1.05 : 0.98 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Image du pot avec drop-shadows autour de la FORME du bocal */}
        <motion.img
          src={img}
          alt={product.nom}
          className={`${jarSize} object-contain relative z-10 will-change-transform`}
          style={{ willChange: "filter, transform" as any }}
          initial={false}
          animate={{
            scale: isHovered ? 1.08 : 1,
            y: isHovered ? -6 : 0,
            // Pile d'ombres : proche + moyenne + large (couleur du produit)
            filter: isHovered
              ? `
                drop-shadow(0 14px 26px ${cStrong})
                drop-shadow(0 0 26px ${cMed})
                drop-shadow(0 0 52px ${cWeak})
              `
              : `
                drop-shadow(0 6px 12px ${cMed})
                drop-shadow(0 0 12px ${cWeak})
              `,
          }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
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
  const [summaryMap, setSummaryMap] = useState<
    Record<number, { avg: number; count: number }>
  >({});

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
        map[r.product_id] = {
          avg: Number(r.rating_avg ?? 0),
          count: Number(r.reviews_count ?? 0),
        };
      });
      setSummaryMap(map);

      setLoading(false);
    })();
  }, []);

  // 🔍 DEBUG : Logger les benefits pour vérifier qu'ils existent
  useEffect(() => {
    if (products.length) {
      console.log("📊 PRODUCTS BENEFITS DEBUG:");
      products.forEach(p => {
        console.log(`  ${p.nom}:`, {
          id: p.id,
          benefits: p.benefits,
          count: p.benefits?.length ?? 0,
          type: typeof p.benefits,
        });
      });
    }
  }, [products]);

  const priceLabel = (p: DbProduct, type: "unique" | "subscription") =>
    type === "subscription" ? (p.prix * 0.8).toFixed(2) : Number(p.prix).toFixed(2);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f0ec] pt-[73px]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-neutral-200 rounded-full" />
          <div className="absolute inset-0 border-4 border-neutral-900 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f0ec] text-neutral-900 min-h-screen pt-[73px]">
      {/* BADGE DEBUG */}
      <div className="fixed bottom-4 right-4 z-[9999] rounded-full bg-neutral-900 text-white text-xs px-3 py-1 shadow-lg">
        SHOP v506 • NO VERTICAL LINE + DEBUG
      </div>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* HERO */}
      <section className="py-16 md:py-24 bg-[#f5f0ec] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-light tracking-wide text-neutral-700 mb-20 text-center"
          >
            Build your balance.
          </motion.h1>

          <div className="mb-32" />

          {/* PYRAMIDE (3 haut / 2 bas) */}
          <div className="relative max-w-6xl mx-auto">
            {/* Rangée supérieure (3 produits) */}
            <div className="relative z-20 flex justify-center items-end gap-12 md:gap-24 -mt-24">
              {products[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <ProductOnStone
                    product={products[0]}
                    jarSize="h-52 md:h-60"
                    onClickProduct={handleProductClick}
                  />
                  <ProductLabel title={products[0].nom} />
                </motion.div>
              )}

              {products[1] && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="flex flex-col items-center"
                >
                  <ProductOnStone
                    product={products[1]}
                    jarSize="h-52 md:h-60"
                    onClickProduct={handleProductClick}
                  />
                  <ProductLabel title={products[1].nom} />
                </motion.div>
              )}

              {products[2] && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="flex flex-col items-center"
                >
                  <ProductOnStone
                    product={products[2]}
                    jarSize="h-52 md:h-60"
                    onClickProduct={handleProductClick}
                  />
                  <ProductLabel title={products[2].nom} />
                </motion.div>
              )}
            </div>

            {/* Rangée inférieure (2 produits) */}
            <div className="relative z-20 flex justify-center items-end gap-8 md:gap-16 mt-8">
              {products[3] && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="flex flex-col items-center"
                >
                  <ProductOnStone
                    product={products[3]}
                    jarSize="h-52 md:h-60"
                    onClickProduct={handleProductClick}
                  />
                  <ProductLabel title={products[3].nom} />
                </motion.div>
              )}

              {products[4] && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="flex flex-col items-center"
                >
                  <ProductOnStone
                    product={products[4]}
                    jarSize="h-52 md:h-60"
                    onClickProduct={handleProductClick}
                  />
                  <ProductLabel title={products[4].nom} />
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* MODAL PRODUIT */}
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
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                <h2 className="text-2xl font-semibold">{selectedProduct.nom}</h2>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
                  aria-label="Fermer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Tabs */}
              <div className="px-6 border-b border-neutral-200">
                <nav className="flex items-center gap-6">
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`py-3 font-semibold border-b-2 transition-colors ${
                      activeTab === "details"
                        ? "border-neutral-900 text-neutral-900"
                        : "border-transparent text-neutral-500 hover:text-neutral-800"
                    }`}
                  >
                    Détails
                  </button>
                  <button
                    onClick={() => setActiveTab("reviews")}
                    className={`py-3 font-semibold border-b-2 transition-colors ${
                      activeTab === "reviews"
                        ? "border-neutral-900 text-neutral-900"
                        : "border-transparent text-neutral-500 hover:text-neutral-800"
                    }`}
                  >
                    Avis
                  </button>
                </nav>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
                {activeTab === "details" ? (
                  <div className="grid md:grid-cols-2 gap-8 p-6">
                    {/* Image */}
                    <div className="relative">
                      <div className="bg-neutral-100 rounded-2xl aspect-square flex items-center justify-center p-12 relative overflow-hidden">
                        <img
                          src={getFirstImage(selectedProduct.images)}
                          className="relative z-10 h-[60%] object-contain drop-shadow-2xl"
                          alt={selectedProduct.nom}
                        />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-6">
                      {selectedProduct.story && (
                        <p className="text-neutral-700 leading-relaxed">{selectedProduct.story}</p>
                      )}

                      {(selectedProduct.benefits?.length ?? 0) > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-1">Bénéfices</h3>
                          <p className="text-sm text-neutral-500 mb-2">
                            Complément alimentaire formulé pour soutenir votre bien-être au quotidien.
                          </p>

                          {/* 👉 Grille 2 colonnes, sans trait au milieu */}
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

                        {purchaseType === "subscription" && (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                            ✓ Économisez {(selectedProduct.prix * 0.2).toFixed(2)}€
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <label
                          className={`flex items-center justify-between p-5 border-2 rounded-2xl cursor-pointer transition-colors ${
                            purchaseType === "unique"
                              ? "border-neutral-900 bg-neutral-50"
                              : "border-neutral-200"
                          }`}
                        >
                          <div>
                            <span className="font-semibold block mb-1">Achat unique</span>
                            <span className="text-sm text-neutral-600">Commande ponctuelle</span>
                          </div>
                          <input
                            type="radio"
                            checked={purchaseType === "unique"}
                            onChange={() => setPurchaseType("unique")}
                            className="w-5 h-5"
                          />
                        </label>

                        <label
                          className={`flex items-center justify-between p-5 border-2 rounded-2xl cursor-pointer transition-colors ${
                            purchaseType === "subscription"
                              ? "border-green-500 bg-green-50"
                              : "border-neutral-200"
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">Abonnement</span>
                              <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded">
                                -20%
                              </span>
                            </div>
                            <span className="text-sm text-neutral-600">Livraison automatique</span>
                          </div>
                          <input
                            type="radio"
                            checked={purchaseType === "subscription"}
                            onChange={() => setPurchaseType("subscription")}
                            className="w-5 h-5"
                          />
                        </label>
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