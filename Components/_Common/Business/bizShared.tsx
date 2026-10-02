"use client";

import { createContext, useContext, useMemo } from "react";
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
};

type Ctx = { api: string; canWrite: boolean };
export const BizContext = createContext<Ctx>({ api: "", canWrite: false });
export const useBiz = () => useContext(BizContext);

export const useBizText = () => useScopedLocale(BIZ_NS);

export const useBizFormat = () => {
  const tag = useIntlLocale();
  return useMemo(() => {
    const num = new Intl.NumberFormat(tag, { maximumFractionDigits: 0 });
    const date = new Intl.DateTimeFormat(tag, { year: "numeric", month: "short", day: "numeric" });
    const month = new Intl.DateTimeFormat(tag, { month: "short" });
    const safe = (f: Intl.DateTimeFormat, v?: string | Date | null) => {
      const d = v ? new Date(v) : null;
      return d && !Number.isNaN(d.getTime()) ? f.format(d) : "—";
    };
    return {
      money: (n?: number) => num.format(Math.round(Number(n) || 0)),
      // a negative balance in parentheses, the way statements show it
      signed: (n?: number) => {
        const v = Math.round(Number(n) || 0);
        return v < 0 ? `(${num.format(-v)})` : num.format(v);
      },
      date: (v?: string | Date | null) => safe(date, v),
      month: (v?: string | Date | null) => safe(month, v),
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
