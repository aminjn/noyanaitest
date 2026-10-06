"use client";

import { useState } from "react";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import SparkIcon from "@/Components/Icons/SparkIcon";
import { useFinText } from "../finShared";
import ai from "./FinAi.module.css";
import { errorText, FinAiGate, useFinAiStatus } from "./finAi";

// Nexxa's payslip assistant (/api/ai/payslip): the payroll engine's own
// figures for one slip, explained and checked for completeness by the AI.
// `api` is the panel's payroll API ("/doctor/payroll").
const PayslipAssistant = ({ api, runId, employee }: { api: string; runId: string; employee: string }) => {
  const t = useFinText();
  const finApi = api.replace(/\/payroll$/, "/biz/finance");
  const { data: status } = useFinAiStatus(finApi);
  const [text, setText] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!status?.enabled || !api) return null;
  const run = async () => {
    setBusy(true);
    try {
      const res = await fetcher({ url: `${API}${api}/ai/payslip`, method: "POST", payload: { run: runId, employee } });
      setText(String(res.data?.ai || t("faiPayslipNoAi")));
    } catch (err) {
      setText(errorText(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <FinAiGate feature="finance.payslip" api={finApi} compact>
      {text === null ? (
    <button type="button" className={ai.aiButton} onClick={run} disabled={busy} aria-busy={busy}>
      <SparkIcon />
      {busy ? t("faiThinking") : t("faiPayslipExplain")}
    </button>
  ) : (
    <div className={ai.insightBox}>
      <div className={ai.insightHead}>
        <SparkIcon />
        {t("faiPayslipExplain")}
        <span className={ai.insightTools}>
          <button type="button" className={ai.iconBtn} onClick={() => setText(null)}>
            {t("faiClose")}
          </button>
        </span>
      </div>
      <div className={ai.insightText}>{text}</div>
      <p className={ai.note}>{t("faiPayslipNote")}</p>
    </div>
      )}
    </FinAiGate>
  );
};

export default PayslipAssistant;
