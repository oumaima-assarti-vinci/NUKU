
"use client";

import Link from "next/link";
import { useCart } from "@/lib/contexts/CartContext";
import { supabase } from "@/lib/supabaseClient";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

type HeaderProps = { onCartClick?: () => void };

const navLinks = [
  { href: "/shop", label: "BOUTIQUE" },
  { href: "/build-pack", label: "COMPOSEZ VOTRE PACK" },
  { href: "/subscription", label: "ABONNEMENT" },
  { href: "/about", label: "NOTRE HISTOIRE" },
];

export default function Header({ onCartClick }: HeaderProps) {
  const { getItemCount, clearCart } = useCart();
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const itemCount = getItemCount();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (mounted) setUser(data?.user ?? null);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) localStorage.removeItem(`cart-${user.id}`);
    clearCart();
    await supabase.auth.signOut();
    router.push("/home");
  }, [clearCart, router]);

  const hideHeader = pathname?.startsWith("/admin");
  if (hideHeader) return null;

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all ${
        scrolled
          ? "bg-white/90 backdrop-blur border-b border-neutral-200 shadow-[0_8px_30px_rgba(0,0,0,0.05)]"
          : "bg-white"
      }`}
    >
      <div className="mx-auto w-full max-w-[1400px] px-6">
       <div className="h-24 flex items-center justify-between gap-6">

          {/* Logo */}

{/* Logo */}




<Link href="/home" className="flex items-center h-full">
  <img
    src="/image/logo.png"
    alt="Nuku Logo"
    className="h-40 w-auto md:h-60 md:max-w-[180px] object-contain select-none"
    loading="eager"
    decoding="async"
  />
</Link>

          {/* NAV center (desktop) */}
          <nav className="hidden md:flex items-center justify-center gap-8 mx-auto">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm tracking-wide font-semibold transition-colors ${
                  pathname?.startsWith(l.href)
                    ? "text-neutral-900"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-3">
            {/* Account */}
            {user ? (
              <button
                onClick={handleLogout}
                className="group relative p-2 rounded-full hover:bg-neutral-100 transition"
                title="Déconnexion"
              >
                <svg
                  className="w-6 h-6 text-neutral-800 group-hover:text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>
            ) : (
              <Link
                href="/login"
                className="group relative p-2 rounded-full hover:bg-neutral-100 transition"
                title="Connexion"
              >
                <svg
                  className="w-6 h-6 text-neutral-800 group-hover:text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </Link>
            )}

            {/* Cart */}
            <button
             onClick={() => router.push('/cart')}
              className="group relative p-2 rounded-full hover:bg-neutral-100 transition"
              title="Panier"
            >
              <svg
                className="w-6 h-6 text-neutral-800 group-hover:text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-orange-600 text-white text-[11px] leading-5 font-bold rounded-full grid place-items-center">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>

            {/* CTA desktop */}
            <Link
              href="/checkout"
              className="hidden md:inline-flex h-11 items-center rounded-full px-5 font-extrabold text-white bg-orange-600 hover:bg-orange-700"
            >
              COMMANDER
            </Link>

            {/* Burger mobile */}
            <button
              className="md:hidden p-2 rounded-full hover:bg-neutral-100"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Ouvrir le menu"
            >
              <svg className="w-7 h-7 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 animate-[fade_.2s_ease]">
            <nav className="flex flex-col gap-1 rounded-2xl border border-neutral-200 bg-white p-2 shadow-md">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-semibold ${
                    pathname?.startsWith(l.href) ? "bg-neutral-100 text-neutral-900" : "text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <div className="h-px bg-neutral-200 my-1" />
             <Link
  href="/checkout"
  onClick={() => setMobileOpen(false)}
  className="w-full h-11 grid place-items-center rounded-xl font-extrabold text-white bg-[#ED9446]"
>
  COMMANDER
</Link>
            </nav>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </header>
  );
}
