import { ReactNode } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { CartProvider } from "@/lib/contexts/CartContext"
import { NextIntlClientProvider } from "next-intl"
import ClientLayout from "./ClientLayout"
import {PackProvider} from "@/lib/contexts/PackContext"

export const metadata = {
  title: "Nuku – Élevez votre bien-être",
  description: "Élevez votre bien-être avec des compléments botaniques.",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <html lang={locale}>
      <head>
        <link rel="preload" as="image" href="/image/fruitbackround.png" />
      </head>
      <body>
        <NextIntlClientProvider locale={locale}>
          <CartProvider>
            <PackProvider>
              <ClientLayout>{children}</ClientLayout>
            </PackProvider>
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}