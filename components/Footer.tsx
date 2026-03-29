"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const year = new Date().getFullYear();
  const pathname = usePathname();
  const segments = pathname?.split("/").filter(Boolean) ?? [];
  const lang = ["fr", "en", "nl"].includes(segments[0]) ? segments[0] : "fr";

  const translations = {
    fr: {
      tagline: "Compléments alimentaires naturels, pensés pour votre quotidien.",
      products: "Produits",
      shop: "Boutique",
      pack: "Composez votre pack",
      sub: "Abonnement",
      company: "Nuku",
      about: "Notre histoire",
      contact: "Contact",
      faq: "FAQ",
      contactTitle: "Nous contacter",
      hours: "9h–17h CET, Lun → Ven",
      rights: "Tous droits réservés.",
    },
    en: {
      tagline: "Natural food supplements, designed for your everyday life.",
      products: "Products",
      shop: "Shop",
      pack: "Build your pack",
      sub: "Subscription",
      company: "Nuku",
      about: "Our story",
      contact: "Contact",
      faq: "FAQ",
      contactTitle: "Contact us",
      hours: "9am–5pm CET, Mon → Fri",
      rights: "All rights reserved.",
    },
    nl: {
      tagline: "Natuurlijke voedingssupplementen, ontworpen voor uw dagelijks leven.",
      products: "Producten",
      shop: "Winkel",
      pack: "Stel je pack samen",
      sub: "Abonnement",
      company: "Nuku",
      about: "Ons verhaal",
      contact: "Contact",
      faq: "FAQ",
      contactTitle: "Neem contact op",
      hours: "9u–17u CET, Ma → Vr",
      rights: "Alle rechten voorbehouden.",
    },
  } as const;

  const t = translations[lang as keyof typeof translations];

  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-10">
        <div>
          <h3 className="text-white font-bold text-xl mb-3">NUKU</h3>
          <p className="text-sm text-gray-400">{t.tagline}</p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">{t.products}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href={`/${lang}/shop`} className="hover:text-white">{t.shop}</Link></li>
            <li><Link href={`/${lang}/build-pack`} className="hover:text-white">{t.pack}</Link></li>
            <li><Link href={`/${lang}/subscription`} className="hover:text-white">{t.sub}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">{t.company}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href={`/${lang}/about`} className="hover:text-white">{t.about}</Link></li>
            <li><Link href={`/${lang}/contact`} className="hover:text-white">{t.contact}</Link></li>
            <li><Link href={`/${lang}/faq`} className="hover:text-white">{t.faq}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">{t.contactTitle}</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="mailto:hello@nuku.be" className="hover:text-white">hello@nuku.be</a></li>
            <li>{t.hours}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-gray-500">
          © {year} Nuku. {t.rights}
        </div>
      </div>
    </footer>
  );
}