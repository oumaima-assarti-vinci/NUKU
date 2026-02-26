// components/ShowcaseSection.tsx
import React from 'react';

type ShowcaseSectionProps = {
  id?: string;
  title: string;
  cardTitle: string;
  description: React.ReactNode;
  leftImage: { src: string; alt?: string };
  productImage?: { src: string; alt?: string };
  accentIcon?: React.ReactNode; // ex: <span aria-hidden>🌙</span>
  scope?: 'sleep' | 'photo' | 'custom';
  className?: string;
};

export default function ShowcaseSection({
  id = 'showcase',
  title,
  cardTitle,
  description,
  leftImage,
  productImage,
  accentIcon,
  scope = 'custom',
  className
}: ShowcaseSectionProps) {
  const sectionId = `${id}-section`;
  const titleId = `${id}-title`;
  const cardTitleId = `${id}-card-title`;
  const descId = `${id}-desc`;

  return (
    <section
      id={sectionId}
      className={`showcase-wrapper scope-${scope} ${className ?? ''}`}
      aria-labelledby={titleId}
      aria-describedby={descId}
      data-scope={scope}
    >
      <div className="ambient" aria-hidden="true" />

      <div className="frame">
        {/* LIGNE 1 : TITRES ALIGNÉS */}
        <div className="titles-row" role="group" aria-label="Titres de section et de carte">
          <h1 id={titleId} className="main-title">
            {title}
          </h1>

          <h2 id={cardTitleId} className="card-title">
            <span className="accent" aria-hidden="true">
              {accentIcon ?? '✨'}
            </span>
            {cardTitle}
          </h2>
        </div>

        {/* LIGNE 2 : CONTENUS */}
        <div className="content-row">
          {/* Colonne gauche */}
          <div className="left-col">
            <p id={descId} className="description">
              {description}
            </p>

            <figure className="product-image">
              <img
                src={leftImage.src}
                alt={leftImage.alt ?? ''}
                loading="lazy"
              />
              {/* Overlays pour visibilité */}
              <div className="img-gradient" aria-hidden="true" />
              <div className="img-vignette" aria-hidden="true" />
              <div className="img-bokeh" aria-hidden="true" />
            </figure>
          </div>

          {/* Colonne droite */}
          <article className="advice-card" aria-labelledby={cardTitleId}>
            <div className="slot">
              {/* Tu peux injecter une <ul> ou tout autre contenu via composition si nécessaire */}
            </div>

            {productImage && (
              <div className="card-product">
                <img
                  src={productImage.src}
                  alt={productImage.alt ?? ''}
                  loading="lazy"
                  className="card-product-img"
                />
                {/* halo + socle */}
                <span className="product-glow" aria-hidden="true" />
                <span className="product-plinth" aria-hidden="true" />
              </div>
            )}
          </article>
        </div>
      </div>

      <style jsx>{`
        /* ---------- THEME PAR VARIABLES ---------- */
        .showcase-wrapper {
          --bg-grad-1: #f9f0e8;
          --bg-grad-2: #f5e8dc;
          --bg-grad-3: #f8ede3;

          --ambient-a: rgba(255, 220, 180, 0.65);
          --ambient-b: rgba(255, 210, 160, 0.55);
          --ambient-c: rgba(255, 230, 200, 0.45);
          --ambient-d: rgba(255, 200, 150, 0.35);
          --ambient-e: rgba(255, 215, 175, 0.4);

          --panel-bg: rgba(255, 252, 248, 0.9);
          --panel-border: rgba(255, 240, 220, 0.6);
          --panel-shadow-a: rgba(200, 140, 80, 0.15);
          --panel-shadow-b: rgba(220, 160, 100, 0.1);

          --text-main: #2f2420;
          --text-card: #2a2520;
          --text-body: #453b32;
          --text-note: #4a4540;
          --accent: #d69f5a;

          --img-contrast: 1.25;
          --img-saturation: 1.30;
          --img-brightness: 1.25;
          --img-hue: -3deg;

          --bokeh-a: rgba(255, 245, 225, 0.45);
          --bokeh-b: rgba(255, 240, 215, 0.35);
          --bokeh-c: rgba(255, 250, 235, 0.3);

          --glow-core: rgba(255, 210, 140, 0.95);
          --glow-mid: rgba(255, 200, 130, 0.65);
          --glow-far: rgba(255, 190, 120, 0.35);

          --frame-radius: 24px;
          --card-radius: 18px;
        }

        /* Variante par scope (ex: photo peut être plus neutre) */
        .showcase-wrapper.scope-photo {
          --bg-grad-1: #f4f5f7;
          --bg-grad-2: #eef1f5;
          --bg-grad-3: #f6f7f9;

          --ambient-a: rgba(190, 210, 255, 0.45);
          --ambient-b: rgba(210, 225, 255, 0.35);
          --ambient-c: rgba(220, 235, 255, 0.28);
          --ambient-d: rgba(200, 220, 255, 0.25);
          --ambient-e: rgba(245, 250, 255, 0.4);

          --panel-bg: rgba(255, 255, 255, 0.88);
          --panel-border: rgba(220, 230, 245, 0.6);
          --panel-shadow-a: rgba(50, 70, 110, 0.12);
          --panel-shadow-b: rgba(40, 60, 100, 0.08);

          --text-main: #1f2430;
          --text-card: #1f2530;
          --text-body: #2f3440;
          --text-note: #3a3f4a;
          --accent: #6b8de3; /* coche/accents */

          --bokeh-a: rgba(255, 255, 255, 0.5);
          --bokeh-b: rgba(255, 255, 255, 0.38);
          --bokeh-c: rgba(255, 255, 255, 0.30);

          --glow-core: rgba(150, 180, 255, 0.9);
          --glow-mid: rgba(150, 180, 255, 0.55);
          --glow-far: rgba(150, 180, 255, 0.25);

          --img-contrast: 1.22;
          --img-saturation: 1.18;
          --img-brightness: 1.18;
          --img-hue: 0deg;
        }

        /* ---------- BACKDROP ---------- */
        .showcase-wrapper {
          padding: 40px 16px;
          background: linear-gradient(165deg, var(--bg-grad-1) 0%, var(--bg-grad-2) 50%, var(--bg-grad-3) 100%);
          position: relative;
          overflow: hidden;
        }
        .ambient {
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 850px 380px at 10% 28%, var(--ambient-a), transparent 62%),
            radial-gradient(ellipse 780px 350px at 90% 42%, var(--ambient-b), transparent 62%),
            radial-gradient(ellipse 650px 300px at 50% 85%, var(--ambient-c), transparent 65%),
            radial-gradient(circle 250px at 25% 65%, var(--ambient-d), transparent 70%),
            radial-gradient(circle 200px at 72% 18%, var(--ambient-e), transparent 65%);
          filter: blur(80px);
          opacity: 0.95;
          animation: breathe-ambient 12s ease-in-out infinite alternate;
        }
        @keyframes breathe-ambient {
          0% { opacity: 0.88; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.05); }
        }

        /* ---------- CADRE ---------- */
        .frame {
          position: relative; z-index: 1;
          max-width: 1120px; margin: 0 auto;
          border-radius: var(--frame-radius); padding: 24px 28px 28px;
          background: var(--panel-bg);
          backdrop-filter: blur(10px) saturate(160%);
          box-shadow:
            0 22px 60px var(--panel-shadow-a),
            0 10px 28px var(--panel-shadow-b),
            inset 0 1px 0 rgba(255, 255, 255, 0.7);
          border: 1px solid var(--panel-border);
        }

        /* ---------- TITRES ---------- */
        .titles-row {
          display: grid;
          grid-template-columns: 1fr 0.95fr;
          align-items: baseline;
          column-gap: 22px;
          margin-bottom: 14px;
        }
        .main-title {
          font-family: 'Georgia', serif;
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 500; color: var(--text-main);
          line-height: 1.15; margin: 0;
          text-shadow: 0 1px 10px rgba(255, 240, 220, 0.35);
        }
        .card-title {
          font-size: clamp(20px, 2.6vw, 24px);
          font-weight: 650; color: var(--text-card);
          line-height: 1.2; margin: 0;
          display: inline-flex; gap: 10px; align-items: baseline;
        }
        .accent { font-size: 22px; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.15)); }

        /* ---------- CONTENUS ---------- */
        .content-row {
          display: grid;
          grid-template-columns: 1fr 0.95fr;
          column-gap: 22px; align-items: start;
        }
        .left-col .description {
          font-size: clamp(13.5px, 1.55vw, 15px);
          line-height: 1.6; color: var(--text-body);
          margin: 0 0 14px 0;
        }
        .left-col .description strong { font-weight: 600; }

        /* ==== IMAGE PRINCIPALE - EFFET 3D ==== */
        .product-image {
          margin: 0; position: relative;
          border-radius: 18px; overflow: hidden;
          min-height: 580px;
          box-shadow:
            0 25px 70px rgba(0,0,0,0.08),
            0 12px 35px rgba(0,0,0,0.06),
            inset 0 0 80px rgba(255, 240, 220, 0.12);
          isolation: isolate;
          transform: perspective(1200px) rotateY(-5deg) rotateX(2deg);
          transform-style: preserve-3d;
          transition: transform 0.4s ease;
        }
        .product-image:hover {
          transform: perspective(1200px) rotateY(-2deg) rotateX(1deg) scale(1.02);
        }
        .product-image img {
          width: 100%; height: 100%; display: block; object-fit: cover;
          object-position: center center;
          filter: contrast(var(--img-contrast)) saturate(var(--img-saturation)) brightness(var(--img-brightness)) hue-rotate(var(--img-hue)) drop-shadow(0 4px 12px rgba(0,0,0,0.15));
          transform: translateZ(0);
        }
        .img-gradient {
          position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(135deg,
            rgba(255, 240, 220, 0.08) 0%,
            rgba(255, 235, 215, 0.04) 50%,
            rgba(255, 230, 210, 0.05) 100%);
          mix-blend-mode: overlay;
          z-index: 2;
        }
        .img-vignette {
          position: absolute; inset: -8%;
          pointer-events: none; z-index: 3;
          background:
            radial-gradient(ellipse at 50% 50%,
              rgba(0,0,0,0) 70%,
              rgba(0,0,0,0.03) 88%,
              rgba(0,0,0,0.06) 100%);
        }
        .img-bokeh {
          position: absolute; inset: 0; z-index: 4; pointer-events: none;
          background:
            radial-gradient(220px 220px at 72% 28%, var(--bokeh-a), transparent 72%),
            radial-gradient(280px 280px at 82% 48%, var(--bokeh-b), transparent 74%),
            radial-gradient(180px 180px at 18% 72%, var(--bokeh-c), transparent 68%);
          filter: blur(14px);
          opacity: 0.9;
          mix-blend-mode: screen;
        }
        .product-image::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 5;
          pointer-events: none;
          background: radial-gradient(circle at 50% 40%,
            rgba(255, 250, 240, 0.15),
            transparent 72%);
          mix-blend-mode: overlay;
        }

        /* ==== CARTE CONSEILS ==== */
        .advice-card {
          background: var(--panel-bg);
          backdrop-filter: blur(14px) saturate(180%);
          border: 1px solid var(--panel-border);
          border-radius: var(--card-radius);
          padding: 20px 22px 18px;
          box-shadow:
            0 20px 50px var(--panel-shadow-a),
            0 10px 25px var(--panel-shadow-b),
            inset 0 1px 0 rgba(255, 255, 255, 0.6);
          position: relative;
          transform: perspective(1200px) rotateY(3deg) rotateX(-1deg);
          transform-style: preserve-3d;
          transition: transform 0.4s ease;
        }
        .advice-card:hover {
          transform: perspective(1200px) rotateY(1deg) rotateX(-0.5deg) translateZ(10px);
        }

        /* Slot par défaut pour listes/contenus */
        .slot :global(.advice-list) {
          list-style: none; padding: 0; margin: 0 0 12px 0;
          display: flex; flex-direction: column; gap: 10px;
        }
        .slot :global(.advice-list li) {
          display: flex; gap: 10px;
          font-size: clamp(13px, 1.5vw, 14px);
          line-height: 1.55; color: var(--text-body);
        }
        .slot :global(.checkmark) {
          color: var(--accent); font-weight: 800; font-size: 16px; flex-shrink: 0; margin-top: 1px;
          text-shadow: 0 1px 3px rgba(0,0,0,0.18);
        }
        .slot :global(.bottom-note) {
          font-size: clamp(12.5px, 1.35vw, 13.5px);
          line-height: 1.6; color: var(--text-note);
          margin: 6px 0 8px; font-style: italic;
        }

        /* ==== PRODUIT ==== */
        .card-product {
          position: relative;
          display: inline-flex;
          justify-content: flex-end;
          margin-top: 12px;
        }
        .card-product-img {
          width: 260px; height: auto; display: block; z-index: 2; position: relative;
          filter: contrast(1.28) saturate(1.35) brightness(1.28) drop-shadow(0 12px 24px rgba(0,0,0,0.20));
        }
        .product-glow {
          position: absolute; right: 10px; bottom: 2px; z-index: 1; pointer-events: none;
          width: 300px; height: 300px; border-radius: 50%;
          background: radial-gradient(circle at 50% 50%,
            var(--glow-core) 0%,
            var(--glow-mid) 28%,
            var(--glow-far) 48%,
            rgba(255, 200, 130, 0.00) 68%);
          filter: blur(26px);
          animation: pulse-glow 4s ease-in-out infinite alternate;
        }
        @keyframes pulse-glow {
          0% { opacity: 0.95; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.12); }
        }
        .product-plinth {
          position: absolute; right: 38px; bottom: -4px; z-index: 0; pointer-events: none;
          width: 160px; height: 24px; border-radius: 50%;
          background: radial-gradient(ellipse at 50% 50%,
            rgba(0,0,0,0.30) 0%,
            rgba(0,0,0,0.15) 50%,
            rgba(0,0,0,0.05) 70%,
            rgba(0,0,0,0) 80%);
          filter: blur(8px);
        }
        .card-product::before {
          content: '';
          position: absolute;
          right: 20px;
          top: 10px;
          width: 180px;
          height: 90px;
          background: radial-gradient(ellipse at 50% 30%,
            rgba(255, 245, 235, 0.20),
            transparent 65%);
          z-index: 3;
          pointer-events: none;
          border-radius: 50%;
          filter: blur(8px);
        }

        /* ---------- RESPONSIVE ---------- */
        @media (max-width: 1024px) {
          .frame { max-width: 980px; padding: 22px; }
          .titles-row, .content-row { grid-template-columns: 1fr; row-gap: 8px; }
          .product-image { min-height: 480px; }
          .card-product-img { width: 240px; }
        }
        @media (max-width: 768px) {
          .frame { padding: 18px; }
          .product-image { min-height: 380px; }
          .card-product-img { width: 220px; }
        }
      `}</style>
    </section>
  );
}
``