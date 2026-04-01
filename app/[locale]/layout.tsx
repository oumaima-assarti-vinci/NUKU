import { ReactNode } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { CartProvider } from "@/lib/contexts/CartContext"
import { NextIntlClientProvider } from "next-intl"
import ClientLayout from "./ClientLayout"

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
      <body>
        <NextIntlClientProvider locale={locale}>
          <CartProvider>
            <ClientLayout>{children}</ClientLayout>
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}