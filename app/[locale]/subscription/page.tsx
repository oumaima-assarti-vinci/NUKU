"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/lib/contexts/CartContext";
import PackSection from "@/components/PackSection";

const PRODUCTS = [
  { id: 14, nom: "NUKU STRENGTH", benefit: "Force & Performance",    prix: 18, img: "/image/nukuRouge.png",  accent: "#E05A4E", light: "rgba(224,90,78,0.12)"   },
  { id: 12, nom: "NUKU SLEEP",    benefit: "Sommeil & Récupération", prix: 18, img: "/image/nukuBleu.png",   accent: "#7B9FE0", light: "rgba(123,159,224,0.12)" },
  { id: 16, nom: "NUKU SOUL",     benefit: "Relax & Équilibre",      prix: 18, img: "/image/nukuViolet.png", accent: "#9B8EC4", light: "rgba(155,142,196,0.12)" },
  { id: 11, nom: "NUKU SHINE",    benefit: "Cheveux & Éclat",        prix: 18, img: "/image/nukuJaune.png",  accent: "#E8B84B", light: "rgba(232,184,75,0.12)"  },
  { id: 13, nom: "NUKU SOURCE",   benefit: "Digestion & Légèreté",   prix: 18, img: "/image/nukuVert.png",   accent: "#5BA85A", light: "rgba(91,168,90,0.12)"   },
];

const AVANTAGES = [
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    title: "Aucune charge mentale",
    desc: "Vos produits arrivent toujours au bon moment. Recevez automatiquement vos formules. À votre rythme. Sans engagement.",
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
      </svg>
    ),
    title: "Liberté totale",
    desc: "Changez, mettez en pause, arrêtez quand vous voulez. Aucun engagement, aucune pénalité. Vous restez toujours maître de votre routine.",
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    title: "-20% sur chaque commande",
    desc: "Économisez automatiquement 20% sur chaque livraison abonnement. Plus vous restez fidèle, plus vous économisez.",
  },
];

function useLocale() {
  const pathname = usePathname();
  const seg = pathname?.split("/").filter(Boolean) ?? [];
  return ["fr", "en", "nl"].includes(seg[0]) ? seg[0] : "fr";
}

function SubProductCard({ p }: { p: typeof PRODUCTS[0] }) {
  const router = useRouter();
  const locale = useLocale();
  const [hov, setHov] = useState(false);
  const [mode, setMode] = useState<'unique' | 'abo'>('unique');

  const prix = mode === 'abo' ? (p.prix * 0.8).toFixed(2) : p.prix;

  return (
    <div
      className="sub-product-card"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 16,
        border: `1px solid ${hov ? p.accent : "#ececec"}`,
        background: "white",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        boxShadow: hov ? `0 8px 28px rgba(0,0,0,0.10)` : "0 1px 4px rgba(0,0,0,0.05)",
        transition: "all 0.25s ease",
        position: "relative",
      }}
    >
      {/* Badge -20% ABO */}
      <div className="abo-badge" style={{
  position: "absolute", top: 12, right: 12, zIndex: 2,
  background: p.accent, color: "white",
  fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
}}>
  -20% ABO
</div>

      {/* Image */}
      <div style={{ background: "#f5f3f0", height: 180, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <img
          src={p.img}
          alt={p.benefit}
          style={{
            height: "90%", width: "auto", objectFit: "contain",
            filter: "drop-shadow(0 14px 22px rgba(0,0,0,0.15))",
            transform: hov ? "scale(1.06) translateY(-4px)" : "scale(1)",
            transition: "transform 0.3s ease",
          }}
        />
      </div>

      {/* Content */}
      <div style={{ padding: "14px 16px 18px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <p style={{ fontSize: 12, fontWeight: 900, color: "#111", textTransform: "uppercase", letterSpacing: 0.8, margin: 0 }}>
          {p.nom}
        </p>
        <p style={{ fontSize: 11, color: "#aaa", margin: 0, lineHeight: 1.5 }}>
          {p.benefit}
        </p>

        {/* Étoiles */}
        <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
          {[1,2,3,4].map(s => (
            <svg key={s} width="12" height="12" fill="#f97316" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          ))}
          <svg width="12" height="12" fill="#ddd" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
          <span style={{ fontSize: 10, color: "#bbb", marginLeft: 2 }}>(12)</span>
        </div>

        {/* Toggle Unique / Abonnement */}
        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
          <button
            onClick={() => setMode('unique')}
            style={{
              flex: 1, padding: "6px 0", borderRadius: 20, fontSize: 10, fontWeight: 600, cursor: "pointer",
              border: `1.5px solid ${mode === 'unique' ? p.accent : '#ddd'}`,
              background: mode === 'unique' ? p.light : 'transparent',
              color: mode === 'unique' ? p.accent : '#aaa',
              transition: "all 0.2s",
            }}
          >
            Unique
          </button>
          <button
            onClick={() => setMode('abo')}
            style={{
              flex: 1, padding: "6px 0", borderRadius: 20, fontSize: 10, fontWeight: 600, cursor: "pointer",
              border: `1.5px solid ${mode === 'abo' ? p.accent : '#ddd'}`,
              background: mode === 'abo' ? p.light : 'transparent',
              color: mode === 'abo' ? p.accent : '#aaa',
              transition: "all 0.2s",
            }}
          >
            Abonnement
          </button>
        </div>

        {/* Prix */}
        <p style={{ fontSize: 18, fontWeight: 800, color: "#111", margin: "4px 0 0" }}>
          {prix}€
        </p>

        {/* Bouton Ajouter */}
        <button
          onClick={() => router.push(`/${locale}/product/${p.id}`)}
          style={{
            marginTop: 8, padding: "11px 0", borderRadius: 30, border: "none",
            background: "#ED9446", color: "white",
            fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8,
            cursor: "pointer", transition: "opacity 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          Ajouter au panier
        </button>
      </div>
    </div>
  );
}

export default function AbonnementPage() {
  const router = useRouter();
  const locale = useLocale();
  const { addToCart } = useCart();
  const [routineAdded, setRoutineAdded] = useState(false);
  const pathname = usePathname();
  const segments = pathname?.split('/').filter(Boolean) ?? [];
  const lang = ['fr', 'en', 'nl'].includes(segments[0]) ? segments[0] : 'fr';

  return (
    <div style={{ background: "white", minHeight: "100vh", paddingTop: 73 }}>

      {/* ══ HERO BANNER ══ */}
      <section style={{ background: "#f5f3f0", padding: "56px 48px" }}>
        <div className="hero-grid" style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 40 }}>
          <div>
            <h1 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 900, color: "#111", margin: "0 0 12px", lineHeight: 1.15 }}>
              Vos compléments,<br />Sans efforts.
            </h1>
            <p style={{ fontSize: 14, color: "#777", margin: "0 0 28px", lineHeight: 1.6 }}>
              Recevez automatiquement vos formules. Sans engagement.
            </p>
            <button
              onClick={() => router.push(`/${locale}/shop`)}
              style={{
                padding: "13px 28px", borderRadius: 30, border: "none",
                background: "#ED9446", color: "white",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 16px rgba(237,148,70,0.35)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(237,148,70,0.45)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(237,148,70,0.35)"; }}
            >
              Voir les produits
            </button>
          </div>
          <div className="hero-img" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
            <img
              src="/image/nukuRouge.png"
              alt="NUKU"
              style={{ height: 200, width: "auto", objectFit: "contain", filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.18))", transform: "rotate(8deg)" }}
            />
          </div>
        </div>
      </section>

      {/* ══ COMMENT ÇA MARCHE ══ */}
      <section style={{ background: "white", padding: "56px 48px", borderTop: "1px solid #f0f0f0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 40, textAlign: "center" }}>
            {[
              { num: "1.", title: "Choisissez votre produit", desc: "Accédez à votre produit ou pack de votre choix." },
              { num: "2.", title: "Choisissez un abonnement", desc: 'Sélectionnez "Abonnement" et choisissez la fréquence de votre choix. Vous pourrez facilement la modifier par la suite.' },
              { num: "3.", title: "Économisez toujours 20%", desc: "20% de réduction sur chaque livraison, frais de port toujours gratuits et accès exclusif aux offres spéciales." },
            ].map((step, i) => (
              <div key={i}>
                <p style={{ fontSize: 22, fontWeight: 700, color: "#ED9446", margin: "0 0 8px" }}>{step.num}</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#111", margin: "0 0 8px" }}>{step.title}</p>
                <p style={{ fontSize: 13, color: "#888", margin: 0, lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ UNE ROUTINE BIEN-ÊTRE ══ */}
      <section style={{ padding: "64px 48px", maxWidth: 1200, margin: "0 auto" }}>
        <div className="avantages-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "start" }}>
          <div>
            <h2 style={{ fontSize: "clamp(26px, 3vw, 42px)", fontWeight: 900, color: "#111", margin: "0 0 12px", lineHeight: 1.2 }}>
              Une routine bien-être,<br />sans y penser.
            </h2>
            <p style={{ fontSize: 13, color: "#888", margin: 0, lineHeight: 1.7 }}>
              Recevez automatiquement vos formules. À votre rythme. Sans engagement.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {AVANTAGES.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                <div style={{
                  flexShrink: 0, width: 44, height: 44, borderRadius: 12,
                  background: "#f5f3f0", display: "flex", alignItems: "center",
                  justifyContent: "center", color: "#ED9446",
                }}>
                  {a.icon}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#111", margin: "0 0 4px" }}>{a.title}</p>
                  <p style={{ fontSize: 12, color: "#888", margin: 0, lineHeight: 1.7 }}>{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ COMMENCEZ DÈS MAINTENANT ══ */}
      <section style={{ background: "#fafaf9", borderTop: "1px solid #f0f0f0", padding: "56px 48px 64px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 900, color: "#111", margin: "0 0 8px", textAlign: "center" }}>
            Commencez dès maintenant
          </h2>
          <p style={{ fontSize: 13, color: "#aaa", textAlign: "center", margin: "0 0 40px" }}>
            Choisissez votre formule et recevez-la chaque mois avec -20%.
          </p>

          {/* Grille produits — 5 colonnes desktop, 1 colonne mobile */}
          <div className="products-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, maxWidth: 1100, margin: "0 auto 40px" }}>
            {PRODUCTS.slice(0, 3).map(p => <SubProductCard key={p.id} p={p} />)}
          </div>

          {/* CTA Shop all */}
          <div style={{ textAlign: "center" }}>
            <button
              onClick={() => router.push(`/${locale}/shop`)}
              style={{
                padding: "13px 36px", borderRadius: 30,
                border: "2px solid #111", background: "transparent", color: "#111",
                fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8,
                cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#111"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#111"; }}
            >
              Shop all
            </button>
          </div>
        </div>
      </section>

      <PackSection
        title={lang === 'fr' ? 'Créez votre pack' : lang === 'en' ? 'Create your pack' : 'Maak je pack'}
        subtitle={lang === 'fr' ? "Choisissez vos produits et composez la routine qui vous ressemble jusqu'à -30%" : lang === 'en' ? 'Choose your products and build your routine up to -30%' : 'Kies uw producten en stel uw routine samen tot -30%'}
        packLabel={lang === 'fr' ? 'Mon pack personnalisé :' : lang === 'en' ? 'My custom pack:' : 'Mijn persoonlijk pakket:'}
        oneTimeLabel={lang === 'fr' ? 'Achat unique' : lang === 'en' ? 'One-time purchase' : 'Eenmalig'}
        subLabel="Abonnement"
        monthLabel={lang === 'fr' ? 'mois' : lang === 'en' ? 'month' : 'maand'}
        addedLabel={lang === 'fr' ? 'Produits ajoutés au panier !' : lang === 'en' ? 'Products added to cart!' : 'Producten toegevoegd!'}
      />

     <style jsx global>{`
  @media (max-width: 768px) {
    section {
      padding-left: 20px !important;
      padding-right: 20px !important;
    }
    .hero-img {
      display: none !important;
    }
    .hero-grid {
      grid-template-columns: 1fr !important;
    }
    .avantages-grid {
      grid-template-columns: 1fr !important;
      gap: 32px !important;
    }
    .steps-grid {
      grid-template-columns: 1fr !important;
      gap: 32px !important;
    }
      .sub-product-card {
  overflow: hidden !important;
}
    .products-grid {
      display: grid !important;
      grid-template-columns: repeat(3, 1fr) !important;
      gap: 10px !important;
      max-width: 100% !important;
      overflow-x: unset !important;
    }
    .products-grid > * {
      flex: unset !important;
    }
    .sub-product-card > div:first-child {
      height: 120px !important;
    }
    .abo-badge {
      font-size: 8px !important;
      padding: 2px 5px !important;
      top: 6px !important;
      right: 6px !important;
    }
    .pack-grid {
      grid-template-columns: 1fr !important;
    }
    .pack-grid button {
      padding: 16px 18px !important;
    }
    #creer-votre-routine > div {
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
  }

  .scroll-hint {
    display: none;
  }
`}</style>
    </div>
  );
}