"use client";

import { createContext, useContext } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { asArray } from "../bizShared";

// Shared bits of the Noyan Business CRM page (2026-10): which API it talks
// to (/<panel>/crm), what the viewer may do (write; submit a paid campaign),
// the texts and the shapes.

export const CRM_NS: ContentNamespace[] = ["common", "bizAccounting", "bizCrm"];
export const useCrmText = () => useScopedLocale(CRM_NS);

export type CrmContact = {
  _id: string;
  name: string;
  phone: string;
  gender?: "male" | "female";
  birthYear?: number;
  city?: string;
  source: "visit" | "order" | "manual";
  tags: string[];
  note?: string;
  visits: number;
  orders: number;
  spent: number;
  firstSeenAt?: string;
  lastSeenAt?: string;
  smsOptOut: boolean;
  isActive: boolean;
};

export type CrmTimelineItem = {
  kind: "visit" | "order" | "note" | "call" | "followUp";
  at: string;
  text?: string;
  status?: string;
  id?: string;
  dueAt?: string;
  doneAt?: string;
};

export type CrmAudience = {
  tags: string[];
  sources: string[];
  gender?: "male" | "female" | null;
  inactiveDays?: number | null;
  activeDays?: number | null;
  minVisits?: number | null;
};

export type CrmCampaign = {
  _id: string;
  name: string;
  text: string;
  audience: CrmAudience;
  status: "Draft" | "Pending" | "Rejected" | "Approved" | "Sending" | "Sent" | "Cancelled";
  recipients: number;
  parts: number;
  rejectReason?: string;
  submittedAt?: string;
  sendAfter?: string;
  finishedAt?: string;
  sentCount: number;
  failedCount: number;
  fromQuota: number;
  fromWallet: number;
  charged: number;
  refunded: number;
  createdAt: string;
};

export type CrmEstimate = {
  recipients: number;
  parts: number;
  totalParts: number;
  quota: number;
  quotaLeft: number;
  fromQuota: number;
  fromWallet: number;
  unitPrice: number;
  cost: number;
  balance: number;
  affordable: boolean;
  preview: string;
  sample: string[];
};

type Ctx = { api: string; canWrite: boolean; canSend: boolean };
export const CrmContext = createContext<Ctx>({ api: "", canWrite: false, canSend: false });
export const useCrm = () => useContext(CrmContext);

export const useCrmTags = () => {
  const { api } = useCrm();
  return useSWR<string[]>(`${API}${api}/tags`, (url: string) => fetcher({ url }).then((res) => asArray<string>(res.data)));
};

export const sourceKey: Record<CrmContact["source"], ContentKey> = {
  visit: "crmSourceVisit",
  order: "crmSourceOrder",
  manual: "crmSourceManual",
};

export const statusKey: Record<CrmCampaign["status"], ContentKey> = {
  Draft: "crmStDraft",
  Pending: "crmStPending",
  Rejected: "crmStRejected",
  Approved: "crmStApproved",
  Sending: "crmStSending",
  Sent: "crmStSent",
  Cancelled: "crmStCancelled",
};

// "۰۹۱۲ ۳۴۵ ۶۷۸۹" - a phone read in groups, digits kept left-to-right
export const phoneText = (p: string) => (p && p.length === 11 ? `${p.slice(0, 4)} ${p.slice(4, 7)} ${p.slice(7)}` : p);
