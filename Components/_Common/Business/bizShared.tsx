"use client";

import { createContext, useContext, useMemo } from "react";
import { API, FilePath } from "@/Components/config";
import { useIntlLocale } from "@/Components/i18n/navigation";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

// Shared bits of the Noyan Business accounting page (2026-10): which API the
// page talks to (/<panel>/biz or /admin/finance/biz), whether the viewer may
// write, the texts and the number/date formats.

export const BIZ_NS: ContentNamespace[] = ["common", "bizAccounting"];

export type BizAccount = {
  _id: string;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "income" | "expense";
  level: "group" | "total" | "detail";
  parentCode?: string;
  role?: string;
  // (2026-10, the chart editor) deactivated accounts take no new lines;
  // the تفصیلی kinds a detail account takes; ماهیت and دائم / موقت
  isActive?: boolean;
  tafsiliKinds?: string[];
  nature?: "debit" | "credit" | "both";
  permanent?: boolean;
  description?: string;
  bD?: number;
  bC?: number;
  pD: number;
  pC: number;
  before: number;
  period: number;
  balance: number;
};

export type BizVoucherLine = {
  account: { _id: string; code: string; name: string } | string | null;
  code: string;
  label?: string;
  debit: number;
  credit: number;
};

export type BizVoucher = {
  _id: string;
  number: number;
  date: string;
  kind: "auto" | "manual" | "opening" | "closing";
  description: string;
  total: number;
  lines: BizVoucherLine[];
  source?: { type: string; id: string };
  // a year-end close's own voucher (pl, final = اختتامیه, open = افتتاحیه)
  phase?: "pl" | "final" | "open";
  fiscalYear?: number;
  // the real date of an automatic voucher that came after its year closed
  actualDate?: string;
  // the cost centre a hand-typed voucher was booked to
  center?: string;
};

// canApprove: finalize / revert / delete final vouchers and decide finance
// requests (approveVouchers); platform: the super admin's own books, which
// have no tills or banks of their own (2026-10)
type Ctx = { api: string; canWrite: boolean; canApprove?: boolean; platform?: boolean };
export const BizContext = createContext<Ctx>({ api: "", canWrite: false });
export const useBiz = () => useContext(BizContext);

export const useBizText = () => useScopedLocale(BIZ_NS);

export const useBizFormat = () => {
  const tag = useIntlLocale();
  return useMemo(() => {
    const num = new Intl.NumberFormat(tag, { maximumFractionDigits: 0 });
    const pct = new Intl.NumberFormat(tag, { style: "percent", maximumFractionDigits: 2 });
    // a Jalali fiscal year (1404), in the reader's digits, never grouped
    const yearNum = new Intl.NumberFormat(tag, { useGrouping: false });
    // fiscal year bounds are Tehran midnights; shown as Tehran sees them
    const tehran = new Intl.DateTimeFormat(tag, { year: "numeric", month: "short", day: "numeric", timeZone: "Asia/Tehran" });
    const date = new Intl.DateTimeFormat(tag, { year: "numeric", month: "short", day: "numeric" });
    const month = new Intl.DateTimeFormat(tag, { month: "short" });
    // the books' month buckets are Jalali months as Tehran sees them:
    // named that way in every language (a Gregorian name would straddle two)
    const jMonth = new Intl.DateTimeFormat(tag, { month: "short", calendar: "persian", timeZone: "Asia/Tehran" });
    const safe = (f: Intl.DateTimeFormat, v?: string | Date | null) => {
      const d = v ? new Date(v) : null;
      return d && !Number.isNaN(d.getTime()) ? f.format(d) : "—";
    };
    return {
      money: (n?: number) => num.format(Math.round(Number(n) || 0)),
      // 15 -> "۱۵٪" / "15%", the reader's own sign and side
      percent: (n?: number) => pct.format((Number(n) || 0) / 100),
      year: (y?: number) => (y ? yearNum.format(y) : "—"),
      tehranDate: (v?: string | Date | null) => safe(tehran, v),
      // a negative balance in parentheses, the way statements show it
      signed: (n?: number) => {
        const v = Math.round(Number(n) || 0);
        return v < 0 ? `(${num.format(-v)})` : num.format(v);
      },
      date: (v?: string | Date | null) => safe(date, v),
      month: (v?: string | Date | null) => safe(month, v),
      jMonth: (v?: string | Date | null) => safe(jMonth, v),
    };
  }, [tag]);
};

// YYYY-MM-DD of a local date, the format the API takes
export const isoDay = (d?: Date | null) => {
  if (!d || Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export const asArray = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

// A finance file (receipt, bill, voucher scan) is private (2026-10): it is
// read back through the panel's own authenticated route, never from the
// public files folder. `api` is the context's /<node>/biz or
// /<node>/biz/finance; a full URL is shown as it is.
export const bizFileHref = (api: string, name: string) =>
  /^https?:\/\//.test(name) ? name : /^biz__/.test(name) ? `${API}${api.replace(/\/finance$/, "")}/finance/files/${encodeURIComponent(name)}` : `${FilePath}/${name}`;
