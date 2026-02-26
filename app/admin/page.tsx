
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

/** ─────────────────────────
 *  TYPES
 *  ───────────────────────── */
type Product = {
  id: number;
  nom: string;
  prix: number;
  original_price?: number | null;
  discount_percentage?: number | null;
  description?: string | null;
  category?: string | null;
  images?: string[] | null;
  ingredients?: string[] | null;
  benefits?: string[] | null;
  usage_instructions?: string | null;
  created_at?: string;
};

type OrderRow = {
  id: number;
  user_id: string;
  total: number;
  status: "pending" | "completed" | "cancelled" | string;
  created_at: string;
};

type ContactMsg = {
  id: string;
  name: string | null;
  email: string | null;
  comment: string;
  read: boolean;
  created_at: string;
  product_id: number | null; // 👈 important pour relier au produit
};

/** ─────────────────────────
 *  PAGE ADMIN
 *  ───────────────────────── */
export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [messages, setMessages] = useState<ContactMsg[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"products" | "orders" | "messages">(
    "products"
  );

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [msgSearch, setMsgSearch] = useState("");
  const [onlyUnread, setOnlyUnread] = useState(false);

  const router = useRouter();

  useEffect(() => {
    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    // Vérifie si admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (roleData?.role !== "admin") {
      router.push("/home");
      return;
    }

    setUser(user);
    await Promise.all([loadProducts(), loadOrders(), loadMessages()]);
    setLoading(false);
  }

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });
    if (error) {
      console.error(error);
      setProducts([]);
    } else {
      setProducts((data ?? []) as Product[]);
    }
  }

  async function loadOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      setOrders([]);
    } else {
      setOrders((data ?? []) as OrderRow[]);
    }
  }

  async function loadMessages() {
    setMessagesLoading(true);
    const { data, error } = await supabase
      .from("contacts")
      .select("id,name,email,comment,read,created_at,product_id")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      setMessages([]);
    } else {
      setMessages((data ?? []) as ContactMsg[]);
    }
    setMessagesLoading(false);
  }

  async function markMessage(id: string, read: boolean) {
    const { error } = await supabase.from("contacts").update({ read }).eq("id", id);
    if (error) {
      alert("Impossible de mettre à jour : " + error.message);
      return;
    }
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read } : m)));
  }

  async function deleteMessage(id: string) {
    if (!confirm("Supprimer ce message ?")) return;
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) {
      alert("Suppression impossible : " + error.message);
      return;
    }
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/home");
  }

  async function handleDeleteProduct(id: number) {
    if (!confirm("Supprimer ce produit définitivement ?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      alert("Erreur : " + error.message);
      return;
    }
    alert("Produit supprimé !");
    loadProducts();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="text-white text-2xl font-bold">Chargement du dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Admin */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black">🔐 ADMIN DASHBOARD</h1>
              <p className="text-purple-100 text-sm mt-1">
                Gérez vos produits, commandes et messages
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right mr-4">
                <p className="text-sm text-purple-100">Connecté en tant que</p>
                <p className="font-semibold">{user?.email}</p>
              </div>
              <Link
                href="/home"
                className="px-6 py-3 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition font-semibold"
              >
                Voir le site
              </Link>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition font-semibold"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Onglets */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("products")}
              className={`px-6 py-4 font-bold border-b-4 transition ${
                activeTab === "products"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              📦 Produits ({products.length})
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-6 py-4 font-bold border-b-4 transition ${
                activeTab === "orders"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              🛒 Commandes ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab("messages")}
              className={`px-6 py-4 font-bold border-b-4 transition ${
                activeTab === "messages"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              📥 Messages (
              {messages.filter((m) => !m.read).length} non lus / {messages.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* TAB PRODUITS */}
        {activeTab === "products" && (
          <>
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h2 className="text-4xl font-black mb-2">Gestion des produits</h2>
                <p className="text-gray-600">
                  Ajoutez, modifiez ou supprimez vos produits
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black rounded-2xl hover:from-green-600 hover:to-emerald-600 transition shadow-xl text-lg"
              >
                + AJOUTER UN PRODUIT
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition group"
                >
                  <div className="relative overflow-hidden rounded-2xl mb-4">
                    <img
                      src={
                        product.images?.[0] ||
                        "https://images.unsplash.com/photo-1556228852-80c63843f03c?w=400&h=400&fit=crop"
                      }
                      className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500"
                      alt={product.nom}
                    />
                    {product.discount_percentage && product.discount_percentage > 0 && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-black text-sm shadow-lg">
                        -{product.discount_percentage}%
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <h3 className="text-2xl font-black mb-2">{product.nom}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-3xl font-black text-purple-600">
                        {product.prix}€
                      </span>
                      {product.original_price &&
                        product.original_price > product.prix && (
                          <span className="text-lg text-gray-400 line-through">
                            {product.original_price}€
                          </span>
                        )}
                    </div>

                    {product.category && (
                      <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full">
                        {product.category}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition shadow-lg"
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition shadow-lg"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>
              ))}

              {products.length === 0 && (
                <div className="col-span-3 text-center py-20">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-2xl font-bold text-gray-400 mb-2">Aucun produit</h3>
                  <p className="text-gray-500">
                    Cliquez sur &quot;Ajouter un produit&quot; pour commencer
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB COMMANDES */}
        {activeTab === "orders" && (
          <>
            <h2 className="text-4xl font-black mb-8">Commandes récentes</h2>

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-black">ID</th>
                    <th className="px-6 py-4 text-left font-black">Client</th>
                    <th className="px-6 py-4 text-left font-black">Montant</th>
                    <th className="px-6 py-4 text-left font-black">Statut</th>
                    <th className="px-6 py-4 text-left font-black">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, i) => (
                    <tr
                      key={order.id}
                      className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="px-6 py-4 font-mono text-sm">#{order.id}</td>
                      <td className="px-6 py-4 font-semibold">{order.user_id}</td>
                      <td className="px-6 py-4 font-black text-lg">{order.total}€</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-4 py-2 rounded-full font-bold text-sm ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(order.created_at).toLocaleDateString("fr-FR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {orders.length === 0 && (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🛒</div>
                  <h3 className="text-2xl font-bold text-gray-400 mb-2">
                    Aucune commande
                  </h3>
                  <p className="text-gray-500">Les commandes apparaîtront ici</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB MESSAGES */}
        {activeTab === "messages" && (
          <>
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h2 className="text-4xl font-black mb-2">Messages &quot;Contact us&quot;</h2>
                <p className="text-gray-600">
                  Gérez les messages reçus via le formulaire de contact (liés ou non à un
                  produit)
                </p>
              </div>
              <button
                onClick={loadMessages}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black rounded-2xl hover:from-purple-600 hover:to-pink-600 transition shadow-xl"
              >
                🔄 Recharger
              </button>
            </div>

            <div className="mb-6 flex flex-wrap gap-4 items-center">
              <input
                value={msgSearch}
                onChange={(e) => setMsgSearch(e.target.value)}
                placeholder="Rechercher (nom, email, message)"
                className="flex-1 min-w-[220px] border-2 border-gray-300 rounded-xl px-6 py-3 focus:ring-4 focus:ring-purple-300 focus:border-purple-600"
              />
              <label className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 rounded-xl hover:border-purple-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyUnread}
                  onChange={(e) => setOnlyUnread(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="font-semibold">Seulement non lus</span>
              </label>
            </div>

            {messagesLoading ? (
              <div className="bg-white rounded-3xl shadow-xl p-20 text-center">
                <div className="text-6xl mb-4">⏳</div>
                <p className="text-2xl font-bold text-gray-400">
                  Chargement des messages...
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-xl p-20 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-2xl font-bold text-gray-400 mb-2">
                  Aucun message reçu
                </h3>
                <p className="text-gray-500">Les messages apparaîtront ici</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-black">Date</th>
                      <th className="px-6 py-4 text-left font-black">Nom</th>
                      <th className="px-6 py-4 text-left font-black">Email</th>
                      <th className="px-6 py-4 text-left font-black">Message</th>
                      <th className="px-6 py-4 text-left font-black">Produit</th>
                      <th className="px-6 py-4 text-left font-black">Statut</th>
                      <th className="px-6 py-4 text-right font-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages
                      .filter((m) => {
                        const term = msgSearch.trim().toLowerCase();
                        if (onlyUnread && m.read) return false;
                        if (!term) return true;
                        return (
                          (m.name || "").toLowerCase().includes(term) ||
                          (m.email || "").toLowerCase().includes(term) ||
                          m.comment.toLowerCase().includes(term)
                        );
                      })
                      .map((m, i) => (
                        <tr
                          key={m.id}
                          className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
                        >
                          <td className="px-6 py-4 text-gray-600 font-mono text-sm">
                            {new Date(m.created_at).toLocaleString("fr-FR")}
                          </td>
                          <td className="px-6 py-4 font-bold">{m.name || "—"}</td>
                          <td className="px-6 py-4">
                            {m.email ? (
                              <a
                                href={`mailto:${m.email}`}
                                className="text-blue-600 hover:text-blue-800 underline font-semibold"
                              >
                                {m.email}
                              </a>
                            ) : (
                              <span className="text-neutral-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 max-w-[420px]">
                            <div className="whitespace-pre-wrap text-gray-700">
                              {m.comment}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {m.product_id ? (
                              <Link
                                href={`/product/${m.product_id}`}
                                className="text-blue-600 hover:underline font-semibold"
                              >
                                #{m.product_id}
                              </Link>
                            ) : (
                              <span className="text-neutral-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {m.read ? (
                              <span className="px-4 py-2 rounded-full font-bold text-sm bg-green-100 text-green-800">
                                ✅ Lu
                              </span>
                            ) : (
                              <span className="px-4 py-2 rounded-full font-bold text-sm bg-yellow-100 text-yellow-800">
                                ⚠️ Non lu
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            {m.read ? (
                              <button
                                onClick={() => markMessage(m.id, false)}
                                className="px-4 py-2 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600 transition shadow-lg"
                              >
                                Marquer non lu
                              </button>
                            ) : (
                              <button
                                onClick={() => markMessage(m.id, true)}
                                className="px-4 py-2 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition shadow-lg"
                              >
                                Marquer lu
                              </button>
                            )}
                            <button
                              onClick={() => deleteMessage(m.id)}
                              className="px-4 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition shadow-lg"
                            >
                              🗑️ Supprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Ajouter/Modifier Produit */}
      {(showAddModal || editingProduct) && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setShowAddModal(false);
            setEditingProduct(null);
            loadProducts();
          }}
        />
      )}
    </div>
  );
}

/** ─────────────────────────
 *  ProductModal (upload storage + CRUD)
 *  ───────────────────────── */
function ProductModal({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    nom: product?.nom ?? "",
    prix: String(product?.prix ?? ""),
    original_price: product?.original_price ? String(product.original_price) : "",
    description: product?.description ?? "",
    category: product?.category ?? "energie",
    discount_percentage: String(product?.discount_percentage ?? 0),
    images: (product?.images ?? []) as string[],
    ingredients: (product?.ingredients ?? []) as string[],
    benefits: (product?.benefits ?? []) as string[],
    usage_instructions: product?.usage_instructions ?? "",
  });

  const [newIngredient, setNewIngredient] = useState("");
  const [newBenefit, setNewBenefit] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  async function uploadImageToSupabase(file: File): Promise<string | null> {
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;
    const path = `products/${fileName}`;

    const { error } = await supabase.storage.from("products").upload(path, file);
    if (error) {
      alert("❌ Erreur upload image : " + error.message);
      return null;
    }
    const { data } = supabase.storage.from("products").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("❌ Image trop grande (max 5MB)");
      return;
    }
    setUploadingImage(true);
    const url = await uploadImageToSupabase(file);
    setUploadingImage(false);
    if (!url) return;

    setFormData((prev) => ({ ...prev, images: [...prev.images, url] }));
    e.currentTarget.value = "";
  }

  function handleRemoveImage(idx: number) {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  }

  async function handleSave() {
    if (!formData.nom || !formData.prix) {
      alert("⚠️ Le nom et le prix sont obligatoires !");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        nom: formData.nom,
        prix: Number(formData.prix),
        original_price: formData.original_price
          ? Number(formData.original_price)
          : null,
        discount_percentage: Number(formData.discount_percentage) || 0,
        images: [...formData.images],
        ingredients: [...formData.ingredients],
        benefits: [...formData.benefits],
        usage_instructions: formData.usage_instructions,
        description: formData.description,
        category: formData.category,
      };

      let result;
      if (product) {
        result = await supabase
          .from("products")
          .update(payload)
          .eq("id", product.id)
          .select();
      } else {
        result = await supabase.from("products").insert([payload]).select();
      }

      if (result.error) {
        alert("❌ Erreur : " + result.error.message);
        setSaving(false);
        return;
      }
      alert(product ? "✅ Produit modifié" : "✅ Produit ajouté");
      onClose();
    } catch (e: any) {
      alert("❌ Erreur critique : " + e.message);
    }
    setSaving(false);
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 overflow-y-auto backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="min-h-screen flex items-center justify-center p-6">
        <div
          className="bg-white rounded-3xl max-w-5xl w-full p-10 max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {product ? "✏️ Modifier le produit" : "➕ Ajouter un produit"}
            </h2>
            <button
              onClick={onClose}
              className="text-3xl hover:text-red-600 transition"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* Nom */}
            <div>
              <label className="block font-bold mb-2 text-lg">Nom du produit *</label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, nom: e.target.value }))
                }
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-600 text-lg font-semibold"
                placeholder="Ex: Energy Boost"
              />
            </div>

            {/* Prix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block font-bold mb-2 text-lg">
                  Prix actuel (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.prix}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, prix: e.target.value }))
                  }
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-600 text-lg font-bold"
                  placeholder="29.99"
                />
              </div>
              <div>
                <label className="block font-bold mb-2 text-lg">Prix original (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.original_price}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, original_price: e.target.value }))
                  }
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-600 text-lg font-bold"
                  placeholder="39.99"
                />
              </div>
              <div>
                <label className="block font-bold mb-2 text-lg">Réduction (%)</label>
                <input
                  type="number"
                  value={formData.discount_percentage}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      discount_percentage: e.target.value,
                    }))
                  }
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-600 text-lg font-bold"
                  placeholder="20"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-bold mb-2 text-lg">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, description: e.target.value }))
                }
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-300 text-lg"
                rows={4}
                placeholder="Décrivez votre produit..."
              />
            </div>

            {/* Catégorie */}
            <div>
              <label className="block font-bold mb-2 text-lg">Catégorie</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, category: e.target.value }))
                }
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-300 text-lg font-semibold"
              >
                <option value="energie">⚡ Énergie</option>
                <option value="sommeil">😴 Sommeil</option>
                <option value="immunite">🛡️ Immunité</option>
                <option value="focus">🧠 Focus</option>
                <option value="stress">🧘 Stress</option>
              </select>
            </div>

            {/* Images */}
            <div>
              <label className="block font-bold mb-2 text-lg">
                Images (max 8) 📸
              </label>

              {/* Galerie */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {formData.images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={img}
                      alt={`Image ${i + 1}`}
                      className="w-full aspect-square object-cover rounded-xl border-4 border-purple-200"
                    />
                    <button
                      onClick={() => handleRemoveImage(i)}
                      className="absolute -top-3 -right-3 w-10 h-10 bg-red-500 text-white rounded-full text-lg font-bold hover:bg-red-600 transition shadow-lg opacity-0 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Upload */}
              {formData.images.length < 8 && (
                <div>
                  <label className="cursor-pointer">
                    <div className="w-full p-8 border-2 border-dashed border-purple-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition text-center">
                      {uploadingImage ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500" />
                          <span className="text-purple-600 font-bold text-lg">
                            Upload en cours...
                          </span>
                        </div>
                      ) : (
                        <div>
                          <div className="text-5xl mb-3">📷</div>
                          <p className="text-gray-700 font-bold text-lg mb-1">
                            Cliquez pour ajouter une image
                          </p>
                          <p className="text-sm text-gray-500">
                            Max 5MB • JPG, PNG, WEBP
                          </p>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
              )}

              {formData.images.length === 8 && (
                <p className="text-sm text-gray-500 italic text-center">
                  ✅ Nombre maximum d'images atteint
                </p>
              )}
            </div>

            {/* Ingrédients */}
            <div>
              <label className="block font-bold mb-2 text-lg">Ingrédients</label>
              <div className="space-y-2 mb-4">
                {formData.ingredients.map((ing, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="flex-1 px-6 py-3 bg-green-50 border-2 border-green-200 rounded-xl font-semibold">
                      {ing}
                    </span>
                    <button
                      onClick={() =>
                        setFormData((p) => ({
                          ...p,
                          ingredients: p.ingredients.filter((_, idx) => idx !== i),
                        }))
                      }
                      className="px-4 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  placeholder="Ex: Guarana 500mg"
                  className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-300 text-lg"
                />
                <button
                  onClick={() => {
                    if (newIngredient.trim()) {
                      setFormData((p) => ({
                        ...p,
                        ingredients: [...p.ingredients, newIngredient.trim()],
                      }));
                      setNewIngredient("");
                    }
                  }}
                  className="px-8 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition text-lg"
                >
                  Ajouter
                </button>
              </div>
            </div>

            {/* Bénéfices */}
            <div>
              <label className="block font-bold mb-2 text-lg">Bénéfices</label>
              <div className="space-y-2 mb-4">
                {formData.benefits.map((ben, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="flex-1 px-6 py-3 bg-blue-50 border-2 border-blue-200 rounded-xl font-semibold">
                      {ben}
                    </span>
                    <button
                      onClick={() =>
                        setFormData((p) => ({
                          ...p,
                          benefits: p.benefits.filter((_, idx) => idx !== i),
                        }))
                      }
                      className="px-4 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  placeholder="Ex: Boost d'énergie naturel"
                  className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-300 text-lg"
                />
                <button
                  onClick={() => {
                    if (newBenefit.trim()) {
                      setFormData((p) => ({
                        ...p,
                        benefits: [...p.benefits, newBenefit.trim()],
                      }));
                      setNewBenefit("");
                    }
                  }}
                  className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition text-lg"
                >
                  Ajouter
                </button>
              </div>
            </div>

            {/* Conseils d'utilisation */}
            <div>
              <label className="block font-bold mb-2 text-lg">
                Conseil d'utilisation
              </label>
              <textarea
                value={formData.usage_instructions}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    usage_instructions: e.target.value,
                  }))
                }
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-300 text-lg"
                rows={3}
                placeholder="Ex: Prendre 2 gummies par jour le matin"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t-2">
              <button
                onClick={handleSave}
                disabled={
                  saving ||
                  uploadingImage ||
                  !formData.nom ||
                  String(formData.prix).trim() === ""
                }
                className="flex-1 py-5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black text-xl rounded-2xl hover:from-green-600 hover:to-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
              >
                {saving
                  ? "⏳ Enregistrement..."
                  : product
                  ? "✅ Sauvegarder"
                  : "➕ Créer le produit"}
              </button>
              <button
                onClick={onClose}
                disabled={saving}
                className="px-12 py-5 bg-gray-200 font-black text-xl rounded-2xl hover:bg-gray-300 transition disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
