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

export default function ProductCard({ p, compact = false }: { p: ProductCardItem; compact?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const seg = pathname?.split("/").filter(Boolean) ?? [];
  const locale = ["fr", "en", "nl"].includes(seg[0]) ? seg[0] : "fr";
  const { addToCart } = useCart();

  const [added, setAdded] = useState(false);
  const [hov, setHov] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(
      { id: p.id, nom: p.nom, prix: p.prix, images: [p.img] } as any,
      false
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
        borderRadius: 20,
        border: "1px solid #ececec",
        background: "white",
        boxShadow: hov ? "0 8px 24px rgba(0,0,0,0.09)" : "0 1px 4px rgba(0,0,0,0.05)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        transition: "box-shadow 0.25s, transform 0.25s",
        maxWidth: 260,
        width: "100%",
      }}
    >
      {/* Image */}
      <div style={{
        background: "#f7f6f2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "28px 20px 16px",
      }}>
        <img
          src={p.img}
          alt={p.nom}
          style={{
            width: "75%",
            height: "auto",
            display: "block",
            transform: hov ? "scale(1.04)" : "scale(1)",
            transition: "transform 0.3s",
          }}
        />
      </div>

      {/* Content */}
      <div style={{
        padding: "16px 18px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}>
        {/* Nom + Prix */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#111", margin: 0 }}>{p.nom}</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#111", margin: 0, whiteSpace: "nowrap" }}>{p.prix}€</p>
        </div>

        {/* Tagline */}
        <p style={{ fontSize: 12, color: "#888", margin: "2px 0 14px", lineHeight: 1.4 }}>{p.tagline}</p>

        {/* CTA */}
        <button
          onClick={handleAdd}
          style={{
            width: "100%",
            padding: "11px 0",
            borderRadius: 30,
            border: "1.5px solid #ddd",
            background: added ? "#22c55e" : "white",
            color: added ? "white" : "#111",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {added ? "✓ Ajouté !" : "Ajouter au panier"}
        </button>
      </div>
    </div>
  );
}