"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/lib/contexts/CartContext";

// ─── Data ───────────────────────────────────────────────────────────────────

const PRODUCTS = [
  { id: 11, nom: "NUKU SHINE",    tagline: "Cheveux & beauté — Biotine, Zinc, MSM",        prix: 18, img: "/image/nukuJaune.png",  accent: "#E8B84B", light: "rgba(232,184,75,0.12)"  },
  { id: 12, nom: "NUKU SLEEP",    tagline: "Sommeil — Mélatonine, L-théanine, Magnésium",  prix: 18, img: "/image/nukuBleu.png",   accent: "#7B9FE0", light: "rgba(123,159,224,0.12)" },
  { id: 13, nom: "NUKU SOURCE",   tagline: "Digestion — Matcha, Artichaut, Pissenlit",     prix: 18, img: "/image/nukuVert.png",   accent: "#5BA85A", light: "rgba(91,168,90,0.12)"   },
  { id: 14, nom: "NUKU STRENGTH", tagline: "Force & endurance — Créatine, B12, D3",        prix: 18, img: "/image/nukuRouge.png",  accent: "#E05A4E", light: "rgba(224,90,78,0.12)"   },
  { id: 16, nom: "NUKU SOUL",     tagline: "Relax & équilibre — Ashwagandha, Rhodiola",    prix: 18, img: "/image/nukuViolet.png", accent: "#9B8EC4", light: "rgba(155,142,196,0.12)" },
];

const COMBOS = [
  { key: "peace",       name: "PEACE & CALM",     badge: "-10%", prix: 32, desc: "Sommeil & Relax — Le duo pour décompresser.",          imgs: ["/image/nukuBleu.png",  "/image/nukuViolet.png"] },
  { key: "beauty",      name: "BEAUTY INSIDE",    badge: "-10%", prix: 32, desc: "Cheveux & Digestion — Beauté et légèreté.",            imgs: ["/image/nukuJaune.png", "/image/nukuVert.png"]   },
  { key: "performance", name: "FULL PERFORMANCE", badge: "-10%", prix: 32, desc: "Force & Sommeil — Entraîne-toi fort, récupère mieux.", imgs: ["/image/nukuRouge.png", "/image/nukuBleu.png"]   },
];

const CURES = [
  { key: "cure-sleep",    name: "3 MONTHS CURE", badge: "-15%", prix: 48, desc: "Un trimestre complet pour ancrer vos habitudes.",       imgs: ["/image/nukuBleu.png",   "/image/nukuBleu.png",   "/image/nukuBleu.png"]   },
  { key: "cure-soul",     name: "3 MONTHS CURE", badge: "-15%", prix: 48, desc: "Profondeur et résultats durables sur 90 jours.",        imgs: ["/image/nukuViolet.png", "/image/nukuViolet.png", "/image/nukuViolet.png"] },
  { key: "cure-strength", name: "3 MONTHS CURE", badge: "-15%", prix: 48, desc: "La cure recommandée pour des effets visibles.",         imgs: ["/image/nukuRouge.png",  "/image/nukuRouge.png",  "/image/nukuRouge.png"]  },
  { key: "cure-shine",    name: "3 MONTHS CURE", badge: "-15%", prix: 48, desc: "Beauté durable — 3 mois pour des cheveux transformés.", imgs: ["/image/nukuJaune.png",  "/image/nukuJaune.png",  "/image/nukuJaune.png"]  },
  { key: "cure-source",   name: "3 MONTHS CURE", badge: "-15%", prix: 48, desc: "Digestion optimale sur le long terme.",                 imgs: ["/image/nukuVert.png",   "/image/nukuVert.png",   "/image/nukuVert.png"]   },
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

function ProductCard({ p }: { p: typeof PRODUCTS[0] }) {
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
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Image */}
      <div style={{ background: "#f0eeec", height: 210, display: "flex", alignItems: "flex-end", justifyContent: "center", position: "relative", paddingTop: 16 }}>
        <img
          src={p.img}
          alt={p.nom}
          style={{
            height: "65%", width: "auto", objectFit: "contain",
            filter: "drop-shadow(0 12px 20px rgba(0,0,0,0.13))",
            transform: hov ? "scale(1.04) translateY(-4px)" : "scale(1)",
            transition: "transform 0.3s",
          }}
        />
        <div style={{ position: "absolute", top: 10, right: 10, background: p.accent, color: "white", fontSize: 9, fontWeight: 900, padding: "2px 8px", borderRadius: 20 }}>
          -20% ABO
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", flex: 1, gap: 10 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 900, color: "#111", textTransform: "uppercase", letterSpacing: 0.5, margin: 0 }}>{p.nom}</p>
          <p style={{ fontSize: 10, color: "#aaa", lineHeight: 1.4, margin: "4px 0 0" }}>{p.tagline}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
            <StarRating value={4} />
            <span style={{ fontSize: 9, color: "#bbb" }}>(12)</span>
          </div>
        </div>

        {/* Toggle unique / abonnement */}
        <div style={{ display: "flex", gap: 6 }}>
          {(["unique", "subscription"] as const).map(tp => (
            <button
              key={tp}
              onClick={e => { e.stopPropagation(); setType(tp); }}
              style={{
                flex: 1, fontSize: 9, fontWeight: 700, padding: "6px 4px", borderRadius: 10,
                border: `1px solid ${type === tp ? p.accent : "#e5e7eb"}`,
                background: type === tp ? p.light : "transparent",
                color: type === tp ? p.accent : "#aaa", cursor: "pointer",
              }}
            >
              {tp === "unique" ? "Unique" : "Abonnement"}
            </button>
          ))}
        </div>

        {/* Prix */}
        <div style={{ marginTop: "auto" }}>
          {type === "subscription" && (
            <div style={{ fontSize: 10, color: "#ccc", textDecoration: "line-through" }}>{p.prix}€</div>
          )}
          <div style={{ fontSize: 16, fontWeight: 900, color: "#111" }}>{price}€</div>
        </div>

        {/* CTA */}
        <button
          onClick={handleAdd}
          style={{
            width: "100%", padding: "11px 0", borderRadius: 30, border: "none",
            background: added ? "#22c55e" : "#ED9446", color: "white",
            fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5,
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
    <div style={{ borderRadius: 16, border: "1px solid #f0f0f0", background: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden", fontFamily: "'Inter', system-ui, sans-serif" }}>
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
  const [routineQty, setRoutineQty] = useState([0, 0, 0, 0, 0]);
  const [routineAdded, setRoutineAdded] = useState(false);

  const total = routineQty.reduce((s, q, i) => s + q * CATEGORIES[i].prix, 0);
  const sub = Math.round(total * 0.95);

  const changeQty = (i: number, d: number) =>
    setRoutineQty(prev => { const next = [...prev]; next[i] = Math.max(0, next[i] + d); return next; });

  const handleRoutineAdd = (isSub: boolean) => {
    CATEGORIES.forEach((cat, i) => {
      for (let q = 0; q < routineQty[i]; q++) {
        addToCart({ id: cat.id, nom: cat.name, prix: cat.prix, images: [cat.img] } as any, isSub);
      }
    });
    setRoutineAdded(true);
    setTimeout(() => setRoutineAdded(false), 2000);
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "white", minHeight: "100vh" }}>

      {/* ══ BUILD YOUR BALANCE ══ */}
      <section style={{ padding: "48px 48px 40px", maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 40, fontWeight: 900, color: "#111", margin: "0 0 8px" }}>
          Build your balance
        </h1>
        <p style={{ fontSize: 13, color: "#aaa", margin: "0 0 6px" }}>
          Choisissez le produit adapté à votre objectif du moment.
        </p>
        <p style={{ fontSize: 13, color: "#777", margin: "0 0 32px", maxWidth: 560, lineHeight: 1.6 }}>
          Chaque formule Nuku est pensée pour un besoin précis — sommeil, énergie, beauté, récupération ou équilibre.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {PRODUCTS.map(p => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* ══ NOS COMBOS ══ */}
      <section style={{ background: "#FDFAF5", borderTop: "1px solid #f0f0f0", padding: "48px 48px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 34, fontWeight: 900, color: "#111", margin: "0 0 6px" }}>
            Nos combos
          </h2>
          <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 28px" }}>
            Deux produits pensés ensemble pour des effets amplifiés.
          </p>

          {/* Combos */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 20 }}>
            {COMBOS.map(c => <ComboCard key={c.key} item={c} />)}
          </div>

          {/* Cures row 1 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 20 }}>
            {CURES.slice(0, 3).map(c => <ComboCard key={c.key} item={c} />)}
          </div>

          {/* Cures row 2 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {CURES.slice(3).map(c => <ComboCard key={c.key} item={c} />)}
          </div>
        </div>
      </section>

      {/* ══ PERSONNALISEZ VOTRE PACK ══ */}
      <section style={{ background: "white", borderTop: "1px solid #f0f0f0", padding: "48px 48px 56px" }}>
  <div style={{ maxWidth: 1200, margin: "0 auto" }}>
    <h2 style={{ fontFamily: "Georgia, serif", fontSize: 34, fontWeight: 900, color: "#111", margin: "0 0 4px" }}>
      Personnalisez votre pack
    </h2>
    <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 28px" }}>
      Choisissez vos produits et composez la routine qui vous ressemble jusqu&apos;à -30%
    </p>

    {/* Sélecteur de produits */}
    <div style={{ display: "flex", gap: 14, marginBottom: 28, overflowX: "auto" }}>
      {CATEGORIES.map((cat, i) => (
        <div key={cat.id} style={{ borderRadius: 12, border: "1px solid #f0f0f0", background: "white", minWidth: 112, overflow: "hidden", flexShrink: 0 }}>
          <div style={{ background: "#f0eeec", height: 100, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingTop: 8 }}>
            <img src={cat.img} alt={cat.name} style={{ height: "80%", width: "auto", objectFit: "contain", filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.14))" }} />
          </div>
          <div style={{ padding: "10px 10px 12px" }}>
            <p style={{ fontSize: 9, fontWeight: 900, color: "#111", textTransform: "uppercase", letterSpacing: 0.3, margin: "0 0 3px", lineHeight: 1.3 }}>{cat.name}</p>
            <p style={{ fontSize: 8, color: "#aaa", margin: "0 0 8px", lineHeight: 1.4 }}>{cat.sub}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button onClick={() => changeQty(i, -1)} style={{ width: 22, height: 22, borderRadius: "50%", border: "1px solid #ddd", background: "white", cursor: "pointer", fontSize: 14, color: "#555", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#111", width: 16, textAlign: "center" }}>{routineQty[i]}</span>
              <button onClick={() => changeQty(i, 1)} style={{ width: 22, height: 22, borderRadius: "50%", border: "1px solid #ddd", background: "white", cursor: "pointer", fontSize: 14, color: "#555", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Récapitulatif */}
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 18, padding: "24px 28px" }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: "#777", margin: "0 0 14px" }}>Mon pack personnalisé</p>

      {/* Aperçu des images */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 20, minHeight: 48 }}>
        {routineQty.every(q => q === 0) ? (
          <p style={{ fontSize: 12, color: "#ccc", margin: 0 }}>Ajoutez des produits pour composer votre pack</p>
        ) : (
          CATEGORIES.map((cat, i) =>
            Array.from({ length: routineQty[i] }).map((_, j) => (
              <div key={`${i}-${j}`} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {(i > 0 || j > 0) && <span style={{ color: "#ddd", fontSize: 16 }}>+</span>}
                <img src={cat.img} alt={cat.name} style={{ height: 38, width: "auto", objectFit: "contain", filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.12))" }} />
              </div>
            ))
          )
        )}
      </div>

      {/* Boutons achat */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <button
          onClick={() => handleRoutineAdd(false)}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 18px", background: "white", cursor: "pointer" }}
        >
          <span style={{ fontSize: 12, color: "#777" }}>Achat unique</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#111" }}>{total}€</span>
        </button>

        <button
          onClick={() => handleRoutineAdd(true)}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "2px solid #ED9446", borderRadius: 12, padding: "14px 18px", background: "white", cursor: "pointer" }}
        >
          <span style={{ fontSize: 12, color: "#777" }}>Abonnement</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 9, fontWeight: 700, background: "#111", color: "white", padding: "2px 6px", borderRadius: 6 }}>-5%</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>
              {sub}€<span style={{ fontSize: 10, fontWeight: 400, color: "#888" }}>/mois</span>
            </span>
          </div>
        </button>
      </div>

      {/* Confirmation ajout */}
      {routineAdded && (
        <div style={{ marginTop: 12, background: "#f0faf0", color: "#2d7a2d", border: "1px solid #b6e6b6", borderRadius: 12, padding: "10px 16px", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Produits ajoutés au panier !
        </div>
      )}
    </div>
  </div>
</section>
    </div>
  );
}