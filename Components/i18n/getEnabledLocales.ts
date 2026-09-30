import { getPublicData } from "../helpers/getPublicData";
import {
  defaultLocale,
  isLocale,
  Locale,
  locales,
  setSiteDefaultLocale,
} from "./locales";

export type SiteLocales = { default: Locale; enabled: Locale[] };

// The super admin's language settings (GET /public/locales): the site
// default and the languages served, default first. Cached per server
// instance for a minute - the middleware asks on every request. Fails open:
// if the backend can't answer, the last known (or every) language stays up
// (a broken lookup must never turn pages into a 500).
const TTL = 60_000;
let cached: { at: number; value: SiteLocales } | null = null;

export const getSiteLocales = async (): Promise<SiteLocales> => {
  if (cached && Date.now() - cached.at < TTL) return cached.value;
  try {
    const data = await getPublicData<{ enabled?: unknown; default?: unknown }>(
      "locales",
    );
    const list = Array.isArray(data?.enabled)
      ? data.enabled.filter(isLocale)
      : null;
    if (list) {
      const def = isLocale(data?.default) ? data.default : defaultLocale;
      const value: SiteLocales = {
        default: def,
        enabled: [def, ...locales.filter((l) => l !== def && list.includes(l))],
      };
      cached = { at: Date.now(), value };
      setSiteDefaultLocale(def);
      return value;
    }
  } catch {}
  return cached?.value || { default: defaultLocale, enabled: [...locales] };
};

export const getEnabledLocales = async (): Promise<Locale[]> =>
  (await getSiteLocales()).enabled;
