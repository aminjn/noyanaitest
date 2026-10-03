"use client";

import { createContext, useContext } from "react";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";

// Shared bits of the Noyan Business Moadian page (2026-10): which API it
// talks to (/<panel>/moadian or /admin/finance/moadian), whether the viewer
// may change anything, the texts and the shapes.

export const MOADIAN_NS: ContentNamespace[] = ["common", "bizAccounting", "bizMoadian"];
export const useMoadianText = () => useScopedLocale(MOADIAN_NS);

export type MoadianItemKind = "visit" | "service" | "test" | "product" | "package" | "shipping" | "commission" | "subscription" | "sms";
export type MoadianStatus = "Queued" | "Sent" | "Accepted" | "Rejected" | "Dropped";
export type MoadianSource = "visit" | "sale" | "shipping" | "reversal" | "license" | "sms" | "commission" | "manual";

export type MoadianSettings = {
  isActive: boolean;
  activeFrom?: string;
  env: "sandbox" | "production";
  taxpayerType: "natural" | "legal";
  name: string;
  economicCode: string;
  postalCode: string;
  memoryId: string;
  hasKey: boolean;
  publicKey: string;
  csr: string;
  certificate: string;
  keyCreatedAt?: string;
  sstid: Partial<Record<MoadianItemKind, string>>;
  unit: string;
  vatPercent: number;
  lastError?: string;
  lastErrorAt?: string;
  lastSentAt?: string;
  problems: string[];
  itemKinds: MoadianItemKind[];
  simulated: boolean;
  counts?: Record<MoadianStatus, number>;
};

export type MoadianIssue = { code?: string; message: string };

export type MoadianItem = {
  kind: MoadianItemKind;
  sstid: string;
  sstt: string;
  am: number;
  mu: string;
  fee: number;
  prdis: number;
  dis: number;
  adis: number;
  vra: number;
  vam: number;
  tsstam: number;
};

export type MoadianBuyer = {
  type: "natural" | "legal";
  nationalId?: string;
  economicCode?: string;
  name?: string;
  postalCode?: string;
};

type Ref = { _id: string; taxId: string; subject: number; status: MoadianStatus };

export type MoadianInvoice = {
  _id: string;
  source: MoadianSource;
  subject: 1 | 2 | 3 | 4;
  type: 1 | 2;
  taxId: string;
  issuedAt: string;
  party?: string;
  buyer?: MoadianBuyer;
  items?: MoadianItem[];
  total: { tprdis: number; tdis: number; tadis: number; tvam: number; tbill: number };
  status: MoadianStatus;
  referenceNumber?: string;
  taxErrors: MoadianIssue[];
  taxWarnings?: MoadianIssue[];
  of?: string | Ref | null;
  replacedBy?: string | Ref | null;
  sentAt?: string;
  decidedAt?: string;
  packet?: unknown;
};

type Ctx = { api: string; canWrite: boolean; platform: boolean };
export const MoadianContext = createContext<Ctx>({ api: "", canWrite: false, platform: false });
export const useMoadian = () => useContext(MoadianContext);

export const statusKey: Record<MoadianStatus, ContentKey> = {
  Queued: "moaStQueued",
  Sent: "moaStSent",
  Accepted: "moaStAccepted",
  Rejected: "moaStRejected",
  Dropped: "moaStDropped",
};

export const subjectKey: Record<number, ContentKey> = {
  1: "moaSubjectOriginal",
  2: "moaSubjectCorrection",
  3: "moaSubjectCancel",
  4: "moaSubjectReturn",
};

export const sourceKey: Record<MoadianSource, ContentKey> = {
  visit: "moaSrcVisit",
  sale: "moaSrcSale",
  shipping: "moaSrcShipping",
  reversal: "moaSrcReversal",
  license: "moaSrcLicense",
  sms: "moaSrcSms",
  commission: "moaSrcCommission",
  manual: "moaSrcManual",
};

export const kindKey: Record<MoadianItemKind, ContentKey> = {
  visit: "moaKindVisit",
  service: "moaKindService",
  test: "moaKindTest",
  product: "moaKindProduct",
  package: "moaKindPackage",
  shipping: "moaKindShipping",
  commission: "moaKindCommission",
  subscription: "moaKindSubscription",
  sms: "moaKindSms",
};

// the engine's own problems carry a code the page can say in its language
export const issueText = (e: MoadianIssue, t: ReturnType<typeof useMoadianText>) => {
  const [code, kind] = String(e.code || "").split(":");
  if (code === "sstid" && kind && kind in kindKey) return t("moaErrSstid", [t(kindKey[kind as MoadianItemKind])]);
  if (code === "buyer") return t("moaErrBuyer");
  return e.message;
};

// digits typed in Persian or Arabic become Latin, the way the tax ids are
export const latin = (s: string) =>
  s.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
