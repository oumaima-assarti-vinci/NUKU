
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-10">
        <div>
          <h3 className="text-white font-bold text-xl mb-3">YONKO</h3>
          <p className="text-sm text-gray-400">
            Compléments alimentaires bio et naturels, pensés pour votre quotidien.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Produits</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/shop" className="hover:text-white">Shop</Link></li>
            <li><Link href="/build-pack" className="hover:text-white">Composez votre pack</Link></li>
            <li><Link href="/subscription" className="hover:text-white">Abonnement</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Yonko</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-white">About us</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact us</Link></li>
            <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Nous contacter</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="mailto:hi@trycreate.co" className="hover:text-white">hi@trycreate.co</a>
            </li>
            <li>
              <a href="mailto:press@trycreate.co" className="hover:text-white">press@trycreate.co</a>
            </li>
            <li>9h–17h CET, Lun → Ven</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-gray-500">
          © {year} Yonko Nutrition. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
``
