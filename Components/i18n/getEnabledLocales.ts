import { getPublicData } from "../helpers/getPublicData";
import { defaultLocale, isLocale, Locale, locales } from "./locales";

// Languages the site serves, as set by the super admin (GET /public/locales).
// Cached per server instance for a minute - the middleware asks on every
// request. Fails open: if the backend can't answer, every language stays up
// (a broken lookup must never turn pages into a 500).
const TTL = 60_000;
let cached: { at: number; value: Locale[] } | null = null;

export const getEnabledLocales = async (): Promise<Locale[]> => {
  if (cached && Date.now() - cached.at < TTL) return cached.value;
  try {
    const data = await getPublicData<{ enabled?: unknown }>("locales");
    const list = Array.isArray(data?.enabled)
      ? data.enabled.filter(isLocale)
      : null;
    if (list) {
      const value = [
        defaultLocale,
        ...locales.filter((l) => l !== defaultLocale && list.includes(l)),
      ];
      cached = { at: Date.now(), value };
      return value;
    }
  } catch {}
  return [...locales];
};
