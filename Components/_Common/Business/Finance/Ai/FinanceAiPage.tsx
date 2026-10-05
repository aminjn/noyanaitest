"use client";

import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import { NodeWithAcl } from "@/Components/_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";
import classes from "../../Accounting.module.css";
import { useBizFormat } from "../../bizShared";
import FinanceShell from "../FinanceShell";
import { ExpenseForm, FORM_KEY } from "../FinanceExpenses";
import { useFin, useFinPopup, useFinText, useTabParam } from "../finShared";
import { AiOff, FinAiGate, finProfileOf, useFinAiStatus } from "./finAi";
import { AiQuota } from "@/Components/Ai/AiLocked";
import BooksCopilot from "./BooksCopilot";
import SentenceEntry from "./SentenceEntry";
import ReceiptOcr from "./ReceiptOcr";
import CashForecast from "./CashForecast";
import Anomalies from "./Anomalies";
import BankLines from "./BankLines";

const Ocr = () => {
  const { open } = useFinPopup();
  return <ReceiptOcr onDraft={(d) => open(FORM_KEY, <ExpenseForm initial={d.expense} onDone={() => undefined} />)} />;
};

const TAB_FEATURE: Record<string, string> = { copilot: "finance.copilot", entry: "finance.entry", ocr: "finance.receipt" };

const Body = () => {
  const t = useFinText();
  const f = useBizFormat();
  const { canWrite } = useFin();
  const view = useTabParam("copilot");
  const { data: status } = useFinAiStatus();
  const { api } = useFin();
  const profile = finProfileOf(api);
  return (
    <>
      {!!status && !status.enabled && <AiOff status={status} />}
      {!!status?.enabled && (
        <p className={classes.muted}>
          {t(status.inCountry ? "faiInCountry" : "faiCloud")}
          {status.limit > 0 && <> · {t("faiUsage", [f.money(status.used), f.money(status.limit)])}</>}
        </p>
      )}
      {/* today's quota of the open tool (nothing when unlimited) */}
      {!!status?.enabled && !!TAB_FEATURE[view[0]] && <AiQuota profile={profile} state={status.features?.[TAB_FEATURE[view[0]]]} />}
      <ClientTabSystem
        viewState={view}
        items={[
          // each tool under its AI policy feature (locked / off / quota)
          { id: "copilot", title: t("faiTabCopilot"), content: <FinAiGate feature="finance.copilot"><BooksCopilot /></FinAiGate> },
          { id: "entry", title: t("faiTabEntry"), content: <FinAiGate feature="finance.entry"><SentenceEntry /></FinAiGate>, exclude: !canWrite },
          { id: "ocr", title: t("faiTabOcr"), content: <FinAiGate feature="finance.receipt"><Ocr /></FinAiGate>, exclude: !canWrite },
          { id: "forecast", title: t("faiTabForecast"), content: <CashForecast /> },
          { id: "anomalies", title: t("faiTabAnomalies"), content: <Anomalies /> },
          { id: "bank", title: t("faiTabBank"), content: <BankLines />, exclude: !canWrite },
        ]}
      />
    </>
  );
};

// «مالی و حسابداری» → دستیار هوش مصنوعی (2026-10): Nexxa's AI pages in one
// page of tabs - the books copilot, entry by sentence or voice, receipt
// reading, the cash forecast, anomalies and bank-line categorisation. The
// figures are the panel's own; every AI result is a draft to confirm.
const FinanceAiPage = ({ node, panel }: { node: NodeWithAcl; panel: string }) => (
  <FinanceShell node={node} panel={panel} title="faiPageTitle" subtitle="faiPageSubtitle" segment="ai">
    <Body />
  </FinanceShell>
);

export default FinanceAiPage;
