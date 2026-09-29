import { headers } from "next/headers";
import { DOMAIN } from "../config";
import {
  defaultLocale,
  enabledLocales,
  isLocale,
  Locale,
  LOCALE_HEADER,
  localizePath,
  PATH_HEADER,
} from "./locales";

const origin = DOMAIN.replace(/\/$/, "");

const requestInfo = () => {
  try {
    const h = headers();
    const locale = h.get(LOCALE_HEADER);
    return {
      locale: isLocale(locale) ? locale : defaultLocale,
      path: h.get(PATH_HEADER),
    };
  } catch {
    return { locale: defaultLocale, path: null };
  }
};

// <link rel="alternate" hreflang="..."> for every served language of the
// current page (Persian doubles as x-default). Pass the languages the super
// admin has switched on (getEnabledLocales) - a disabled one must not be
// advertised to search engines.
export const localeAlternates = (served: readonly Locale[] = enabledLocales) => {
  const { path } = requestInfo();
  if (!path || path.startsWith(`/${process.env.ADMIN_KEY}`)) return undefined;
  const languages: Record<string, string> = {
    "x-default": origin + localizePath(path, defaultLocale),
  };
  for (const locale of served)
    languages[locale] = origin + localizePath(path, locale);
  return { languages };
};

// A canonical URL set in the admin is the Persian page; on a translated
// page it has to point at that page's own language version.
export const localizeCanonical = (canonical: string) => {
  const { locale } = requestInfo();
  if (locale === defaultLocale) return canonical;
  try {
    const url = new URL(canonical, origin);
    if (url.origin !== new URL(origin).origin) return canonical;
    url.pathname = localizePath(url.pathname, locale);
    return url.toString();
  } catch {
    return canonical;
  }
};
