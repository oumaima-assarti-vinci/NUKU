import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["fr", "en", "nl"],
  defaultLocale: "fr",
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|admin|.*\\..*).*)"],
};