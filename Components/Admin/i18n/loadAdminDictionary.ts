import { Locale, SOURCE_LOCALE } from "@/Components/i18n/locales";
import type { AdminDictionary } from "./adminText";

// server-only: the admin panel dictionary of one language (the Persian
// source needs none)
export const loadAdminDictionary = async (
  locale: Locale,
): Promise<AdminDictionary | null> => {
  if (locale === SOURCE_LOCALE) return null;
  try {
    const mod = await import(`./dict/${locale}.json`);
    return (mod.default || mod) as AdminDictionary;
  } catch {
    return null;
  }
};
