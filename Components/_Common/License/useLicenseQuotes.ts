import useSWR from "swr";
import { useCallback, useMemo } from "react";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { IActiveLicenseCatalog, LicenseOrg, adaptLicenseCatalog } from "./licenseTypes";

// The priced plan lineup of a provider kind (2026-10): GET
// /licensePlans/pricing/:kind on noyanai-back (Lib/licenseQuote.ts) - the
// same price rule purchaseLicense charges with: the option's own discount,
// then the best running promotion (launch discount). Read by the panels'
// licence pages, the checkout and the public /pricing page.

export interface ILicenseQuote {
  days: number;
  listPrice: number;
  planDiscount: number;
  price: number;
  promotionDiscount: number;
  final: number;
  percentOff: number;
  promotion: null | {
    _id: string;
    title: string;
    endsAt: string;
    firstPurchaseOnly: boolean;
    withCode: boolean;
  };
}

export interface ILicensePromotionInfo {
  _id: string;
  title: string;
  discountType: "percent" | "amount";
  value: number;
  maxDiscount: number;
  startsAt: string;
  endsAt: string;
  firstPurchaseOnly: boolean;
  withCode: boolean;
}

export interface ILicensePricing extends IActiveLicenseCatalog {
  quotes: Record<string, ILicenseQuote[]>;
  promotions: ILicensePromotionInfo[];
  code: string;
  codeValid: boolean | null;
  now: string;
}

const num = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);

// a bad payload (an error page, a record missing fields) reads as "no
// quotes" instead of crashing the page
const adaptPricing = (raw: unknown): ILicensePricing => {
  const data = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const catalog = adaptLicenseCatalog<IActiveLicenseCatalog>(data);
  const quotes: Record<string, ILicenseQuote[]> = {};
  const rawQuotes = data.quotes && typeof data.quotes === "object" ? (data.quotes as Record<string, unknown>) : {};
  for (const [id, list] of Object.entries(rawQuotes))
    quotes[id] = (Array.isArray(list) ? list : [])
      .filter((q) => q && typeof q === "object")
      .map((q) => {
        const r = q as Record<string, unknown>;
        const promo = r.promotion && typeof r.promotion === "object" ? (r.promotion as Record<string, unknown>) : null;
        return {
          days: num(r.days),
          listPrice: num(r.listPrice),
          planDiscount: num(r.planDiscount),
          price: num(r.price),
          promotionDiscount: num(r.promotionDiscount),
          final: num(r.final),
          percentOff: num(r.percentOff),
          promotion: promo
            ? {
                _id: String(promo._id || ""),
                title: String(promo.title || ""),
                endsAt: String(promo.endsAt || ""),
                firstPurchaseOnly: !!promo.firstPurchaseOnly,
                withCode: !!promo.withCode,
              }
            : null,
        };
      });
  return {
    ...catalog,
    modules: Array.isArray(data.modules) ? (data.modules as string[]) : [],
    quotes,
    promotions: (Array.isArray(data.promotions) ? data.promotions : []).filter(
      (p): p is ILicensePromotionInfo => !!p && typeof p === "object" && !!(p as ILicensePromotionInfo).endsAt,
    ),
    code: typeof data.code === "string" ? data.code : "",
    codeValid: typeof data.codeValid === "boolean" ? data.codeValid : null,
    now: typeof data.now === "string" ? data.now : new Date().toISOString(),
  };
};

export const licensePricingUrl = (org: LicenseOrg, code?: string) =>
  `${API}/licensePlans/pricing/${org}${code ? `?code=${encodeURIComponent(code)}` : ""}`;

const useLicenseQuotes = (org: LicenseOrg | null | undefined, code?: string) => {
  const { data, error, isLoading } = useSWR<ILicensePricing>(
    org ? licensePricingUrl(org, code) : null,
    (url: string) => fetcher({ url }).then((res) => adaptPricing(res.data)),
    { revalidateOnFocus: false },
  );
  const promotions = useMemo(() => data?.promotions || [], [data]);
  // the quote of one price option; the promotion's title comes from the
  // advertised list, which the server already put in the page's language
  const quoteOf = useCallback(
    (planId: string | undefined, days: number | undefined | null): ILicenseQuote | null => {
      if (!data || !planId || !days) return null;
      const quote = (data.quotes[planId] || []).find((q) => q.days === Number(days)) || null;
      if (!quote?.promotion) return quote;
      const advertised = promotions.find((p) => p._id === quote.promotion?._id);
      return advertised ? { ...quote, promotion: { ...quote.promotion, title: advertised.title || quote.promotion.title } } : quote;
    },
    [data, promotions],
  );
  return { data, error, isLoading, quoteOf, promotions };
};

export default useLicenseQuotes;
