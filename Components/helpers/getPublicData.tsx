import { headers } from "next/headers";
import { BACKEND } from "../config";
import { siteDefaultLocale, LOCALE_HEADER } from "../i18n/locales";

// The page's language (set by middleware); the backend returns DB content
// in it. Outside a request (build-time) there is none, so Persian.
const requestLocale = () => {
  try {
    return headers().get(LOCALE_HEADER) || siteDefaultLocale();
  } catch {
    return siteDefaultLocale();
  }
};

export const getPublicData = async <T,>(
  path: string,
  searchParams?: Record<string, string>,
): Promise<T | undefined> => {
  const qs =
    searchParams && Object.keys(searchParams).length
      ? `?${new URLSearchParams(searchParams).toString()}`
      : "";
  // never wait on the backend longer than the proxy would (2026-10): a
  // hung request used to hold the page until nginx cut it, and the browser
  // saw only "network error"; now the page fails in time and shows its
  // error screen with «تلاش دوباره»
  const response = await fetch(`${BACKEND}/api/v1/public/${path}${qs}`, {
    cache: "no-store",
    headers: { [LOCALE_HEADER]: requestLocale() },
    signal: AbortSignal.timeout(25_000),
  });
  if (!response.ok) return;
  try {
    const data = await response.json();
    // if (path.includes("doctor")) console.log(data);
    return data?.data as T;
  } catch {
    return;
  }
};
