"use client";

import { ReactNode, useCallback, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import Link from "@/Components/i18n/Link";
import SparkIcon from "@/Components/Icons/SparkIcon";
import { useFin, useFinText } from "../finShared";
import AiLocked, { aiGateOf, AiFeatureState, gateOfState } from "@/Components/Ai/AiLocked";
import { AiProfile } from "@/Components/Ai/aiShared";
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
  // each finance AI feature's state and quota in the AI policy (2026-10)
  features?: Record<string, AiFeatureState>;
};

export type FinAiFeature =
  | "finance.receipt"
  | "finance.entry"
  | "finance.journal"
  | "finance.copilot"
  | "finance.insight"
  | "finance.categorize"
  | "finance.payslip"
  | "finance.voice";

// the panel profile of a finance API ("/doctor/biz/finance" -> doctor)
export const finProfileOf = (api?: string) => ((api || "").split("/").filter(Boolean)[0] || "doctor") as AiProfile;

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

// POST to /<panel>/biz/finance/ai/<path>; a refusal of the AI policy
// (plan, quota) refreshes the status, so the tool shows its locked state
export const useFinAiPost = (api?: string) => {
  const base = useFinAiApi(api);
  const { mutate } = useSWRConfig();
  return useCallback(
    async <T,>(path: string, payload?: Record<string, unknown>, form?: boolean): Promise<T> => {
      try {
        const res = await fetcher({ url: `${API}${base}/ai/${path}`, method: "POST", payload, bodyParser: form ? "FORM" : "JSON" });
        mutate(`${API}${base}/ai/status`);
        return res.data as T;
      } catch (err) {
        if (aiGateOf(err)) mutate(`${API}${base}/ai/status`);
        throw err;
      }
    },
    [base, mutate],
  );
};

// One finance AI tool under the AI policy: hidden when the super admin
// switched the feature off, the locked / limit-reached state when the plan
// lacks it or its quota is used up, the tool itself otherwise.
export const FinAiGate = ({ feature, api, compact, children }: { feature: FinAiFeature; api?: string; compact?: boolean; children: ReactNode }) => {
  const base = useFinAiApi(api);
  const { data: status } = useFinAiStatus(api);
  const st = status?.features?.[feature];
  if (st?.state === "off") return null;
  const gate = gateOfState(st);
  if (gate) return <AiLocked profile={finProfileOf(base)} gate={gate} compact={compact} />;
  return <>{children}</>;
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
  // the AI policy's "finance.insight": off, locked or used up
  const st = status.features?.["finance.insight"];
  if (st?.state === "off") return null;
  if (gateOfState(st)) return <FinAiGate feature="finance.insight" api={api} compact>{null}</FinAiGate>;
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
