"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/lib/contexts/CartContext";

export type ProductCardItem = {
  id: number;
  nom: string;
  tagline: string;
  prix: number;
  img: string;
  accent: string;
  light: string;
};

function StarRating({ value = 4 }: { value?: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="12" height="12" fill={i <= value ? "#f97316" : "#e5e7eb"} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function ProductCard({ p, compact = false }: { p: ProductCardItem; compact?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const seg = pathname?.split("/").filter(Boolean) ?? [];
  const locale = ["fr", "en", "nl"].includes(seg[0]) ? seg[0] : "fr";
  const { addToCart } = useCart();

  const [type, setType] = useState<"unique" | "subscription">("unique");
  const [added, setAdded] = useState(false);
  const [hov, setHov] = useState(false);

  const price = type === "subscription" ? Math.round(p.prix * 0.8) : p.prix;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(
      { id: p.id, nom: p.nom, prix: p.prix, images: [p.img] } as any,
      type === "subscription"
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div
      onClick={() => router.push(`/${locale}/product/${p.id}`)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 16,
        border: "1px solid #f0f0f0",
        background: "white",
        boxShadow: hov ? "0 8px 24px rgba(0,0,0,0.11)" : "0 1px 4px rgba(0,0,0,0.06)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        transition: "box-shadow 0.25s, transform 0.25s",
      }}
    >
      {/* Image */}
     <div className="product-card-img" style={{
  background: "#f0eeec",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  borderRadius: "12px 12px 0 0",
  maxHeight: compact ? "100px" : "120px",
  overflow: "hidden",
}}>
        <img
          src={p.img}
          alt={p.nom}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            transform: hov ? "scale(1.04)" : "scale(1)",
            transition: "transform 0.3s",
          }}
        />
        {type === "subscription" && (
          <div style={{
            position: "absolute", top: 10, right: 10,
            background: "#111", color: "white",
            fontSize: 9, fontWeight: 900,
            padding: "2px 8px", borderRadius: 20,
          }}>
            -5% ABO
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: compact ? "12px 12px" : "16px 18px", display: "flex", flexDirection: "column", flex: 1, gap: compact ? 8 : 10 }}>
        <div>
          <p style={{ fontSize: compact ? 10 : 12, fontWeight: 900, color: "#111", textTransform: "uppercase", letterSpacing: 0.5, margin: 0 }}>{p.nom}</p>
          <p style={{ fontSize: compact ? 9 : 10, color: "#aaa", lineHeight: 1.4, margin: "4px 0 0" }}>{p.tagline}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
            <StarRating value={4} />
            <span style={{ fontSize: 9, color: "#bbb" }}>(12)</span>
          </div>
        </div>

        {/* Toggle */}
        <div style={{ display: "flex", gap: 4 }}>
          {(["unique", "subscription"] as const).map(tp => (
            <button
              key={tp}
              onClick={e => { e.stopPropagation(); setType(tp); }}
              style={{
                flex: 1, fontSize: 8, fontWeight: 700,
                padding: compact ? "5px 2px" : "6px 4px",
                borderRadius: 10,
                border: `1px solid ${type === tp ? "#111" : "#e5e7eb"}`,
                background: type === tp ? "#f5f5f5" : "transparent",
                color: type === tp ? "#111" : "#aaa",
                cursor: "pointer",
              }}
            >
              {tp === "unique" ? "Unique" : "Abonnement"}
            </button>
          ))}
        </div>

        {/* Prix */}
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: compact ? 14 : 16, fontWeight: 900, color: "#111" }}>{price}€</div>
          {type === "subscription" && (
            <span style={{ fontSize: 13, color: "#ccc", textDecoration: "line-through" }}>{p.prix}€</span>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={handleAdd}
          style={{
            width: "100%",
            padding: compact ? "9px 0" : "11px 0",
            borderRadius: 30, border: "none",
            background: added ? "#22c55e" : "#ED9446", color: "white",
            fontSize: compact ? 9 : 11, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: 0.5,
            cursor: "pointer", transition: "background 0.2s",
          }}
        >
          {added ? "✓ Ajouté !" : "Ajouter au panier"}
        </button>
      </div>
    </div>
  );
}