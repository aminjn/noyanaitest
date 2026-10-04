"use client";

import { createContext, ReactNode, useCallback, useContext } from "react";
import useSWR from "swr";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/Components/i18n/navigation";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { NodeWithAcl } from "@/Components/_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";
import usePopup from "@/Components/Hooks/usePopup";
import { asArray, BizContext, useBiz } from "../bizShared";
import fin from "./Finance.module.css";

// Shared bits of the practice-finance suite (2026-10, «مالی و حسابداری»):
// which panel it is, the API (/<node>/biz/finance, behind the accounting
// routes' access and plan module), whether the viewer may write, the texts,
// the shapes the API returns and a few helpers (amounts typed with Persian
// digits, CSV export, the tab kept in the URL).

// "bizFinance" is new (handed off with the suite's keys); every text of the
// current language is loaded already, the namespace only groups them
export const FIN_NS = ["common", "bizAccounting", "bizFinance" as ContentNamespace] as ContentNamespace[];

// the suite's keys are not in contentKeys until the handoff is merged
export const useFinText = () => {
  const t = useScopedLocale(FIN_NS);
  return useCallback((key: string, vars?: string[]) => t(key as ContentKey, vars), [t]);
};

type Ctx = { node: NodeWithAcl; panel: string; api: string; canWrite: boolean };
export const FinContext = createContext<Ctx>({ node: "doctor", panel: "", api: "", canWrite: false });
export const useFin = () => useContext(FinContext);

export const InsurerKinds = ["tamin", "salamat", "armed", "supplementary", "other"] as const;
export type InsurerKind = (typeof InsurerKinds)[number];
export const insurerKey = (k?: string) =>
  ({ tamin: "finInsTamin", salamat: "finInsSalamat", armed: "finInsArmed", supplementary: "finInsSupplementary", other: "finInsOther" })[k || "other"] ||
  "finInsOther";

export type FinMoney = {
  _id: string;
  kind: "cash" | "bank" | "pos" | "wallet";
  name: string;
  code: string;
  role?: string;
  bankName?: string;
  accountNumber?: string;
  sheba?: string;
  isActive: boolean;
  balance: number;
  cleared: number;
  statementBalance?: number;
  statementDate?: string;
};

export type FinInvoiceLine = {
  title: string;
  qty: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  account?: string | { _id: string; code: string; name: string } | null;
  net: number;
  tax: number;
};

export type FinInvoice = {
  _id: string;
  number: number;
  origin: "platform" | "manual";
  date: string;
  dueDate?: string;
  party: { name: string; phone?: string; nationalId?: string };
  doctorName?: string;
  lines: FinInvoiceLine[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  insurer?: { kind: InsurerKind; name: string; share: number };
  patientShare: number;
  paid: number;
  status: "draft" | "issued" | "partial" | "paid" | "void";
  note?: string;
  voidReason?: string;
  smsSentAt?: string;
  claim?: string | { _id: string; number: number; status: string };
  moadian?: string | { _id: string; taxId: string; status: string };
  center?: string;
  link?: string;
  payments?: FinPayment[];
};

export type FinCheque = {
  number: string;
  bank: string;
  branch?: string;
  sayad?: string;
  dueDate: string;
  status: "pending" | "cleared" | "bounced" | "returned";
  statusAt?: string;
  history?: { status: string; at: string; note?: string }[];
};

export type FinPayment = {
  _id: string;
  number: number;
  direction: "in" | "out";
  date: string;
  amount: number;
  method: "cash" | "card" | "transfer" | "cheque" | "wallet";
  money?: { _id: string; name: string; kind: string } | string | null;
  against: "invoice" | "claim" | "expense" | "account";
  invoice?: { _id: string; number: number } | string | null;
  claim?: { _id: string; number: number } | string | null;
  expense?: { _id: string; number: number } | string | null;
  account?: { _id: string; code: string; name: string } | string | null;
  party?: string;
  description?: string;
  reference?: string;
  cheque?: FinCheque;
  isVoid: boolean;
};

export type FinExpense = {
  _id: string;
  number: number;
  date: string;
  dueDate?: string;
  account: { _id: string; code: string; name: string } | string | null;
  vendor?: string;
  description: string;
  amount: number;
  tax: number;
  total: number;
  paid: number;
  center?: { _id: string; name: string } | string | null;
  attachment?: string;
  isVoid: boolean;
  recurring?: { interval: "monthly" | "quarterly" | "yearly"; nextDate: string; until?: string; isActive: boolean };
};

export type FinClaim = {
  _id: string;
  number: number;
  insurer: { kind: InsurerKind; name: string };
  from?: string;
  to?: string;
  items?: { invoice?: string; date: string; patient: string; service: string; total: number; share: number }[];
  claimed: number;
  paid: number;
  deducted: number;
  status: "draft" | "submitted" | "partial" | "paid" | "rejected";
  submittedAt?: string;
  trackingCode?: string;
  rejectReason?: string;
  deductions?: { amount: number; reason: string; at: string }[];
  note?: string;
  payments?: FinPayment[];
  createdAt: string;
};

export const nameOf = (v: unknown, fallback = "—"): string =>
  v && typeof v === "object" && "name" in (v as Record<string, unknown>) ? String((v as { name?: string }).name || fallback) : fallback;
export const numberOf = (v: unknown): number | null =>
  v && typeof v === "object" && "number" in (v as Record<string, unknown>) ? Number((v as { number?: number }).number) : null;
export const idOf = (v: unknown): string =>
  v && typeof v === "object" ? String((v as { _id?: string })._id || "") : typeof v === "string" ? v : "";

// "۱٬۲۵۰٬۰۰۰" or "1,250,000" -> 1250000
export const parseAmount = (s: string) => {
  const latin = String(s || "")
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  const n = Number(latin.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

// a CSV the reader's spreadsheet opens with the right letters (BOM)
export const downloadCsv = (name: string, rows: (string | number | null | undefined)[][]) => {
  const esc = (v: string | number | null | undefined) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const blob = new Blob(["﻿" + rows.map((r) => r.map(esc).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// The page's tab in the URL (?tab=cheques), so a link or a notification
// opens the right one and the back button keeps it.
export const useTabParam = (fallback: string): [string, (v: string) => void] => {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const current = params?.get("tab") || fallback;
  const set = useCallback(
    (v: string) => {
      const next = new URLSearchParams(params?.toString() || "");
      next.set("tab", v);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );
  return [current, set];
};

// A popup is drawn outside the page's providers: this one carries the
// suite's and the accounting contexts into it.
export const useFinPopup = () => {
  const ctx = useFin();
  const biz = useBiz();
  const { setPopup, closePopup } = usePopup();
  const open = useCallback(
    (key: string, node: ReactNode) =>
      setPopup(
        key,
        <BizContext.Provider value={biz}>
          <FinContext.Provider value={ctx}>{node}</FinContext.Provider>
        </BizContext.Provider>,
      ),
    [biz, ctx, setPopup],
  );
  return { open, close: closePopup };
};

export const useMoneyAccounts = () => {
  const { api } = useFin();
  return useSWR<FinMoney[]>(api ? `${API}${api}/money` : null, (url: string) => fetcher({ url }).then((res) => asArray<FinMoney>(res.data)));
};

const TONE: Record<string, string> = {
  draft: fin.toneMuted,
  issued: fin.toneInfo,
  submitted: fin.toneInfo,
  pending: fin.toneInfo,
  partial: fin.toneWarn,
  paid: fin.toneOk,
  cleared: fin.toneOk,
  void: fin.toneMuted,
  returned: fin.toneMuted,
  rejected: fin.toneBad,
  bounced: fin.toneBad,
  overdue: fin.toneBad,
};

export const Pill = ({ status, children }: { status: string; children: ReactNode }) => (
  <span className={`${fin.pill} ${TONE[status] || fin.toneMuted}`}>{children}</span>
);

export const statusKey = (s: string) =>
  ({
    draft: "finStDraft",
    issued: "finStIssued",
    partial: "finStPartial",
    paid: "finStPaid",
    void: "finStVoid",
    submitted: "finStSubmitted",
    rejected: "finStRejected",
    pending: "finChqPending",
    cleared: "finChqCleared",
    bounced: "finChqBounced",
    returned: "finChqReturned",
  })[s] || s;

export const methodKey = (m: string) =>
  ({ cash: "finMethodCash", card: "finMethodCard", transfer: "finMethodTransfer", cheque: "finMethodCheque", wallet: "finMethodWallet" })[m] || m;

export const moneyKindKey = (k: string) => ({ cash: "finKindCash", bank: "finKindBank", pos: "finKindPos", wallet: "finKindWallet" })[k] || k;
