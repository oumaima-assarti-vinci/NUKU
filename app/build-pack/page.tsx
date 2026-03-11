"use client";

import { useCart } from "@/lib/contexts/CartContext";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CartSidebar from "@/components/CartSidebar";

/* ================= TYPES ================= */

type DbProduct = {
  id: number;
  nom: string;
  prix: number;
  tagline?: string | null;
  story?: string | null;
  images?: string[] | null;
  benefits?: string[] | null;
  ingredients?: string[] | null;
  usage_instructions?: string | null;
  gummies_per_jar?: number | null;
  flavor?: string | null;
  shipping_note?: string | null;
};

/* ================= COMPOSANT PRODUIT PROPRE ================= */
function ProductCard({
  product,
  quantity,
  onAdd,
  onRemove,
  isDisabled,
}: {
  product: DbProduct;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  isDisabled: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  const img =
    product.images?.[0] ??
    "https://images.unsplash.com/photo-1556228852-80c63843f03c?w=400&fit=crop";

  return (
    <div 
      className="flex flex-col items-center text-center gap-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* IMAGE AVEC HAUTEUR FIXE */}
      <div className="relative h-[240px] flex items-center justify-center">
        <motion.img
          src={img}
          alt={product.nom}
          animate={{
            scale: isHovered ? 1.08 : 1,
            y: isHovered ? -6 : 0,
          }}
          transition={{
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="max-h-[220px] w-auto object-contain"
          style={{
            filter: isHovered 
              ? "drop-shadow(0 28px 48px rgba(0,0,0,0.35))"
              : "drop-shadow(0 22px 38px rgba(0,0,0,0.28))",
          }}
        />

        {/* BADGE QUANTITÉ */}
        {quantity > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="absolute -top-3 -right-3 min-w-[32px] h-8 px-2 rounded-full bg-neutral-900 text-white flex items-center justify-center text-sm font-medium shadow-lg z-20"
          >
            {quantity}
          </motion.div>
        )}
      </div>

      {/* TITRE */}
      <h3 className="text-sm tracking-[0.25em] text-neutral-600 uppercase font-light min-h-[20px]">
        {product.nom}
      </h3>

      {/* BOUTONS +/- */}
      <motion.div
        initial={{ opacity: 0.6 }}
        animate={{ opacity: isHovered || quantity > 0 ? 1 : 0.6 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-5 py-2.5 shadow-sm border border-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* BOUTON MOINS */}
        <button
          onClick={onRemove}
          disabled={quantity === 0}
          className={`w-8 h-8 rounded-full border transition-all flex items-center justify-center text-lg font-light
            ${
              quantity === 0
                ? "border-neutral-200 text-neutral-300 cursor-not-allowed"
                : "border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white hover:scale-110"
            }`}
        >
          −
        </button>

        {/* AFFICHAGE QUANTITÉ */}
        <span className="w-6 text-center text-sm font-medium text-neutral-900">
          {quantity}
        </span>

        {/* BOUTON PLUS */}
        <button
          onClick={onAdd}
          disabled={isDisabled}
          className={`w-8 h-8 rounded-full border transition-all flex items-center justify-center text-lg font-light
            ${
              isDisabled
                ? "border-neutral-200 text-neutral-300 cursor-not-allowed"
                : "border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white hover:scale-110"
            }`}
        >
          +
        </button>
      </motion.div>
    </div>
  );
}

/* ================= PAGE BUILD PACK ================= */
export default function BuildPackPage() {
  const { addToCart } = useCart();

  const [products, setProducts] = useState<DbProduct[]>([]);
  const [packSize, setPackSize] = useState<3 | 4 | 5>(3);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [purchaseType, setPurchaseType] = useState<"unique" | "subscription">("subscription");
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Nombre total de produits sélectionnés
  const totalSelected = Object.values(cart).reduce((a, b) => a + b, 0);

  // Ajouter 1 unité d'un produit
  const addProduct = (id: number) => {
    if (totalSelected >= packSize) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(30);
      }
      return;
    }
    setCart(c => ({
      ...c,
      [id]: (c[id] || 0) + 1
    }));
  };

  // Retirer 1 unité d'un produit
  const removeProduct = (id: number) => {
    setCart(c => {
      const next = { ...c };
      if (!next[id]) return next;

      if (next[id] === 1) delete next[id];
      else next[id]--;

      return next;
    });
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: prod } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: true });

      setProducts((prod as DbProduct[]) ?? []);
      setLoading(false);
    })();
  }, []);

  // Réinitialiser le panier quand on change la taille du pack
  useEffect(() => {
    setCart({});
  }, [packSize]);

  const bundleDiscount = packSize === 5 ? 30 : packSize === 4 ? 25 : 20;

  const originalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = products.find(x => x.id === Number(id));
    return sum + (p?.prix || 0) * qty;
  }, 0);

  const finalOneTime = +(originalPrice * (1 - bundleDiscount / 100)).toFixed(2);
  const finalSubscription = +(finalOneTime * 0.95).toFixed(2);

  const handleAddToBag = () => {
    if (totalSelected !== packSize) return;
    
    const selectedProducts = Object.entries(cart).flatMap(([id, qty]) => {
      const p = products.find(x => x.id === Number(id));
      return Array.from({ length: qty }, () => p);
    }).filter(Boolean);

    const isSub = purchaseType === 'subscription';
    
    addToCart(
      {
        id: `bundle-${packSize}-${Date.now()}`,
        name: `Pack ${packSize} produits`,
        isBundle: true,
        items: selectedProducts,
        price: isSub ? finalSubscription : finalOneTime,
        originalPrice,
        bundleDiscount,
        subscription: isSub
      },
      isSub
    );
    
    setCart({});
    setCartOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[ #ffffff] pt-[73px]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-neutral-200 rounded-full" />
          <div className="absolute inset-0 border-4 border-neutral-900 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const isPackComplete = totalSelected === packSize;

  return (
    <div className="bg-[ #ffffff] text-neutral-900 min-h-screen pt-[73px]">
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* HERO */}
      <section className="py-16 md:py-24 bg-[#ffffff] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">

          {/* TITRE */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-light tracking-wide text-neutral-700 mb-20 text-center"
          >
            Composez votre pack.
          </motion.h1>
          
          {/* SÉLECTEUR TAILLE */}
          <div className="flex justify-center gap-4 mb-20">
            {[3, 4, 5].map(n => {
              const discount = n === 5 ? 30 : n === 4 ? 25 : 20;
              return (
                <button
                  key={n}
                  onClick={() => setPackSize(n as 3 | 4 | 5)}
                  className={`px-8 py-5 rounded-2xl font-bold text-lg transition-all ${
                    packSize === n
                      ? 'bg-neutral-900 text-white shadow-lg'
                      : 'bg-white text-neutral-800 border-2 border-neutral-200 hover:border-neutral-900'
                  }`}
                >
                  <div className="text-2xl mb-1">{n}</div>
                  <div className="text-xs font-normal opacity-80">-{discount}%</div>
                </button>
              );
            })}
          </div>

          {/* LAYOUT 2 COLONNES */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-16 items-start">
            
            {/* GRILLE PRODUITS - PROPRE ET ALIGNÉE */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-20 gap-x-12 place-items-center max-w-5xl mx-auto">
              {products.slice(0, 5).map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                >
                  <ProductCard
                    product={product}
                    quantity={cart[product.id] || 0}
                    onAdd={() => addProduct(product.id)}
                    onRemove={() => removeProduct(product.id)}
                    isDisabled={totalSelected >= packSize && !cart[product.id]}
                  />
                </motion.div>
              ))}
            </div>

            {/* SIDEBAR */}
            <aside className="sticky top-32">
              <motion.div 
                className={`bg-white rounded-[32px] px-10 py-12 shadow-[0_40px_120px_rgba(0,0,0,0.08)] transition-all duration-500 ${
                  isPackComplete 
                    ? 'ring-2 ring-green-500/30 shadow-[0_40px_120px_rgba(34,197,94,0.15)]' 
                    : ''
                }`}
              >
                
                {/* HEADER */}
                <div className="text-center mb-10">
                  <p className="text-[11px] tracking-[0.4em] uppercase text-neutral-400 font-light">
                    Votre composition
                  </p>
                  <p className="mt-2 text-sm text-neutral-600 font-light">
                    {totalSelected} / {packSize} produits
                  </p>

                  {/* BADGE DISCRET */}
                  {isPackComplete && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-900 text-xs tracking-[0.3em] uppercase font-medium"
                    >
                      Prêt à être ajouté
                    </motion.div>
                  )}
                </div>

                {/* MINI POTS */}
                <div className="flex justify-center gap-4 flex-wrap mb-10 min-h-[80px]">
                  {Object.entries(cart).flatMap(([id, qty]) => {
                    const p = products.find(x => x.id === Number(id));
                    return Array.from({ length: qty }).map((_, i) => (
                      <motion.img
                        key={`${id}-${i}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300, delay: i * 0.05 }}
                        src={p?.images?.[0]}
                        className="h-14 object-contain opacity-90"
                        alt={p?.nom}
                      />
                    ));
                  })}
                  {Array.from({ length: packSize - totalSelected }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="w-14 h-14 border border-dashed border-neutral-200 rounded-xl flex items-center justify-center text-neutral-300 text-lg"
                    >
                      +
                    </div>
                  ))}
                </div>

                {/* PRIX */}
                <div className="text-center mb-10">
                  <p className="text-4xl font-light tracking-tight text-neutral-900">
                    {(purchaseType === 'subscription' ? finalSubscription : finalOneTime).toFixed(2)} €
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-2 font-light">
                    Valeur {originalPrice.toFixed(2)} € · -{bundleDiscount}%
                    {purchaseType === 'subscription' && ' · Abonnement -5%'}
                  </p>
                </div>

                {/* TYPE ACHAT */}
                <div className="space-y-3 mb-8">
                  <label
                    className={`flex items-center justify-between border rounded-2xl px-6 py-4 cursor-pointer transition ${
                      purchaseType === 'unique'
                        ? 'border-neutral-900 bg-white'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-sm">Achat unique</p>
                      <p className="text-[11px] text-neutral-500 mt-0.5">Paiement ponctuel</p>
                    </div>
                    <input
                      type="radio"
                      checked={purchaseType === 'unique'}
                      onChange={() => setPurchaseType('unique')}
                      className="w-4 h-4"
                    />
                  </label>

                  <label
                    className={`flex items-center justify-between border rounded-2xl px-6 py-4 cursor-pointer transition ${
                      purchaseType === 'subscription'
                        ? 'border-neutral-900 bg-white'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-sm flex items-center gap-2">
                        Abonnement
                        <span className="text-[10px] px-2 py-0.5 bg-neutral-900 text-white rounded-full">
                          -5%
                        </span>
                      </p>
                      <p className="text-[11px] text-neutral-500 mt-0.5">Livraison automatique</p>
                    </div>
                    <input
                      type="radio"
                      checked={purchaseType === 'subscription'}
                      onChange={() => setPurchaseType('subscription')}
                      className="w-4 h-4"
                    />
                  </label>
                </div>

                {/* CTA */}
                <button
                  onClick={handleAddToBag}
                  disabled={!isPackComplete}
                  className={`w-full py-5 rounded-full tracking-[0.35em] uppercase text-[11px] font-medium transition-all ${
                    isPackComplete
                      ? 'bg-neutral-900 text-white hover:scale-[1.02]'
                      : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  }`}
                >
                  {isPackComplete
                    ? 'Ajouter le pack'
                    : `Sélectionnez ${packSize - totalSelected} produit${packSize - totalSelected > 1 ? 's' : ''}`
                  }
                </button>

                {/* MICRO COPY */}
                <p className="mt-8 text-[10px] text-neutral-400 text-center leading-relaxed font-light">
                  Livraison gratuite · Abonnement flexible · Économies garanties
                </p>
              </motion.div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}