"use client";

import { createContext, useContext } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { asArray } from "../bizShared";

// Shared bits of the Noyan Business inventory page (2026-10): which API it
// talks to (/<panel>/inv), whether the viewer may write, which panel kind
// (a pharmacy's goods are its products), the texts.

export const INV_NS: ContentNamespace[] = ["common", "bizAccounting", "bizInventory"];
export const useInvText = () => useScopedLocale(INV_NS);

export type InvItem = {
  _id: string;
  name: string;
  kind: "goods" | "supply";
  // a pharmacy's goods by class: their own stock, income and cost accounts
  itemClass?: "drug" | "otc" | "cosmetic";
  product?: string;
  sku?: string;
  barcode?: string;
  unit?: string;
  reorderPoint: number;
  maxStock: number;
  lastCost: number;
  tracked: boolean;
  isActive: boolean;
  stock: number;
  value: number;
  nextExpiry: string | null;
  expiredQty: number;
  nearQty: number;
  monthlyDemand: number;
  suggested: number;
  low: boolean;
};

export type InvLot = {
  _id: string;
  lotNo?: string;
  expiry?: string;
  qty: number;
  received: number;
  unitCost: number;
  receivedAt: string;
};

export type InvSupplier = {
  _id: string;
  name: string;
  phone?: string;
  economicCode?: string;
  address?: string;
  note?: string;
  isActive: boolean;
  total: number;
  paid: number;
  due: number;
  count: number;
};

type Ref = { _id: string; name: string; unit?: string; kind?: string } | null;

export type InvPurchase = {
  _id: string;
  number: number;
  supplier: { _id: string; name: string; phone?: string } | null;
  invoiceNo?: string;
  date: string;
  status: "draft" | "received" | "cancelled";
  lines: { item: Ref; qty: number; unitCost: number; lotNo?: string; expiry?: string }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid: number;
  payments: { _id: string; amount: number; via: { _id: string; code: string; name: string } | null; date: string; note?: string; voidedAt?: string; voidReason?: string }[];
  note?: string;
};

export type InvMove = {
  _id: string;
  item: Ref;
  kind: string;
  qty: number;
  unitCost: number;
  value: number;
  shortage?: number;
  date: string;
  note?: string;
};

type Ctx = { api: string; canWrite: boolean; kind: string };
export const InvContext = createContext<Ctx>({ api: "", canWrite: false, kind: "" });
export const useInv = () => useContext(InvContext);

export const useInvItems = () => {
  const { api } = useInv();
  return useSWR<InvItem[]>(`${API}${api}/items`, (url: string) =>
    fetcher({ url }).then((res) => asArray<InvItem>(res.data)),
  );
};

export const useInvSuppliers = () => {
  const { api } = useInv();
  return useSWR<InvSupplier[]>(`${API}${api}/suppliers`, (url: string) =>
    fetcher({ url }).then((res) => asArray<InvSupplier>(res.data)),
  );
};

export const toNum = (s: string | number) => Number(String(s).replace(/[^\d.]/g, "")) || 0;

// a quantity: whole numbers as they are, fractions to two places
export const qtyText = (n: number | undefined, tag: string) =>
  new Intl.NumberFormat(tag, { maximumFractionDigits: 2 }).format(Number(n) || 0);
