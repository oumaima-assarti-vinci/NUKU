"use client"

import { usePathname } from "next/navigation"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { ReactNode } from "react"

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin")

  return (
    <>
      <Header />
      <main className={isAdmin ? "" : "pt-24 overflow-x-hidden"}>
        {children}
      </main>
      {!isAdmin && <Footer />}
    </>
  )
}