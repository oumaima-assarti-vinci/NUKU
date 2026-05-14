"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export const PACK_CATEGORIES = [
  { id: 12, name: "Sommeil",           sub: "Mélatonine · L-théanine · Magnésium", img: "/image/nukuBleu.png",   prix: 18 },
  { id: 16, name: "Relax & équilibre", sub: "Ashwagandha · Rhodiola · Safran",     img: "/image/nukuViolet.png", prix: 18 },
  { id: 14, name: "Force & endurance", sub: "Créatine · Vitamine B12 · D3",        img: "/image/nukuRouge.png",  prix: 18 },
  { id: 11, name: "Cheveux & beauté",  sub: "Biotine · Zinc · MSM",                img: "/image/nukuJaune.png",  prix: 18 },
  { id: 13, name: "Digestion",         sub: "Matcha · Artichaut · Pissenlit",      img: "/image/nukuVert.png",   prix: 18 },
];

const getDiscount = (total: number): number => {
  if (total >= 5) return 20;
  if (total >= 3) return 15;
  if (total >= 2) return 5;
  return 0;
};

interface PackContextType {
  quantities: number[];
  changeQty: (i: number, delta: number) => void;
  totalItems: number;
  totalPrice: number;
  discount: number;
  discountedPrice: number;
}

const PackContext = createContext<PackContextType | null>(null);
const STORAGE_KEY = "nuku_pack_qty";

export function PackProvider({ children }: { children: ReactNode }) {
  const [quantities, setQuantities] = useState<number[]>(() => {
    if (typeof window === "undefined") return [0, 0, 0, 0, 0];
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      return Array.isArray(saved) && saved.length === 5 ? saved : [0, 0, 0, 0, 0];
    } catch { return [0, 0, 0, 0, 0]; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quantities));
  }, [quantities]);

  const changeQty = (i: number, delta: number) => {
    setQuantities(prev => {
      const next = [...prev];
      next[i] = Math.max(0, next[i] + delta);
      return next;
    });
  };

  const totalItems = quantities.reduce((a, b) => a + b, 0);
  const totalPrice = quantities.reduce((s, q, i) => s + q * PACK_CATEGORIES[i].prix, 0);
  const discount = getDiscount(totalItems);
  const discountedPrice = Math.round(totalPrice * (1 - discount / 100));

  return (
    <PackContext.Provider value={{ quantities, changeQty, totalItems, totalPrice, discount, discountedPrice }}>
      {children}
    </PackContext.Provider>
  );
}

export const usePack = () => {
  const ctx = useContext(PackContext);
  if (!ctx) throw new Error("usePack must be used inside PackProvider");
  return ctx;
};