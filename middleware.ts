import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === "true";

const ALLOWED_IPS = [
  "123.456.789.10", // ton IP
  "98.76.54.32",    // IP collègue
];

const intlMiddleware = createMiddleware({
  locales: ["fr", "en", "nl"],
  defaultLocale: "fr",
});

export default function middleware(request: NextRequest) {
  if (MAINTENANCE_MODE) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
    const pathname = request.nextUrl.pathname;

    const isAllowed = ALLOWED_IPS.includes(ip);
    const isMaintenancePage = pathname.includes("/maintenance");

    if (!isAllowed && !isMaintenancePage) {
      const url = request.nextUrl.clone();
      url.pathname = "/fr/maintenance"; // ou /en/maintenance selon ta locale par défaut
      return NextResponse.redirect(url);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|admin|.*\\..*).*)"],
};