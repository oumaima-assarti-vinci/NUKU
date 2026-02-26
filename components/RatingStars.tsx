
"use client";

type Props = {
  value: number;                  // 0..5 (peut être décimal pour affichage)
  onChange?: (v: number) => void; // si présent => input cliquable
  size?: number;
  readonly?: boolean;
};

export default function RatingStars({ value, onChange, size = 18, readonly }: Props) {
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.5;

  return (
    <div className="inline-flex items-center gap-1" aria-label={`${value} sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const n = i + 1;
        const isFull = n <= full;
        const isHalf = !isFull && hasHalf && n === full + 1;
        const handle = () => onChange && !readonly && onChange(n);

        return (
          <button
            key={n}
            type="button"
            onClick={handle}
            className={onChange && !readonly ? "cursor-pointer" : "cursor-default"}
            aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
            title={`${n} étoile${n > 1 ? "s" : ""}`}
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              className={(isFull || isHalf) ? "text-yellow-400" : "text-neutral-300"}
              fill="currentColor"
            >
              {isHalf ? (
                <defs>
                  <linearGradient id={`half-${n}`}>
                    <stop offset="50%" stopColor="currentColor" />
                    <stop offset="50%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              ) : null}
              <path
                fill={isHalf ? `url(#half-${n})` : "currentColor"}
                d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.401 8.168L12 18.896 4.665 23.165l1.401-8.168L.132 9.21l8.2-1.192z"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
