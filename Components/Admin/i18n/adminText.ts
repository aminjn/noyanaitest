import { localeDir, siteDefaultLocale } from "@/Components/i18n/locales";
import { withTehranZone } from "@/Components/helpers/tehranTime";

// The super admin panel's texts (2026-09): the panel always shows the site's
// default language (set by the super admin, "Site languages"), whatever a
// visitor picked. Admin texts are written in Persian in the code and looked
// up gettext-style - the Persian text is the key - in one dictionary per
// language (./dict/<locale>.json). The root layout loads the default
// language's dictionary before anything renders (AdminTextProvider), so this
// needs no hook and also works in column / menu / form definitions.
//
// A text missing from the dictionary shows in Persian. Values can carry
// ${1}, ${2}... placeholders (ta("${1} of ${2}", [a, b])).

export type AdminDictionary = Record<string, string>;

let dictionary: AdminDictionary = {};

export const setAdminDictionary = (dict: AdminDictionary | null | undefined) => {
  dictionary = dict || {};
};

const normalize = (text: string) => text.replace(/\s+/g, " ").trim();

export const ta = (
  text: string,
  args?: (string | number | null | undefined)[],
): string => {
  if (typeof text !== "string") return text;
  const found =
    siteDefaultLocale() === "fa" ? undefined : dictionary[normalize(text)];
  let result = found || text;
  if (args?.length)
    args.forEach((value, i) => {
      result = result.split(`\${${i + 1}}`).join(String(value ?? ""));
    });
  return result;
};

// dates and numbers in the panel follow its language too
export const adminIntlTag = () => {
  const tags: Record<string, string> = {
    fa: "fa-IR",
    en: "en-US",
    zh: "zh-CN",
    hi: "hi-IN",
    pt: "pt-BR",
  };
  const locale = siteDefaultLocale();
  return tags[locale] || locale;
};

// the panel's writing direction (the default language's)
export const adminIsRtl = () => localeDir(siteDefaultLocale()) === "rtl";

// Number / date formatters in the panel's language. They can be created at
// module level: the real Intl formatter is built on first use (and again if
// the default language changes), not at import time.
const lazyIntl = <T extends Intl.NumberFormat | Intl.DateTimeFormat>(
  make: (tag: string) => T,
) => {
  let cached: { tag: string; value: T } | null = null;
  const get = () => {
    const tag = adminIntlTag();
    if (!cached || cached.tag !== tag) cached = { tag, value: make(tag) };
    return cached.value;
  };
  return {
    format: (value: Parameters<T["format"]>[0]) =>
      (get().format as (v: unknown) => string)(value),
    formatToParts: (value: Parameters<T["formatToParts"]>[0]) =>
      (get().formatToParts as (v: unknown) => ReturnType<T["formatToParts"]>)(value),
  };
};

export const adminNumberFormat = (options?: Intl.NumberFormatOptions) =>
  lazyIntl((tag) => new Intl.NumberFormat(tag, options));

// dates in the panel are Tehran time, whatever the browser's zone
// (Components/helpers/tehranTime.ts)
export const adminDateTimeFormat = (options?: Intl.DateTimeFormatOptions) =>
  lazyIntl((tag) => new Intl.DateTimeFormat(tag, withTehranZone(options)));
