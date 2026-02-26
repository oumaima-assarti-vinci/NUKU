"use client"

import "./globals.css"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { CartProvider } from "@/lib/contexts/CartContext"
import { usePathname } from "next/navigation"
import { Inter, Playfair_Display } from "next/font/google"

/* ========================= 
   FONTS 
   ========================= */

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

/* ========================= 
   ROOT LAYOUT 
   ========================= */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin")

  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* Google Fonts - Cormorant Garamond */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white font-sans text-neutral-900 antialiased">
        <CartProvider>
          <Header />
          <main className={isAdmin ? "" : "pt-16"}>
            {children}
          </main>
          {!isAdmin && <Footer />}
        </CartProvider>
      </body>
    </html>
  )
}