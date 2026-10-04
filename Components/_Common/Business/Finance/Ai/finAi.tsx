"use client";

import { ReactNode, useCallback, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import Link from "@/Components/i18n/Link";
import SparkIcon from "@/Components/Icons/SparkIcon";
import { useFin, useFinText } from "../finShared";
import ai from "./FinAi.module.css";

// Shared bits of the finance assistant (2026-10, «دستیار هوش مصنوعی مالی»,
// backend Lib/business/financeAi.ts under /<panel>/biz/finance/ai): the
// status, the "not set up" notice, the warnings and Nexxa's AiInsight block.

export type FinAiStatus = {
  enabled: boolean;
  provider: string | null;
  inCountry: boolean;
  vision: "yes" | "maybe" | "no";
  voice: boolean;
  limit: number;
  used: number;
  settingsUrl: string | null;
  // the panel's profile and its copilot example questions (content keys)
  profile?: string;
  questions?: string[];
};

export type FinAiWarning = { key: string; vars?: string[] };

// the finance API of the page ("/doctor/biz/finance"); a page outside the
// finance shell passes its own
export const useFinAiApi = (api?: string) => {
  const fin = useFin();
  return api || fin.api;
};

export const useFinAiStatus = (api?: string) => {
  const base = useFinAiApi(api);
  return useSWR<FinAiStatus>(base ? `${API}${base}/ai/status` : null, (url: string) => fetcher({ url }).then((res) => res.data as FinAiStatus), {
    revalidateOnFocus: false,
  });
};

// POST to /<panel>/biz/finance/ai/<path>
export const useFinAiPost = (api?: string) => {
  const base = useFinAiApi(api);
  return useCallback(
    async <T,>(path: string, payload?: Record<string, unknown>, form?: boolean): Promise<T> => {
      const res = await fetcher({ url: `${API}${base}/ai/${path}`, method: "POST", payload, bodyParser: form ? "FORM" : "JSON" });
      return res.data as T;
    },
    [base],
  );
};

// the AI is off on this server: what to do, and for the super admin a link
// to system settings -> AI
export const AiOff = ({ status }: { status?: FinAiStatus }) => {
  const t = useFinText();
  return (
    <div className={ai.off} role="status">
      <SparkIcon />
      <span>{t("faiOff")}</span>
      {!!status?.settingsUrl && (
        <a className={ai.aiButton} href={status.settingsUrl}>
          {t("faiOpenSettings")}
        </a>
      )}
    </div>
  );
};

export const Warnings = ({ list }: { list?: FinAiWarning[] }) => {
  const t = useFinText();
  const rows = Array.isArray(list) ? list.filter((w) => w && typeof w.key === "string") : [];
  if (!rows.length) return null;
  return (
    <ul className={ai.warnings}>
      {rows.map((w, i) => (
        <li key={`${w.key}${i}`}>{t(w.key, (w.vars || []).map(String))}</li>
      ))}
    </ul>
  );
};

// a 503 from the assistant means it is not set up
export const isAiOff = (err: unknown) => (err as { status?: number })?.status === 503;

export const errorText = (err: unknown) => (err as Error)?.message || String(err);

export type InsightKind =
  | "overview"
  | "finance"
  | "invoices"
  | "payments"
  | "treasury"
  | "expenses"
  | "claims"
  | "reports"
  | "costcenter"
  | "budget"
  | "tax"
  | "bankrec"
  | "depreciation"
  | "forecast"
  | "anomalies"
  | "payroll"
  | "inventory"
  | "purchase";

// Nexxa's AiInsight (components/ai/AiInsight.tsx): a button that asks for
// an analysis of the page's figures and shows it inline, with "again" and
// "close". The figures come from the panel's own reports; the AI writes.
export const AiInsight = ({ kind, label, api, aside }: { kind: InsightKind; label?: string; api?: string; aside?: ReactNode }) => {
  const t = useFinText();
  const post = useFinAiPost(api);
  const { data: status } = useFinAiStatus(api);
  const [text, setText] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [off, setOff] = useState(false);
  const title = label || t("faiInsight");
  const run = async (fresh: boolean) => {
    setBusy(true);
    try {
      const d = await post<{ text?: string }>("insight", { kind, fresh });
      setText(String(d?.text || ""));
    } catch (err) {
      if (isAiOff(err)) setOff(true);
      else setText(errorText(err));
    } finally {
      setBusy(false);
    }
  };
  // nothing until the assistant is known to be on (off: the AI page says why)
  if (!status?.enabled) return null;
  if (off) return <AiOff status={status} />;
  return (
    <div className={ai.insight}>
      {text === null ? (
        <div className={ai.entryRow} style={{ alignItems: "center", flexWrap: "wrap" }}>
          <button type="button" className={ai.aiButton} onClick={() => run(false)} disabled={busy} aria-busy={busy}>
            <SparkIcon />
            {busy ? t("faiThinking") : title}
          </button>
          {aside}
        </div>
      ) : (
        <div className={ai.insightBox}>
          <div className={ai.insightHead}>
            <SparkIcon />
            {title}
            <span className={ai.insightTools}>
              <button type="button" className={ai.iconBtn} onClick={() => run(true)} disabled={busy}>
                {t("faiAgain")}
              </button>
              <button type="button" className={ai.iconBtn} onClick={() => setText(null)}>
                {t("faiClose")}
              </button>
            </span>
          </div>
          <div className={ai.insightText}>{busy ? t("faiThinking") : text}</div>
          <p className={ai.note}>
            {t("faiDraftNote")}
          </p>
        </div>
      )}
    </div>
  );
};

// "[T3]" markers in an answer, as links to the report the number came from
export const Cited = ({ text, sources, panel }: { text: string; sources: { ref: string; link: string }[]; panel: string }) => {
  const parts = String(text || "").split(/(\[T\d+\])/g);
  const byRef = new Map((Array.isArray(sources) ? sources : []).map((s) => [s.ref, s.link]));
  return (
    <>
      {parts.map((p, i) => {
        const m = p.match(/^\[(T\d+)\]$/);
        if (!m) return <span key={i}>{p}</span>;
        const link = byRef.get(m[1]);
        return link !== undefined ? (
          <Link key={i} className={ai.cite} href={`${panel}/finance${link ? `/${link}` : ""}`}>
            {m[1]}
          </Link>
        ) : (
          <span key={i} className={ai.cite}>
            {m[1]}
          </span>
        );
      })}
    </>
  );
};

export const sevClass = (s: string) => (s === "high" ? ai.sevHigh : s === "medium" ? ai.sevMedium : ai.sevLow);
export const sevKey = (s: string) => (s === "high" ? "faiSevHigh" : s === "medium" ? "faiSevMedium" : "faiSevLow");
