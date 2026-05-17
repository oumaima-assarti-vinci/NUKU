"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/lib/contexts/CartContext";
import PackSection from "@/components/PackSection"
import ProducutCard, { ProductCardItem } from "@/components/ProductCard";

// ─── Data ───────────────────────────────────────────────────────────────────

const PRODUCTS: ProductCardItem[] = [
  { id: 11, nom: "NUKU SHINE",    tagline: "Cheveux & beauté — Biotine, Zinc, MSM",        prix: 18, img: "/image/nukujaune2.png",  accent: "#E8B84B", light: "rgba(232,184,75,0.12)"  },
  { id: 12, nom: "NUKU SLEEP",    tagline: "Sommeil — Mélatonine, L-théanine",  prix: 18, img: "/image/nukuBleu2.png",   accent: "#7B9FE0", light: "rgba(123,159,224,0.12)" },
  { id: 13, nom: "NUKU SOURCE",   tagline: "Digestion — Matcha, Artichaut, Pissenlit",     prix: 18, img: "/image/nukuVert2.png",   accent: "#5BA85A", light: "rgba(91,168,90,0.12)"   },
  { id: 14, nom: "NUKU STRENGTH", tagline: "Force & endurance — Créatine, B12, D3",        prix: 18, img: "/image/nukuRouge2.png",  accent: "#E05A4E", light: "rgba(224,90,78,0.12)"   },
  { id: 16, nom: "NUKU SOUL",     tagline: "Relax & équilibre — Ashwagandha, Rhodiola",    prix: 18, img: "/image/nukuViolet2.png", accent: "#9B8EC4", light: "rgba(155,142,196,0.12)" },
];

const COMBOS = [
  { key: "peace",       name: "PEACE & CALM",     badge: "-10%", prix: 32, desc: "Sommeil & Relax — Le duo pour décompresser.",          imgs: ["/image/nukuBleu.png",  "/image/nukuViolet.png"] },
  { key: "beauty",      name: "BEAUTY INSIDE",    badge: "-10%", prix: 32, desc: "Cheveux & Digestion — Beauté et légèreté.",            imgs: ["/image/nukuJaune.png", "/image/nukuVert.png"]   },
  { key: "performance", name: "FULL PERFORMANCE", badge: "-10%", prix: 32, desc: "Force & Sommeil — Entraîne-toi fort, récupère mieux.", imgs: ["/image/nukuRouge.png", "/image/nukuBleu.png"]   },
];

const CURES = [
  { key: "cure-soul",     name: "3 MONTHS CURE", badge: "-15%", prix: 48, desc: "Profondeur et résultats durables sur 90 jours.",        imgs: ["/image/nukuViolet.png", "/image/nukuViolet.png", "/image/nukuViolet.png"] },
  { key: "cure-shine",    name: "3 MONTHS CURE", badge: "-15%", prix: 48, desc: "Beauté durable — 3 mois pour des cheveux transformés.", imgs: ["/image/nukuJaune.png",  "/image/nukuJaune.png",  "/image/nukuJaune.png"]  },
];

const CATEGORIES = [
  { id: 12, name: "Sommeil",           sub: "Mélatonine · L-théanine · Magnésium", img: "/image/nukuBleu.png",   prix: 18 },
  { id: 16, name: "Relax & équilibre", sub: "Ashwagandha · Rhodiola · Safran",     img: "/image/nukuViolet.png", prix: 18 },
  { id: 14, name: "Force & endurance", sub: "Créatine · Vitamine B12 · D3",        img: "/image/nukuRouge.png",  prix: 18 },
  { id: 11, name: "Cheveux & beauté",  sub: "Biotine · Zinc · MSM",                img: "/image/nukuJaune.png",  prix: 18 },
  { id: 13, name: "Digestion",         sub: "Matcha · Artichaut · Pissenlit",      img: "/image/nukuVert.png",   prix: 18 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function useLocale() {
  const pathname = usePathname();
  const seg = pathname?.split("/").filter(Boolean) ?? [];
  return ["fr", "en", "nl"].includes(seg[0]) ? seg[0] : "fr";
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

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

// ─── ProductCard ─────────────────────────────────────────────────────────────

function ProductCard({ p, compact = false }: { p: typeof PRODUCTS[0]; compact?: boolean }) {
  const router = useRouter();
  const locale = useLocale();
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
<div style={{
  background: "#f0eeec",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  borderRadius: "12px 12px 0 0",
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
        <div style={{
    position: "absolute", top: 10, right: 10,
    background: "#111", color: "white",
    fontSize: 9, fontWeight: 900,
    padding: "2px 8px", borderRadius: 20,
  }}>
    -5% ABO
  </div>
     {/*   {type === "subscription" && (
  <div style={{
    position: "absolute", top: 10, right: 10,
    background: "#111", color: "white",
    fontSize: 9, fontWeight: 900,
    padding: "2px 8px", borderRadius: 20,
  }}>
    -5% ABO
  </div>
)}*/}
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

        {/* Toggle unique / abonnement */}
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

// ─── ComboCard ───────────────────────────────────────────────────────────────

function ComboCard({ item }: { item: typeof COMBOS[0] | typeof CURES[0] }) {
  const [added, setAdded] = useState(false);
  const triple = item.imgs.length === 3;

  return (
    <div style={{ borderRadius: 16, border: "1px solid #f0f0f0", background: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
      {/* Images */}
      <div style={{ background: "#f0eeec", height: 190, position: "relative", overflow: "hidden" }}>
        {triple ? (
          <>
            <img src={item.imgs[0]} alt="" style={{ position: "absolute", bottom: 0, left: "10%", height: "65%", objectFit: "contain", filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.13))", zIndex: 5 }} />
            <img src={item.imgs[1]} alt="" style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", height: "73%", objectFit: "contain", filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.16))", zIndex: 10 }} />
            <img src={item.imgs[2]} alt="" style={{ position: "absolute", bottom: 0, right: "10%", height: "65%", objectFit: "contain", filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.13))", zIndex: 5 }} />
          </>
        ) : (
          <>
            <img src={item.imgs[0]} alt="" style={{ position: "absolute", bottom: 0, left: "24%", transform: "rotate(-8deg)", height: "72%", objectFit: "contain", filter: "drop-shadow(0 12px 22px rgba(0,0,0,0.15))" }} />
            <img src={item.imgs[1]} alt="" style={{ position: "absolute", bottom: 0, right: "24%", transform: "rotate(6deg)", height: "72%", objectFit: "contain", filter: "drop-shadow(0 12px 22px rgba(0,0,0,0.15))" }} />
          </>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "16px 18px" }}>
        <p style={{ fontSize: 12, fontWeight: 900, color: "#111", textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 4px" }}>{item.name}</p>
        <p style={{ fontSize: 10, color: "#888", lineHeight: 1.5, margin: "0 0 14px" }}>{item.desc}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: "#111" }}>{item.prix}€</span>
          <span style={{ fontSize: 9, fontWeight: 700, background: "#111", color: "white", padding: "3px 8px", borderRadius: 20 }}>{item.badge}</span>
        </div>
        <button
          onClick={() => { setAdded(true); setTimeout(() => setAdded(false), 1800); }}
          style={{
            width: "100%", padding: "10px 0", borderRadius: 30, border: "none",
            background: added ? "#22c55e" : "#ED9446", color: "white",
            fontSize: 11, fontWeight: 700, textTransform: "uppercase", cursor: "pointer", transition: "background 0.2s",
          }}
        >
          {added ? "✓ Ajouté !" : "Ajouter au panier"}
        </button>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function NukuShop() {
  const { addToCart } = useCart();
  const isMobile = useIsMobile();
  

  // ── Responsive values ──
  const sectionPadding = isMobile ? "32px 16px 28px" : "48px 48px 40px";
  const sectionPaddingLg = isMobile ? "32px 16px 40px" : "48px 48px 56px";

  // Products: 5 en une ligne desktop, 2 colonnes mobile
  
// Products grid
const productsGridStyle: React.CSSProperties = isMobile
  ? { display: "flex", overflowX: "auto", gap: 12, scrollSnapType: "x mandatory", paddingBottom: 8, scrollbarWidth: "none" }
  : { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 };
  // Combos/Cures: 3 colonnes desktop, 1 colonne mobile
  const threeColGrid = isMobile
    ? { gridTemplateColumns: "1fr", gap: 12 }
    : { gridTemplateColumns: "repeat(3, 1fr)", gap: 20 };

  return (
    <div style={{ background: "white", minHeight: "100vh" }}>

      {/* ══ BUILD YOUR BALANCE ══ */}
      <section style={{ padding: sectionPadding, maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ fontSize: isMobile ? 28 : 40, fontWeight: 900, color: "#111", margin: "0 0 8px" }}>
          Build your balance
        </h1>
        <p style={{ fontSize: 13, color: "#aaa", margin: "0 0 6px" }}>
          Choisissez le produit adapté à votre objectif du moment.
        </p>
        <p style={{ fontSize: 13, color: "#777", margin: "0 0 32px", maxWidth: 560, lineHeight: 1.6 }}>
          Chaque formule Nuku est pensée pour un besoin précis — sommeil, énergie, beauté, récupération ou équilibre.
        </p>

       <div style={productsGridStyle}>
  {PRODUCTS.map(p => (
    <div key={p.id} style={isMobile ? { flex: "0 0 30vw", scrollSnapAlign: "start" } as React.CSSProperties : {}}>
      <ProductCard p={p} compact={true} />
    </div>
  ))}
</div>
      </section>

      {/* ══ NOS COMBOS ══ */}
      <section style={{ background: "#f5f3ef", borderTop: "1px solid #f0f0f0", padding: sectionPadding }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontSize: isMobile ? 24 : 34, fontWeight: 900, color: "#111", margin: "0 0 6px" }}>
            Nos combos
          </h2>
          <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 28px" }}>
            Deux produits pensés ensemble pour des effets amplifiés.
          </p>

          {/* Combos */}
          <div style={{ display: "grid", ...threeColGrid, marginBottom: isMobile ? 12 : 20 }}>
            {COMBOS.map(c => <ComboCard key={c.key} item={c} />)}
          </div>

          {/* Cures row 1 */}
          <div style={{ display: "grid", ...threeColGrid, marginBottom: isMobile ? 12 : 20 }}>
            {CURES.slice(0, 3).map(c => <ComboCard key={c.key} item={c} />)}
          </div>

          {/* Cures row 2 */}
          <div style={{ display: "grid", ...threeColGrid }}>
            {CURES.slice(3).map(c => <ComboCard key={c.key} item={c} />)}
          </div>
        </div>
      </section>

      {/* ══ PERSONNALISEZ VOTRE PACK ══ */}
      <PackSection
  title="Personnalisez votre pack"
  subtitle="Choisissez vos produits et composez la routine qui vous ressemble jusqu'à -30%"
  packLabel="Mon pack personnalisé"
  oneTimeLabel="Achat unique"
  subLabel="Abonnement"
  monthLabel="mois"
  addedLabel="Produits ajoutés au panier !"
/>
    </div>
  );
}