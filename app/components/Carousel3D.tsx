"use client";

type Carousel3DCssProps = {
  images: string[];      // 1..5
  height?: number;       // px
  width?: number;        // px
  gap?: number;          // influence le rayon
  speed?: number;        // secondes par tour (ex: 12)
  perspective?: number;  // px
  dropShadow?: boolean;
  pauseOnHover?: boolean;
};

export default function Carousel3DCss({
  images,
  height = 300,
  width = 220,
  gap = 60,
  speed = 12,
  perspective = 1200,
  dropShadow = true,
  pauseOnHover = true,
}: Carousel3DCssProps) {
  // On force max 5, on enlève les falsy
  const imgs = images.slice(0, 5).filter(Boolean);
  const count = Math.max(1, imgs.length);
  const step = 360 / count;

  // Rayon suffisamment grand pour éviter que les images se chevauchent
  const radius = Math.max(240, width + gap * 2);

  if (imgs.length === 0) {
    // Sécurité – évite un rendu "vide" silencieux
    return (
      <div className="w-full text-center text-sm text-neutral-500">
        Aucune image à afficher dans le carrousel.
      </div>
    );
  }

  return (
    <div
      className="w-full flex items-center justify-center"
      style={{ perspective: `${perspective}px` }}
    >
      <div
        className={pauseOnHover ? "relative select-none group" : "relative select-none"}
        style={{
          width: `${width + radius * 0.6}px`,
          height: `${height + 40}px`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Plateau qui tourne en CSS */}
        <div
          className="absolute inset-0 mx-auto"
          style={{
            transformStyle: "preserve-3d",
            animation: `spin ${speed}s linear infinite`,
            // Pause au hover (si demandé)
            animationPlayState: pauseOnHover ? ("var(--play, running)" as any) : "running",
          }}
        >
          {imgs.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="absolute left-1/2 top-1/2"
              style={{
                transformStyle: "preserve-3d",
                transform: `
                  rotateY(${i * step}deg)
                  translateZ(${radius}px)
                  translateX(-50%) translateY(-50%)
                `,
                willChange: "transform",
                backfaceVisibility: "hidden",
              }}
            >
              <img
                src={src}
                alt={`slide-${i + 1}`}
                draggable={false}
                style={{
                  width,
                  height,
                  objectFit: "contain",
                  filter: dropShadow ? "drop-shadow(0 25px 50px rgba(0,0,0,0.30))" : "none",
                }}
                onError={(e) => {
                  // si l'URL est cassée, on grise visuellement pour le voir
                  (e.currentTarget as HTMLImageElement).style.opacity = "0.2";
                }}
              />
            </div>
          ))}
        </div>

        {/* Ombre au sol (optionnelle) */}
        {dropShadow && (
          <div
            aria-hidden
            className="absolute left-1/2 bottom-0 -translate-x-1/2 blur-2xl rounded-full pointer-events-none"
            style={{
              width: radius * 1.3,
              height: 22,
              background:
                "radial-gradient(closest-side, rgba(0,0,0,0.22), rgba(0,0,0,0))",
            }}
          />
        )}

        {/* Zone hover pour pause */}
        {pauseOnHover && (
          <div
            className="absolute inset-0"
            onMouseEnter={(e) => (e.currentTarget.parentElement!.style.setProperty("--play", "paused"))}
            onMouseLeave={(e) => (e.currentTarget.parentElement!.style.setProperty("--play", "running"))}
          />
        )}
      </div>

      {/* Keyframes CSS dans un style inline */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotateY(0deg); }
          to   { transform: rotateY(360deg); }
        }
      `}</style>
    </div>
  );
}