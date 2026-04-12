import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

const SECRET = process.env.NEXT_PUBLIC_MAINTENANCE_SECRET ?? "monequipe123";

const intlMiddleware = createMiddleware({
  locales: ["fr", "en", "nl"],
  defaultLocale: "fr",
});

export default function middleware(request: NextRequest) {
  const MAINTENANCE_MODE = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

  if (MAINTENANCE_MODE) {
    const pathname = request.nextUrl.pathname;
    const isMaintenancePage = pathname.includes("/maintenance");

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

    const cookie = request.cookies.get("maintenance_access")?.value;
    if (cookie === SECRET || isMaintenancePage) {
      return intlMiddleware(request);
    }

    const url = request.nextUrl.clone();
    url.pathname = "/fr/maintenance";
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|admin|.*\\..*).*)"],
};