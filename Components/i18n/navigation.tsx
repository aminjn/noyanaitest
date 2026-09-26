"use client";

// Locale-aware replacements for next/navigation hooks. The browser URL keeps
// its "/<locale>" prefix (e.g. /en/doctorpanel), but app code compares paths
// without it, so usePathname() here strips the prefix and useRouter()
// adds it back when navigating.
import {
  usePathname as useNextPathname,
  useRouter as useNextRouter,
} from "next/navigation";
import { useContext, useMemo } from "react";
import LocaleContext from "../Store/LocaleContext";
import { intlLocale, localizePath, splitLocale } from "./locales";

export const useLocale = () => useContext(LocaleContext).locale;

export const usePathname = () => {
  const pathname = useNextPathname();
  return splitLocale(pathname || "/").path;
};

export const useLocalizePath = () => {
  const locale = useLocale();
  return (path: string) => localizePath(path, locale);
};

export const useRouter = () => {
  const router = useNextRouter();
  const locale = useLocale();
  return useMemo(
    () => ({
      ...router,
      push: (href: string, options?: Parameters<typeof router.push>[1]) =>
        router.push(localizePath(href, locale), options),
      replace: (href: string, options?: Parameters<typeof router.replace>[1]) =>
        router.replace(localizePath(href, locale), options),
      prefetch: (href: string, options?: Parameters<typeof router.prefetch>[1]) =>
        router.prefetch(localizePath(href, locale), options),
    }),
    [router, locale],
  );
};


// BCP-47 tag for Intl / toLocaleString in the current language ("fa-IR"
// keeps the Persian calendar and digits; other languages use Gregorian).
export const useIntlLocale = () => intlLocale[useLocale()];
