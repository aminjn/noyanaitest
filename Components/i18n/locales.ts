// Site languages. Persian is the default and has no URL prefix: "/x" and
// "/fa/x" are both Persian; every other language lives under "/<code>/x".
// Kept in sync with Lib/locales.ts on noyanai-back.
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

export const defaultLocale: Locale = "fa";

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

// "/en/doctors?x" -> { locale: "en", path: "/doctors?x" }; "/fa/x" and "/x"
// are Persian.
export const splitLocale = (pathname: string): { locale: Locale; path: string } => {
  const match = pathname.match(/^\/([a-z]{2})(?=\/|$|\?)(.*)$/);
  if (match && isLocale(match[1]))
    return { locale: match[1], path: match[2] || "/" };
  return { locale: defaultLocale, path: pathname || "/" };
};

// Prefixes an internal path with the locale ("/x" -> "/en/x"). Persian
// stays unprefixed. External URLs, anchors and already-prefixed paths are
// returned unchanged.
export const localizePath = (path: string, locale: Locale): string => {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  if (locale === defaultLocale) return path;
  const { locale: existing } = splitLocale(path);
  if (existing !== defaultLocale || /^\/fa(\/|$|\?)/.test(path)) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
};

export const LOCALE_HEADER = "x-locale";

// Languages that are actually served. Drop a code from here to take it
// offline: "/<code>/..." then redirects to the Persian page instead.
export const enabledLocales: readonly Locale[] = locales;

export const isEnabledLocale = (locale: Locale) => enabledLocales.includes(locale);
