"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/contexts/CartContext";
import { usePack, PACK_CATEGORIES } from "@/lib/contexts/PackContext";
import PackProgress from "@/components/PackProgress";

const CATEGORIES = [
  { id: 12, name: "Sommeil",           sub: "Mélatonine · L-théanine · Magnésium", img: "/image/nukuBleu.png",   prix: 18 },
  { id: 16, name: "Relax & équilibre", sub: "Ashwagandha · Rhodiola · Safran",     img: "/image/nukuViolet.png", prix: 18 },
  { id: 14, name: "Force & endurance", sub: "Créatine · Vitamine B12 · D3",        img: "/image/nukuRouge.png",  prix: 18 },
  { id: 11, name: "Cheveux & beauté",  sub: "Biotine · Zinc · MSM",                img: "/image/nukuJaune.png",  prix: 18 },
  { id: 13, name: "Digestion",         sub: "Matcha · Artichaut · Pissenlit",      img: "/image/nukuVert.png",   prix: 18 },
];

interface PackSectionProps {
  title?: string;
  subtitle?: string;
  packLabel?: string;
  oneTimeLabel?: string;
  subLabel?: string;
  monthLabel?: string;
  addedLabel?: string;
}

export default function PackSection({
  title        = "Créez votre pack",
  subtitle     = "Choisissez vos produits et composez la routine qui vous ressemble jusqu'à -30%",
  packLabel    = "Mon pack personnalisé :",
  oneTimeLabel = "Avantage pack",
  subLabel     = "Abonnement",
  monthLabel   = "mois",
  addedLabel   = "Produits ajoutés au panier !",
}: PackSectionProps) {
  const { addToCart } = useCart();
  const { quantities, changeQty, totalPrice, discount, discountedPrice, aboDiscount, aboPrice } = usePack();
  const [added, setAdded] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'unique' | 'abo' | null>(null);
  const router   = useRouter();
  const pathname = usePathname();
  const segments = pathname?.split("/").filter(Boolean) ?? [];
  const lang     = ["fr", "en", "nl"].includes(segments[0]) ? segments[0] : "fr";

  const totalItems = quantities.reduce((a, b) => a + b, 0);

  const discountedUniquePrice = discount > 0
    ? Math.round(totalPrice * (1 - discount / 100))
    : totalPrice;

  const handleAdd = (isSub: boolean) => {
    PACK_CATEGORIES.forEach((cat, i) => {
      for (let q = 0; q < quantities[i]; q++) {
        addToCart(
          {
            id: cat.id,
            nom: cat.name,
            prix: cat.prix,
            images: [cat.img],
            bundleGroup: "Votre pack personnalisé",
            bundleGroupDiscount: discount,
          } as any,
          isSub
        );
      }
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <section
      style={{
        background: "white",
        borderTop: "1px solid #f0f0f0",
        padding: "48px 0 64px",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .pack-section-inner { padding: 32px 16px 40px !important; }
          .pack-cards-scroll {
            display: flex !important;
            overflow-x: auto !important;
            scroll-snap-type: x mandatory !important;
            -webkit-overflow-scrolling: touch !important;
            gap: 12px !important;
            padding-bottom: 8px !important;
            scrollbar-width: none !important;
          }
          .pack-cards-scroll::-webkit-scrollbar { display: none !important; }
          .pack-card { min-width: 140px !important; flex-shrink: 0 !important; scroll-snap-align: start !important; }
          .pack-card-img { height: 120px !important; }
          .pack-recap { padding: 16px !important; }
          .pack-buttons { grid-template-columns: 1fr !important; }
        }
        .pack-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .pack-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.09); }
      `}</style>

      <div className="pack-section-inner" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px" }}>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 900, color: "#111", margin: "0 0 6px" }}>
          {title}
        </h2>
        <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 28px" }}>{subtitle}</p>

        {/* Cartes produits */}
        <div className="pack-cards-scroll" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
          {CATEGORIES.map((cat, i) => (
            <div
              key={cat.id}
              className="pack-card"
              onClick={() => router.push(`/${lang}/product/${cat.id}`)}
              style={{ borderRadius: 14, border: "1px solid #f0f0f0", background: "white", overflow: "hidden", cursor: "pointer" }}
            >
              <div className="pack-card-img" style={{ background: "#f5f3f0", height: 160, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingTop: 10 }}>
                <img src={cat.img} alt={cat.name} style={{ height: "82%", width: "auto", objectFit: "contain", filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.13))" }} />
              </div>
              <div style={{ padding: "10px 10px 12px" }}>
                <p style={{ fontSize: 9, fontWeight: 900, color: "#111", textTransform: "uppercase", letterSpacing: 0.3, margin: "0 0 3px", lineHeight: 1.3 }}>{cat.name}</p>
                <p style={{ fontSize: 8, color: "#aaa", margin: "0 0 9px", lineHeight: 1.4 }}>{cat.sub}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }} onClick={(e) => e.stopPropagation()}>
                  <button onClick={(e) => { e.stopPropagation(); changeQty(i, -1); }} style={{ width: 22, height: 22, borderRadius: "50%", border: "1px solid #ddd", background: "white", cursor: "pointer", fontSize: 14, color: "#555", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>−</button>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#111", width: 16, textAlign: "center" }}>{quantities[i]}</span>
                  <button onClick={(e) => { e.stopPropagation(); changeQty(i, 1); }} style={{ width: 22, height: 22, borderRadius: "50%", border: "1px solid #ddd", background: "white", cursor: "pointer", fontSize: 14, color: "#555", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>+</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Récapitulatif */}
        <div className="pack-recap" style={{ marginTop: 28, border: "1px solid #e5e7eb", borderRadius: 18, padding: "24px 28px" }}>
          <PackProgress />
          <p style={{ fontSize: 12, fontWeight: 600, color: "#777", margin: "0 0 14px" }}>{packLabel}</p>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 20, minHeight: 52 }}>
            {quantities.every((q) => q === 0) ? (
              <p style={{ fontSize: 12, color: "#ccc", margin: 0 }}>Ajoutez des produits pour composer votre pack</p>
            ) : (
              (() => {
                let isFirst = true;
                return CATEGORIES.map((cat, i) =>
                  Array.from({ length: quantities[i] }).map((_, j) => {
                    const showPlus = !isFirst;
                    isFirst = false;
                    return (
                      <div key={`${i}-${j}`} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {showPlus && <span style={{ color: "#ddd", fontSize: 16 }}>+</span>}
                        <img src={cat.img} alt={cat.name} style={{ height: 42, width: "auto", objectFit: "contain", filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.12))" }} />
                      </div>
                    );
                  })
                );
              })()
            )}
          </div>

          <div className="pack-buttons" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {/* Avantage pack */}
            <button
              onClick={() => setSelectedMode('unique')}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                border: `${selectedMode === 'unique' ? '2px solid #111' : '1px solid #e5e7eb'}`,
                borderRadius: 12, padding: "14px 18px",
                background: selectedMode === 'unique' ? '#fafafa' : 'white',
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: 12, color: "#777" }}>{oneTimeLabel}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {discount > 0 && totalItems > 0 && (
                  <span style={{ fontSize: 13, color: "#bbb", textDecoration: "line-through" }}>{totalPrice}€</span>
                )}
                <span style={{ fontSize: 16, fontWeight: 700, color: "#111" }}>{discountedUniquePrice}€</span>
              </div>
            </button>

            {/* Abonnement */}
            <button
              onClick={() => setSelectedMode('abo')}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                border: `${selectedMode === 'abo' ? '2px solid #ED9446' : '1px solid #e5e7eb'}`,
                borderRadius: 12, padding: "14px 18px",
                background: selectedMode === 'abo' ? 'rgba(237,148,70,0.05)' : 'white',
                cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(237,148,70,0.05)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = selectedMode === 'abo' ? "rgba(237,148,70,0.05)" : "white")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#777" }}>{subLabel}</span>
                <span style={{ fontSize: 9, fontWeight: 700, background: "#111", color: "white", padding: "2px 6px", borderRadius: 6 }}>-5%</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>
                  {aboPrice}€
                  <span style={{ fontSize: 10, fontWeight: 400, color: "#888" }}>/{monthLabel}</span>
                </span>
                {aboDiscount > 0 && totalItems > 0 && (
                  <span style={{ fontSize: 13, color: "#bbb", textDecoration: "line-through" }}>{totalPrice}€</span>
                )}
              </div>
            </button>
          </div>

          {totalItems >= 2 && selectedMode && (
            <button
              onClick={() => handleAdd(selectedMode === 'abo')}
              style={{
                display: "block", margin: "12px auto 0",
                padding: "16px 32px", borderRadius: 12, border: "none",
                background: "#ED9446", color: "white",
                fontSize: 13, fontWeight: 700, letterSpacing: 0.8,
                cursor: "pointer", transition: "opacity 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              Ajouter mon pack au panier
            </button>
          )}

          {added && (
            <div style={{ marginTop: 12, background: "#f0faf0", color: "#2d7a2d", border: "1px solid #b6e6b6", borderRadius: 12, padding: "10px 16px", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {addedLabel}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}