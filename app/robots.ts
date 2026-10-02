import type { MetadataRoute } from "next";
import { DOMAIN } from "@/Components/config";
import { locales } from "@/Components/i18n/locales";

// robots.txt (2026-10): it was missing, so crawlers wandered into panels,
// carts and payment callbacks. Public pages stay open; private and
// transactional routes are blocked, with or without a language prefix.
// The admin path is deliberately not listed here (it would advertise it);
// its layout sends noindex instead.
const privatePaths = [
  "/dashboard",
  "/doctorpanel",
  "/clinicpanel",
  "/hospitalpanel",
  "/insurancepanel",
  "/paraClinicPanel",
  "/pharmacypanel",
  "/secretarypanel",
  "/onboarding",
  "/wizard",
  "/cart",
  "/order",
  "/payment",
  "/call",
  "/newCall",
  "/api/",
];

const robots = (): MetadataRoute.Robots => ({
  rules: [
    {
      userAgent: "*",
      allow: "/",
      disallow: [
        ...privatePaths,
        ...locales.flatMap((locale) =>
          privatePaths.map((path) => `/${locale}${path}`),
        ),
      ],
    },
  ],
  sitemap: `${DOMAIN}/sitemap.xml`,
  host: DOMAIN,
});

export default robots;
