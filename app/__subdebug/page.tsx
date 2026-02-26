"use client";

import { useEffect } from "react";

/**
 * PAGE DE DEBUG — doit afficher 5 images.
 * Si tu ne vois qu’une seule image ici, ce n’est PAS un problème de code,
 * c’est le mauvais fichier/route ou un cache de build navigateur/Next.
 */
const HERO_IMAGES = [
  "/image/nukuBleu.png",
  "/image/nukuJaune.png",
  "/image/nukuRouge.png",
  "/image/nukuVert.png",
  "/image/nukuViolet.png",
];

export default function SubDebugPage() {
  useEffect(() => {
    console.log(">>> __SUBDEBUG mounted. Pathname =", typeof window !== "undefined" ? window.location.pathname : "(ssr)");
    console.log(">>> HERO_IMAGES =", HERO_IMAGES);
  }, []);

  return (
    <main className="min-h-screen pt-20 px-6 bg-gradient-to-b from-[#f5f0ec] to-[#ebe6e0]">
      {/* BADGE VISUEL pour confirmer qu’on est sur la bonne page */}
      <div className="fixed bottom-4 right-4 z-[9999] rounded-full bg-neutral-900 text-white text-xs px-3 py-1 shadow-lg">
        __SUBDEBUG v101
      </div>

      <h1 className="text-3xl font-bold text-neutral-800 mb-6">Debug abonnement – 5 images attendues</h1>
      <p className="text-neutral-600 mb-10">
        Si tu vois moins de 5 images ci‑dessous, c’est que <b>ce fichier n’est pas celui rendu</b> ou que
        le navigateur/Next garde un <b>cache</b>. Essaye un hard‑refresh (Ctrl/Cmd+Shift+R) et redémarre
        le serveur après avoir supprimé <code>.next</code>.
      </p>

      <div className="flex flex-wrap items-center gap-8">
        {HERO_IMAGES.map((src, i) => (
          <div key={i} className="flex flex-col items-center">
            <img
              src={src}
              alt={`Pot ${i + 1}`}
              className="h-[160px] w-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.2)] bg-white/40 rounded-xl p-4"
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.opacity = "0.3")}
            />
            <span className="text-xs text-neutral-500 mt-2">{src}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
