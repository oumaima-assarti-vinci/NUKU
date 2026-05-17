"use client";

import { useCart } from "@/lib/contexts/CartContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, removeGroup, updateQuantity, getTotal, getItemCount } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const segments = pathname?.split("/").filter(Boolean) ?? [];
  const lang = ["fr", "en", "nl"].includes(segments[0]) ? segments[0] : "fr";

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const packItems = cart.filter((i) => i.bundleGroup === "Votre pack personnalisé");
  const soloItems = cart.filter((i) => !i.bundleGroup && !i.isBundle);
  const bundleItems = cart.filter((i) => i.isBundle);

  const packDiscount = packItems[0]?.bundleGroupDiscount ?? 0;
  const packOriginalTotal = packItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const packDiscountedTotal = packOriginalTotal * (1 - packDiscount / 100);

  // Grouper les items du pack par productId
  const groupedPackItems = (() => {
    const grouped: Record<number, typeof packItems[0] & { totalQty: number }> = {};
    packItems.forEach(item => {
      const key = item.productId ?? 0;
      if (grouped[key]) {
        grouped[key].totalQty += item.quantity;
      } else {
        grouped[key] = { ...item, totalQty: item.quantity };
      }
    });
    return Object.values(grouped);
  })();

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        className={`fixed top-0 right-0 z-[70] h-full w-full max-w-[420px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-base font-bold text-neutral-900">
              Mon panier
              {getItemCount() > 0 && (
                <span className="ml-2 text-sm font-medium text-neutral-400">
                  ({getItemCount()} article{getItemCount() > 1 ? "s" : ""})
                </span>
              )}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-100 transition text-neutral-500 hover:text-neutral-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-neutral-500 text-sm">Votre panier est vide</p>
            <button
              onClick={() => { onClose(); router.push(`/${lang}/shop`); }}
              className="mt-2 px-6 py-3 bg-orange-600 text-white text-sm font-semibold rounded-full hover:bg-orange-700 transition"
            >
              Voir les produits
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">

              {/* ── PACK PERSONNALISÉ ── */}
              {packItems.length > 0 && (
                <div className="px-6 pt-5 pb-4 border-b border-neutral-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                      </svg>
                      <span className="text-xs font-bold text-neutral-700 uppercase tracking-wide">
                        Votre pack personnalisé
                      </span>
                      {packDiscount > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full">
                          -{packDiscount}%
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeGroup("Votre pack personnalisé")}
                      className="text-[11px] text-neutral-400 hover:text-red-500 transition underline"
                    >
                      Retirer
                    </button>
                  </div>

                  {/* Pots — 1 par produit unique avec badge quantité */}
                  <div className="flex gap-3 p-3 bg-neutral-50 rounded-xl mb-3 flex-wrap">
                    {groupedPackItems.map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1 relative">
                        <div className="w-14 h-16 bg-white rounded-xl border border-neutral-100 flex items-center justify-center overflow-hidden">
                          <img src={item.image} alt={item.name} className="h-12 w-auto object-contain" />
                        </div>
                        {item.totalQty > 1 && (
                          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {item.totalQty}
                          </span>
                        )}
                        <span className="text-[9px] text-neutral-500 text-center max-w-[56px] leading-tight">
                          {item.name.replace("NUKU ", "")}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Sous-total pack */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500">Sous-total pack</span>
                    <div className="flex items-center gap-2">
                      {packDiscount > 0 && (
                        <span className="text-xs text-neutral-400 line-through">{packOriginalTotal.toFixed(2)}€</span>
                      )}
                      <span className="text-sm font-bold text-neutral-900">{packDiscountedTotal.toFixed(2)}€</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── BUNDLES ── */}
              {bundleItems.map((item) => (
                <div key={item.id} className="flex gap-4 px-6 py-4 border-b border-neutral-100">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl border border-neutral-100 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-neutral-900 truncate">{item.name}</p>
                      <button onClick={() => removeFromCart(item.id)} className="flex-shrink-0 text-neutral-300 hover:text-red-500 transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    {item.bundleDiscount && (
                      <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-700 font-semibold rounded-full">Bundle -{item.bundleDiscount}%</span>
                    )}
                    <p className="text-sm font-bold text-neutral-900 mt-1">{item.price.toFixed(2)}€</p>
                  </div>
                </div>
              ))}

              {/* ── ARTICLES SOLO ── */}
              {soloItems.map((item) => {
                const displayPrice = item.isSubscription ? item.price * 0.8 : item.price;
                return (
                  <div key={item.id} className="flex gap-4 px-6 py-4 border-b border-neutral-100 last:border-0">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl border border-neutral-100 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-neutral-900 truncate">{item.name}</p>
                        <button onClick={() => removeFromCart(item.id)} className="flex-shrink-0 text-neutral-300 hover:text-red-500 transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      {item.isSubscription && (
                        <span className="text-[10px] px-2 py-0.5 bg-orange-100 text-orange-600 font-semibold rounded-full">Abonnement -20%</span>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-neutral-200 rounded-full overflow-hidden">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition text-lg leading-none">−</button>
                          <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition text-lg leading-none">+</button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-neutral-900">{(displayPrice * item.quantity).toFixed(2)}€</p>
                          {item.isSubscription && (
                            <p className="text-xs text-neutral-400 line-through">{(item.price * item.quantity).toFixed(2)}€</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-5 border-t border-neutral-100 bg-white space-y-4">
              <div className="flex items-center justify-between text-sm text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Livraison offerte
                </span>
                <span className="text-green-600 font-semibold">Gratuit</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900">Total</span>
                <span className="text-xl font-bold text-neutral-900">{getTotal().toFixed(2)}€</span>
              </div>
              <button
                onClick={() => { onClose(); router.push(`/${lang}/checkout`); }}
                className="w-full py-4 bg-orange-600 text-white font-bold text-sm rounded-full hover:bg-orange-700 transition flex items-center justify-center gap-2"
              >
                Commander
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button onClick={onClose} className="w-full text-sm text-neutral-500 hover:text-neutral-800 transition font-medium">
                Continuer mes achats
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}