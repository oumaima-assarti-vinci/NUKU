
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Question = {
  id: string;
  name: string | null;
  email: string | null;
  comment: string;
  created_at: string;
};

export default function ProductQuestions({ productId }: { productId: number }) {
  const [list, setList] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
    // Prefill email si connecté
    (async () => {
      const { data } = await supabase.auth.getUser();
      const u = data?.user;
      if (u?.email && !email) setEmail(u.email);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("contacts")
      .select("id,name,email,comment,created_at")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("load questions error", error);
      setList([]);
    } else {
      setList((data ?? []) as Question[]);
    }
    setLoading(false);
  }

  async function submitQuestion() {
    if (!comment.trim()) {
      alert("Écris ton message s’il te plaît 🙂");
      return;
    }
    if (!email.trim()) {
      alert("L’email est requis pour te répondre.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("contacts").insert({
      name: name || null,
      email,
      comment,
      read: false,
      product_id: productId,
    });
    setSubmitting(false);
    if (error) {
      console.error(error);
      alert("Impossible d’envoyer le message.");
      return;
    }
    setComment("");
    await load();
  }

  return (
    <section className="space-y-6">
      {/* Formulaire */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h3 className="font-bold text-lg mb-3">Poser une question sur ce produit</h3>

        <div className="grid md:grid-cols-2 gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom (optionnel)"
            className="h-11 px-3 rounded-lg border border-neutral-300"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (pour la réponse) *"
            className="h-11 px-3 rounded-lg border border-neutral-300"
            type="email"
          />
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Ta question…"
          rows={4}
          className="w-full mt-3 px-3 py-2 rounded-lg border border-neutral-300"
        />

        <div className="mt-3">
          <button
            onClick={submitQuestion}
            disabled={submitting}
            className="h-11 px-5 rounded-xl bg-neutral-900 text-white font-semibold hover:bg-orange-600 transition disabled:opacity-60"
          >
            {submitting ? "Envoi…" : "Envoyer la question"}
          </button>
        </div>
      </div>

      {/* Liste */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-neutral-600">Chargement des messages…</div>
        ) : list.length === 0 ? (
          <div className="text-neutral-600">Aucun message pour l’instant.</div>
        ) : (
          list.map((m) => (
            <article key={m.id} className="rounded-2xl border border-neutral-200 bg-white p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="font-semibold text-neutral-800">
                  {m.name || "Utilisateur"} ·{" "}
                  <span className="text-xs text-neutral-500">
                    {new Date(m.created_at).toLocaleString("fr-FR")}
                  </span>
                </div>
                {/* Tu peux ajouter ici un badge “Répondu” plus tard */}
              </div>
              <p className="mt-2 text-neutral-700 leading-relaxed whitespace-pre-wrap">
                {m.comment}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
