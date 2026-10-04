"use client";

import { useCallback, useMemo } from "react";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { useIntlLocale } from "@/Components/i18n/navigation";

// texts and formats of the CRM's public pages (bizCrm keys "crmsPub...")
const NS = ["common", "bizCrm"] as ContentNamespace[];
export const usePublicText = () => {
  const t = useScopedLocale(NS);
  return useCallback((key: string, vars?: string[]) => t(key as ContentKey, vars), [t]);
};
export const usePublicFormat = () => {
  const tag = useIntlLocale();
  return useMemo(() => {
    const num = new Intl.NumberFormat(tag, { maximumFractionDigits: 0 });
    const date = new Intl.DateTimeFormat(tag, { dateStyle: "medium" });
    return {
      money: (n?: number) => num.format(Math.round(Number(n) || 0)),
      date: (v?: string) => {
        const d = v ? new Date(v) : null;
        return d && !Number.isNaN(d.getTime()) ? date.format(d) : "—";
      },
    };
  }, [tag]);
};
export const errorOf = (err: unknown) => (err as Error)?.message || String(err);
