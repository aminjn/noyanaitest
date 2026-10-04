import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useUser from "@/Components/Hooks/useUser";
import { ILicensePromotionInfo, ILicenseQuote } from "@/Components/_Common/License/useLicenseQuotes";

// «پرو» (2026-10): the patients' membership on noyanai-back
// (Lib/patientPro.ts, Controllers/patientProController.ts). GET
// /pro/pricing is public, GET /pro/me is the signed-in user's status - both
// carry the plan's priced options (the provider-plan price rule: option
// discount + launch promotion) and the benefits switched on by the super
// admin. Every field is read defensively: a bad payload reads as "nothing
// to show", never a crash.

export interface IProBenefits {
  aiEnabled: boolean;
  freeAiDailyLimit: number;
  proAiDailyLimit: number;
  bookingDiscountEnabled: boolean;
  bookingDiscountPercent: number;
  bookingDiscountMax: number;
  familyEnabled: boolean;
  deliveryEnabled: boolean;
  deliveryFreeAbove: number;
  deliveryPercentOff: number;
  cancelEnabled: boolean;
  proFreeCancelHours: number;
  baseFreeCancelHours: number;
  supportEnabled: boolean;
}

export interface IProSubscription {
  _id: string;
  days: number;
  startedAt: string;
  expiresAt: string;
  state: "active" | "scheduled" | "expired" | "cancelled";
  daysLeft: number | null;
  listPrice: number;
  paid: number;
  granted: boolean;
}

export interface IProPricing {
  plan: { _id: string; displayName: string; summary: string } | null;
  options: ILicenseQuote[];
  promotions: ILicensePromotionInfo[];
  code: string;
  codeValid: boolean | null;
  onSale: boolean;
  benefits: IProBenefits;
}

export interface IMyPro extends IProPricing {
  active: boolean;
  until: string | null;
  current: IProSubscription | null;
  history: IProSubscription[];
  ai: { pro: boolean; limit: number; used: number; remaining: number | null };
  freeCancelHours: number;
}

const num = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const obj = (v: unknown) => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});

const adaptQuote = (raw: unknown): ILicenseQuote => {
  const r = obj(raw);
  const promo = r.promotion && typeof r.promotion === "object" ? obj(r.promotion) : null;
  return {
    days: num(r.days),
    listPrice: num(r.listPrice),
    planDiscount: num(r.planDiscount),
    price: num(r.price),
    promotionDiscount: num(r.promotionDiscount),
    quoted: r.quoted === undefined ? num(r.final) : num(r.quoted),
    upgradeCredit: num(r.upgradeCredit),
    final: num(r.final),
    upgradable: r.upgradable !== false,
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
};

const adaptBenefits = (raw: unknown): IProBenefits => {
  const b = obj(raw);
  return {
    aiEnabled: !!b.aiEnabled,
    freeAiDailyLimit: num(b.freeAiDailyLimit),
    proAiDailyLimit: num(b.proAiDailyLimit),
    bookingDiscountEnabled: !!b.bookingDiscountEnabled,
    bookingDiscountPercent: num(b.bookingDiscountPercent),
    bookingDiscountMax: num(b.bookingDiscountMax),
    familyEnabled: !!b.familyEnabled,
    deliveryEnabled: !!b.deliveryEnabled,
    deliveryFreeAbove: num(b.deliveryFreeAbove),
    deliveryPercentOff: num(b.deliveryPercentOff),
    cancelEnabled: !!b.cancelEnabled,
    proFreeCancelHours: num(b.proFreeCancelHours),
    baseFreeCancelHours: num(b.baseFreeCancelHours),
    supportEnabled: !!b.supportEnabled,
  };
};

const adaptSubscription = (raw: unknown): IProSubscription | null => {
  const s = obj(raw);
  if (!s._id || !s.expiresAt) return null;
  const state = ["active", "scheduled", "expired", "cancelled"].includes(String(s.state))
    ? (String(s.state) as IProSubscription["state"])
    : "expired";
  return {
    _id: String(s._id),
    days: num(s.days),
    startedAt: String(s.startedAt || ""),
    expiresAt: String(s.expiresAt || ""),
    state,
    daysLeft: s.daysLeft === null || s.daysLeft === undefined ? null : num(s.daysLeft),
    listPrice: num(s.listPrice),
    paid: num(s.paid),
    granted: !!s.granted,
  };
};

export const adaptProPricing = (raw: unknown): IProPricing => {
  const d = obj(raw);
  const licenses = Array.isArray(d.licenses) ? d.licenses : [];
  const plan = obj(licenses[0]);
  const quotes = obj(d.quotes);
  const planId = plan._id ? String(plan._id) : "";
  const list = planId && Array.isArray(quotes[planId]) ? (quotes[planId] as unknown[]) : [];
  return {
    plan: planId
      ? { _id: planId, displayName: String(plan.displayName || ""), summary: String(plan.summary || "") }
      : null,
    options: list.filter((q) => q && typeof q === "object").map(adaptQuote).filter((q) => q.days > 0),
    promotions: (Array.isArray(d.promotions) ? d.promotions : []).filter(
      (p): p is ILicensePromotionInfo => !!p && typeof p === "object" && !!(p as ILicensePromotionInfo).endsAt,
    ),
    code: typeof d.code === "string" ? d.code : "",
    codeValid: typeof d.codeValid === "boolean" ? d.codeValid : null,
    onSale: d.onSale !== false && !!planId,
    benefits: adaptBenefits(d.benefits),
  };
};

const adaptMyPro = (raw: unknown): IMyPro => {
  const d = obj(raw);
  const ai = obj(d.ai);
  return {
    ...adaptProPricing(raw),
    active: !!d.active,
    until: typeof d.until === "string" ? d.until : null,
    current: adaptSubscription(d.current),
    history: (Array.isArray(d.history) ? d.history : [])
      .map(adaptSubscription)
      .filter((s): s is IProSubscription => !!s),
    ai: {
      pro: !!ai.pro,
      limit: num(ai.limit),
      used: num(ai.used),
      remaining: ai.remaining === null || ai.remaining === undefined ? null : num(ai.remaining),
    },
    freeCancelHours: num(d.freeCancelHours),
  };
};

const withCode = (url: string, code?: string) =>
  code ? `${url}?code=${encodeURIComponent(code)}` : url;

export const PRO_ME_URL = `${API}/pro/me`;

export const useProPricing = (code?: string) =>
  useSWR<IProPricing>(
    withCode(`${API}/pro/pricing`, code),
    (url: string) => fetcher({ url }).then((res) => adaptProPricing(res?.data)),
    { revalidateOnFocus: false },
  );

// the signed-in user's membership; nothing is fetched for a visitor
export const useMyPro = (code?: string) => {
  const { user } = useUser();
  return useSWR<IMyPro>(
    user ? withCode(PRO_ME_URL, code) : null,
    (url: string) => fetcher({ url }).then((res) => adaptMyPro(res?.data)),
    { revalidateOnFocus: false },
  );
};

// a monthly price for the "per month" line of an option
export const perMonth = (q: ILicenseQuote) => (q.days > 0 ? Math.round((q.quoted / q.days) * 30) : 0);
