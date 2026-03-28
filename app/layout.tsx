"use client"

import "./globals.css"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { CartProvider } from "@/lib/contexts/CartContext"
import { usePathname } from "next/navigation"
import { Inter, Playfair_Display } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500"],
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin")

  return (
    <html lang={params.locale ?? "fr"} className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white font-sans text-neutral-900 antialiased overflow-x-hidden">
        <NextIntlClientProvider locale={params.locale ?? "fr"}>
          <CartProvider>
            <Header />
            <main className={isAdmin ? "" : "pt-16 overflow-x-hidden"}>
              {children}
            </main>
            {!isAdmin && <Footer />}
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}