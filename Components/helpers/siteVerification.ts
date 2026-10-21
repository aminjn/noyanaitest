import { BACKEND } from "../config";

// The search-engine ownership codes the super admin set in «سئو و لینک‌ها» →
// «تأیید مالکیت» (backend /public/site-verification). Read by the root
// layout's metadata on every page, so cached for five minutes; a missing
// or broken answer is "none", never an error page.
export type SiteVerification = { googleFiles: string[]; google: string; bing: string; yandex: string };

const NONE: SiteVerification = { googleFiles: [], google: "", bing: "", yandex: "" };
const str = (v: unknown) => (typeof v === "string" ? v : "");

// `fresh`: the verification file itself, so a code saved a moment ago works
// when the engine checks it
export const getSiteVerification = async (fresh = false): Promise<SiteVerification> => {
  try {
    const res = await fetch(`${BACKEND}/api/v1/public/site-verification`, {
      ...(fresh ? { cache: "no-store" as const } : { next: { revalidate: 300 } }),
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) return NONE;
    const d = (await res.json())?.data || {};
    return {
      googleFiles: Array.isArray(d.googleFiles) ? d.googleFiles.filter((x: unknown) => typeof x === "string") : [],
      google: str(d.google),
      bing: str(d.bing),
      yandex: str(d.yandex),
    };
  } catch {
    return NONE;
  }
};
