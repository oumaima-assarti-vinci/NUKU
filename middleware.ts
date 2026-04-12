import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === "true";
const SECRET = process.env.MAINTENANCE_SECRET ?? "monequipe123";

const intlMiddleware = createMiddleware({
  locales: ["fr", "en", "nl"],
  defaultLocale: "fr",
});

export default function middleware(request: NextRequest) {
  if (MAINTENANCE_MODE) {
    const pathname = request.nextUrl.pathname;
    const isMaintenancePage = pathname.includes("/maintenance");

    // Accès via ?access=SECRET → stocke un cookie et redirige proprement
    const accessParam = request.nextUrl.searchParams.get("access");
    if (accessParam === SECRET) {
      const url = request.nextUrl.clone();
      url.searchParams.delete("access");
      const response = NextResponse.redirect(url);
      response.cookies.set("maintenance_access", SECRET, {
        httpOnly: true,
        path: "/",
      });
      return response;
    }

    // Vérifie le cookie
    const cookie = request.cookies.get("maintenance_access")?.value;
    if (cookie === SECRET || isMaintenancePage) {
      return intlMiddleware(request);
    }

    // Tout le monde else → page maintenance
    const url = request.nextUrl.clone();
    url.pathname = "/fr/maintenance";
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|admin|.*\\..*).*)"],
};