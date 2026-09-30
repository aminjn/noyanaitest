// Site languages. Kept in sync with Lib/locales.ts on noyanai-back.
//
// The site's default language is set by the super admin (2026-09; GET
// /public/locales, see getSiteLocales): it has no URL prefix - "/x" and
// "/<default>/x" are both the default language - every other language
// lives under "/<code>/x", and the super admin panel always shows it.
// SOURCE_LOCALE is something else: the language stored content and the
// bundled texts are written in (the base the others are translated from).
export const locales = [
  "fa",
  "en",
  "ar",
  "zh",
  "hi",
  "es",
  "fr",
  "ru",
  "pt",
  "de",
  "tr",
  "ur",
  "bn",
  "id",
  "ja",
] as const;

export type Locale = (typeof locales)[number];

export const SOURCE_LOCALE: Locale = "fa";

// the default until the super admin's setting is known (and the fallback
// while it can't be read)
export const defaultLocale: Locale = "fa";

// The current site default - the same for every visitor, so a module value
// is enough: the server keeps it from getSiteLocales, the browser from the
// root layout (LocaleScopeProvider).
let siteDefault: Locale = defaultLocale;
export const setSiteDefaultLocale = (locale: Locale) => {
  if (isLocale(locale)) siteDefault = locale;
};
export const siteDefaultLocale = () => siteDefault;

export const rtlLocales: readonly Locale[] = ["fa", "ar", "ur"];

// Native names, for the language switcher.
export const localeNames: Record<Locale, string> = {
  fa: "فارسی",
  en: "English",
  ar: "العربية",
  zh: "中文",
  hi: "हिन्दी",
  es: "Español",
  fr: "Français",
  ru: "Русский",
  pt: "Português",
  de: "Deutsch",
  tr: "Türkçe",
  ur: "اردو",
  bn: "বাংলা",
  id: "Bahasa Indonesia",
  ja: "日本語",
};

// BCP-47 tags for Intl (dates/numbers). Persian keeps the Persian calendar.
export const intlLocale: Record<Locale, string> = {
  fa: "fa-IR",
  en: "en-US",
  ar: "ar",
  zh: "zh-CN",
  hi: "hi-IN",
  es: "es",
  fr: "fr",
  ru: "ru",
  pt: "pt-BR",
  de: "de",
  tr: "tr",
  ur: "ur",
  bn: "bn",
  id: "id",
  ja: "ja",
};

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && (locales as readonly string[]).includes(value);

export const localeDir = (locale: Locale) =>
  rtlLocales.includes(locale) ? "rtl" : "ltr";

// "/en/doctors?x" -> { locale: "en", path: "/doctors?x", prefixed: true };
// an unprefixed path is the site default.
export const splitLocale = (
  pathname: string,
  def: Locale = siteDefault,
): { locale: Locale; path: string; prefixed: boolean } => {
  const match = pathname.match(/^\/([a-z]{2})(?=\/|$|\?)(.*)$/);
  if (match && isLocale(match[1]))
    return { locale: match[1], path: match[2] || "/", prefixed: true };
  return { locale: def, path: pathname || "/", prefixed: false };
};

// Prefixes an internal path with the locale ("/x" -> "/en/x"). The site
// default stays unprefixed. External URLs, anchors and already-prefixed
// paths are returned unchanged.
export const localizePath = (
  path: string,
  locale: Locale,
  def: Locale = siteDefault,
): string => {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  if (locale === def) return path;
  if (splitLocale(path, def).prefixed) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
};

export const LOCALE_HEADER = "x-locale";
// The request path without its locale prefix (set by middleware).
export const PATH_HEADER = "x-path";

// Every language the build can serve; the super admin switches them on and
// off (getSiteLocales) - a switched-off one redirects to the default.
export const enabledLocales: readonly Locale[] = locales;

export const isEnabledLocale = (locale: Locale) => enabledLocales.includes(locale);
