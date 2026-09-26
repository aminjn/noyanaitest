import { getPublicData } from "../helpers/getPublicData";
import { defaultLocale, Locale } from "./locales";
import fa from "./messages/fa.json";
import en from "./messages/en.json";

export type Messages = Record<string, string>;

// Bundled texts per language. Other languages are loaded on demand so a
// Persian page doesn't carry 14 dictionaries.
const loaders: Partial<Record<Locale, () => Promise<Messages>>> = {
  fa: async () => fa as Messages,
  en: async () => en as Messages,
  ar: () => import("./messages/ar.json").then((m) => m.default as Messages),
  zh: () => import("./messages/zh.json").then((m) => m.default as Messages),
  hi: () => import("./messages/hi.json").then((m) => m.default as Messages),
  es: () => import("./messages/es.json").then((m) => m.default as Messages),
  fr: () => import("./messages/fr.json").then((m) => m.default as Messages),
  ru: () => import("./messages/ru.json").then((m) => m.default as Messages),
  pt: () => import("./messages/pt.json").then((m) => m.default as Messages),
  de: () => import("./messages/de.json").then((m) => m.default as Messages),
  tr: () => import("./messages/tr.json").then((m) => m.default as Messages),
  ur: () => import("./messages/ur.json").then((m) => m.default as Messages),
  bn: () => import("./messages/bn.json").then((m) => m.default as Messages),
  id: () => import("./messages/id.json").then((m) => m.default as Messages),
  ja: () => import("./messages/ja.json").then((m) => m.default as Messages),
};

// All UI texts for one language: bundled file, falling back to English and
// then Persian for anything not translated yet, with the admin's edits for
// that language (GET /public/texts) on top.
export const getMessages = async (locale: Locale): Promise<Messages> => {
  const [own, overrides, faOverrides] = await Promise.all([
    (loaders[locale] || loaders[defaultLocale]!)().catch(() => ({}) as Messages),
    getPublicData<Messages>("texts", { locale }).catch(() => undefined),
    locale === defaultLocale
      ? undefined
      : getPublicData<Messages>("texts", { locale: defaultLocale }).catch(() => undefined),
  ]);
  if (locale === defaultLocale) return { ...(fa as Messages), ...(overrides || {}) };
  // Persian (with its admin edits) at the bottom: content-like keys that
  // aren't in the bundled files (phone, address, social links, stats) come
  // from there for every language; translated keys override it.
  return {
    ...(fa as Messages),
    ...(faOverrides || {}),
    ...(en as Messages),
    ...own,
    ...(overrides || {}),
  };
};
