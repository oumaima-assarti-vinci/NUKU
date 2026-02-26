"use client";

type Carousel3DCssProps = {
  images: string[];      // jusqu'à 5 images
  height?: number;       // px
  width?: number;        // px
  gap?: number;          // influence le rayon
  speed?: number;        // secondes par tour (ex: 12 = ~douce)
  perspective?: number;  // px
  dropShadow?: boolean;  // ombre sous le pot
};

export default function Carousel3DCss({
  images,
  height = 300,
  width = 220,
  gap = 60,
  speed = 12,
  perspective = 1200,
  dropShadow = true,
}: Carousel3DCssProps) {
  const imgs = images.slice(0, 5).filter(Boolean);
  const count = Math.max(1, imgs.length);
  const step = 360 / count;

  const radius = Math.max(240, width + gap * 2);

  return (
    <div
      className="w-full flex items-center justify-center"
      style={{ perspective: `${perspective}px` }}
    >
      <div
        className="relative select-none"
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
          }}
        >
          {imgs.map((src, i) => (
            <div
              key={i}
              className="absolute left-1/2 top-1/2"
              style={{
                transformStyle: "preserve-3d",
                transform: `
                  rotateY(${i * step}deg)
                  translateZ(${radius}px)
                  translateX(-50%) translateY(-50%)
                `,
              }}
            >
              {/* 👉 Image seule, SANS background/carte */}
              <img
                src={src}
                alt={`slide-${i + 1}`}
                draggable={false}
                style={{
                  width,
                  height,
                  objectFit: "contain",
                  filter: dropShadow
                    ? "drop-shadow(0 25px 50px rgba(0,0,0,0.30))"
                    : "none",
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
      </div>

      {/* Keyframes CSS */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotateY(0deg); }
          to   { transform: rotateY(360deg); }
        }
      `}</style>
    </div>
  );
}