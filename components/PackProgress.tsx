"use client";
import { usePack } from "@/lib/contexts/PackContext";

const TIERS = [
  { min: 2, discount: 5 },
  { min: 3, discount: 15 },
  { min: 5, discount: 20 },
];

export default function PackProgress() {
  const { totalItems, discount } = usePack();
  const nextTier = TIERS.find(t => t.min > totalItems);
  const progress = Math.min((totalItems / 5) * 100, 100);

  return (
  <div style={{ marginBottom: 20, padding: "14px 0 6px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
      {TIERS.map(t => (
        <span key={t.min} style={{
          fontSize: 10, fontWeight: 700,
          color: totalItems >= t.min ? "#ED9446" : "#ccc",
          transition: "color 0.3s",
        }}>
          -{t.discount}% ({t.min}+)
        </span>
      ))}
    </div>

    <div style={{ height: 6, background: "#f0f0f0", borderRadius: 6, position: "relative" }}>
      <div style={{
        height: 6, borderRadius: 6,
        background: "linear-gradient(to right, #ED9446, #f4b567)",
        width: `${progress}%`,
        transition: "width 0.4s ease",
      }} />
      {TIERS.map(t => (
        <div key={t.min} style={{
          position: "absolute",
          left: `${(t.min / 5) * 100}%`,
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 12, height: 12, borderRadius: "50%",
          background: totalItems >= t.min ? "#ED9446" : "white",
          border: `2px solid ${totalItems >= t.min ? "#ED9446" : "#ddd"}`,
          transition: "all 0.3s",
        }} />
      ))}
    </div>

    <p style={{ fontSize: 11, color: "#aaa", marginTop: 8, textAlign: "center" }}>
      {totalItems === 0
        ? "Ajoutez des produits pour débloquer vos réductions 🌿"
        : nextTier
        ? `Plus que ${nextTier.min - totalItems} produit(s) pour -${nextTier.discount}%`
        : `-${discount}% appliqué sur votre pack !`}
    </p>
  </div>
);
}