
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import RatingStars from "@/components/RatingStars";

type Review = {
  id: number;
  product_id: number;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
};

export default function ProductReviews({ productId }: { productId: number }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Tri et filtre
  const [sort, setSort] = useState<"recent" | "highest" | "lowest">("recent");
  const [filter, setFilter] = useState<number | null>(null);

  // Form
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id ?? null);
    })();
  }, []);

  async function load() {
    setLoading(true);
    let q = supabase.from("reviews").select("*").eq("product_id", productId);
    if (sort === "recent") q = q.order("created_at", { ascending: false });
    if (sort === "highest") q = q.order("rating", { ascending: false });
    if (sort === "lowest") q = q.order("rating", { ascending: true });

    const { data, error } = await q;
    if (error) {
      console.error(error);
      setReviews([]);
    } else {
      setReviews((data ?? []) as Review[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, sort]);

  const total = reviews.length;
  const avg = useMemo(
    () => (total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0),
    [reviews, total]
  );

  const hist = useMemo(() => {
    const c: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => (c[r.rating] = (c[r.rating] ?? 0) + 1));
    return c;
  }, [reviews]);

  const shown = useMemo(() => {
    if (!filter) return reviews;
    return reviews.filter((r) => r.rating === filter);
  }, [reviews, filter]);

  async function submitReview() {
    if (!userId) return alert("Connecte-toi pour écrire un avis.");
    if (!rating) return alert("Note requise.");

    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      user_id: userId,
      rating,
      title: title || null,
      body: body || null,
    });
    setSubmitting(false);

    if (error) {
      const msg = String(error.message || "");
      if (msg.includes("duplicate") || msg.includes("uniq_review_user_product")) {
        alert("Tu as déjà déposé un avis pour ce produit.");
      } else {
        alert("Impossible d'enregistrer l'avis.");
      }
      console.error(error);
      return;
    }

    setRating(5);
    setTitle("");
    setBody("");
    await load();
  }

  // Pagination simple (optionnelle)
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;
  const pageCount = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const visible = shown.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => setPage(1), [filter, sort, productId]);

  return (
    <div className="space-y-8">
      {/* Résumé + tri */}
      <div className="flex flex-col md:flex-row md:items-center gap-8">
        <div className="flex items-center gap-4">
          <div className="text-4xl font-black">{avg.toFixed(1)}</div>
          <div>
            <RatingStars value={avg} readonly />
            <div className="text-sm text-neutral-500">Basé sur {total} avis</div>
          </div>
        </div>

        <div className="flex-1">
          {[5, 4, 3, 2, 1].map((n) => {
            const count = hist[n] ?? 0;
            const pct = total ? (count / total) * 100 : 0;
            return (
              <div key={n} className="flex items-center gap-3 mb-2">
                <div className="w-5 text-sm font-semibold">{n}</div>
                <div className="h-3 flex-1 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="w-8 text-right text-sm text-neutral-600">{count}</div>
              </div>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-neutral-600">Trier</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="h-10 px-3 rounded-lg border border-neutral-300 bg-white text-sm"
          >
            <option value="recent">Les plus récents</option>
            <option value="highest">Note la plus haute</option>
            <option value="lowest">Note la plus basse</option>
          </select>
        </div>
      </div>

      {/* Filtres par note */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-semibold">Évaluation :</span>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setFilter((prev) => (prev === n ? null : n))}
            className={`h-9 px-3 rounded-full border text-sm ${
              filter === n
                ? "bg-neutral-900 text-white border-neutral-900"
                : "bg-white border-neutral-300 hover:bg-neutral-50"
            }`}
          >
            <RatingStars value={n} readonly size={14} />
          </button>
        ))}
        {filter && (
          <button
            onClick={() => setFilter(null)}
            className="text-sm text-neutral-600 underline ml-1"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Formulaire */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Écrire un avis</h3>
          {!userId && (
            <div className="text-sm text-neutral-500">Connecte-toi pour publier.</div>
          )}
        </div>

        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm">Votre note :</span>
          <RatingStars value={rating} onChange={setRating} />
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre (optionnel)"
          className="w-full h-11 px-3 rounded-lg border border-neutral-300 mb-3"
        />

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Votre avis…"
          rows={4}
          className="w-full px-3 py-2 rounded-lg border border-neutral-300"
        />

        <div className="mt-4">
          <button
            onClick={submitReview}
            disabled={submitting}
            className="h-11 px-5 rounded-xl bg-neutral-900 text-white font-semibold hover:bg-orange-600 transition disabled:opacity-60"
          >
            {submitting ? "Publication…" : "Publier l’avis"}
          </button>
        </div>
      </div>

      {/* Liste des avis */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-neutral-600">Chargement des avis…</div>
        ) : visible.length === 0 ? (
          <div className="text-neutral-600">Aucun avis pour l’instant.</div>
        ) : (
          visible.map((r) => (
            <article
              key={r.id}
              className="rounded-2xl border border-neutral-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-200 grid place-items-center font-bold text-neutral-700">
                    {r.user_id.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <RatingStars value={r.rating} readonly />
                      <span className="text-xs text-neutral-500">
                        {new Date(r.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <div className="text-sm text-neutral-800 font-semibold">
                      Acheteur vérifié
                    </div>
                  </div>
                </div>
              </div>

              {r.title ? <h4 className="mt-3 font-bold">{r.title}</h4> : null}
              {r.body ? (
                <p className="mt-2 text-neutral-700 leading-relaxed">{r.body}</p>
              ) : null}
            </article>
          ))
        )}
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: pageCount }).map((_, i) => {
            const n = i + 1;
            return (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`h-9 min-w-9 px-3 rounded-lg border text-sm font-semibold ${
                  n === page
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "bg-white border-neutral-300 hover:bg-neutral-50"
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
