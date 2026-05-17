"use client";

import Link from "next/link";
import { useCart } from "@/lib/contexts/CartContext";
import { supabase } from "@/lib/supabaseClient";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import CartDrawer from "@/components/CartDrawer";

type HeaderProps = { onCartClick?: () => void };

const languages = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "nl", label: "Nederlands" },
];

export default function Header({ onCartClick }: HeaderProps) {
  const { getItemCount, clearCart } = useCart();
  const [user, setUser] = useState<any>(null);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("fr");
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const pathname = usePathname();
  const itemCount = getItemCount();

  useEffect(() => {
    const segments = pathname?.split("/").filter(Boolean) ?? [];
    if (["fr", "en", "nl"].includes(segments[0])) {
      setCurrentLang(segments[0]);
    }
  }, [pathname]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (mounted) setUser(data?.user ?? null);
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 80) {
        setHidden(false);
      } else {
        setHidden(currentY > lastY);
      }
      lastY = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) localStorage.removeItem(`cart-${user.id}`);
    clearCart();
    await supabase.auth.signOut();
    router.push(`/${currentLang}/home`);
  }, [clearCart, router, currentLang]);

  const switchLanguage = (code: string) => {
    const segments = pathname?.split("/").filter(Boolean) ?? [];
    if (["fr", "en", "nl"].includes(segments[0])) {
      segments[0] = code;
    } else {
      segments.unshift(code);
    }
    setCurrentLang(code);
    setLangDropdownOpen(false);
    router.push("/" + segments.join("/"));
  };

  const hideHeader = pathname?.startsWith("/admin");
  if (hideHeader) return null;

  const currentLangLabel = languages.find((l) => l.code === currentLang)?.label ?? "FR";

  const navLinks = [
    { href: `/${currentLang}/shop`, label: currentLang === "fr" ? "Shop" : currentLang === "en" ? "Shop" : "Winkel" },
    { href: `/${currentLang}/subscription#creer-votre-routine`, label: "Packs" },
    { href: `/${currentLang}/subscription`, label: currentLang === "fr" ? "Abonnement" : currentLang === "en" ? "Subscription" : "Abonnement" },
    { href: `/${currentLang}/about`, label: currentLang === "fr" ? "About" : currentLang === "en" ? "About" : "Over ons" },
    { href: `/${currentLang}/contact`, label: "Contact" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 bg-white transition-transform duration-300 ${
          hidden ? "-translate-y-full" : "translate-y-0"
        }`}
        style={{ borderBottom: "1px solid #f0f0f0" }}
      >
        <div className="mx-auto w-full max-w-[1400px] px-6">
          <div className="h-20 flex items-center justify-between gap-6">

            {/* Logo */}
            <Link href={`/${currentLang}/home`} className="flex items-center h-full flex-shrink-0">
              <img
                src="/image/LOGOHONRIZONTALORANGE.png"
                alt="Nuku"
                className="hidden md:block h-auto w-auto max-h-12 max-w-[140px] object-contain select-none"
                loading="eager"
                decoding="async"
              />
              <img
                src="/image/LOGOHONRIZONTALORANGE.png"
                alt="Nuku"
                className="block md:hidden h-8 w-auto object-contain select-none"
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
                  className={`text-sm tracking-wide font-medium transition-colors ${
                    pathname?.includes(l.href.split("/").pop()!)
                      ? "text-neutral-900 font-semibold"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="ml-auto flex items-center gap-4">

              {/* Dropdown langues (desktop) */}
              <div ref={langDropdownRef} className="relative hidden md:block">
                <button
                  onClick={() => setLangDropdownOpen((o) => !o)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors px-2 py-1 rounded-md hover:bg-neutral-100"
                >
                  {currentLangLabel}
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${langDropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {langDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-36 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden z-50 animate-[fade_.15s_ease]">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => switchLanguage(lang.code)}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          currentLang === lang.code
                            ? "bg-orange-50 text-orange-600 font-semibold"
                            : "text-neutral-700 hover:bg-neutral-50 font-medium"
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Panier → ouvre le drawer */}
              <button
                onClick={() => setCartOpen(true)}
                className="group relative p-2 rounded-full hover:bg-neutral-100 transition"
                title="Panier"
              >
                <svg className="w-6 h-6 text-neutral-800 group-hover:text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-orange-600 text-white text-[11px] leading-5 font-bold rounded-full grid place-items-center">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </button>

              {/* Sign in / Log out */}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="hidden md:block text-sm font-medium text-neutral-600 hover:text-neutral-900 transition"
                >
                  Log out
                </button>
              ) : (
                <Link
                  href={`/${currentLang}/login`}
                  className="hidden md:block text-sm font-medium text-neutral-600 hover:text-neutral-900 transition"
                >
                  Sign in | Log in
                </Link>
              )}

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
                      pathname?.includes(l.href.split("/").pop()!)
                        ? "bg-neutral-100 text-neutral-900"
                        : "text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
                <div className="h-px bg-neutral-200 my-1" />
                <div className="flex justify-center gap-2 py-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { switchLanguage(lang.code); setMobileOpen(false); }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                        currentLang === lang.code
                          ? "bg-orange-50 text-orange-500"
                          : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
                <div className="h-px bg-neutral-200 my-1" />
                {user ? (
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-50 text-left"
                  >
                    Log out
                  </button>
                ) : (
                  <Link
                    href={`/${currentLang}/login`}
                    onClick={() => setMobileOpen(false)}
                    className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                  >
                    Sign in | Log in
                  </Link>
                )}
              </nav>
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes fade {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </header>

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Bouton scroll to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Retour en haut"
        className={`fixed bottom-5 right-4 z-50 transition-all duration-300
          w-10 h-10 md:w-12 md:h-12
          flex items-center justify-center
          rounded-full bg-orange-600 hover:bg-orange-700 text-white shadow-lg
          ${!hidden ? "opacity-0 translate-y-4 pointer-events-none" : "opacity-100 translate-y-0"}
        `}
      >
        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </>
  );
}