"use client";

import { useState } from "react";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import classes from "./Accounting.module.css";
import { BizContext, useBizText } from "./bizShared";
import AccountingSummary from "./AccountingSummary";
import AccountingBudget from "./AccountingBudget";
import AccChart from "./Acc/AccChart";
import AccParties from "./Acc/AccParties";
import AccJournal from "./Acc/AccJournal";
import AccBooks from "./Acc/AccBooks";
import AccTrial from "./Acc/AccTrial";
import AccStatements from "./Acc/AccStatements";
import AccCenters from "./Acc/AccCenters";
import AccTax from "./Acc/AccTax";
import AccYears from "./Acc/AccYears";
import AccHealth from "./Acc/AccHealth";
import { useAccText, useView } from "./Acc/accShared";

// Noyan Business accounting (2026-10, docs/business-suite.md): one page for
// every provider panel and for the platform's own books in the super admin.
// The books are written automatically from every visit, sale, settlement
// and withdrawal; this page reads them and takes the entries Noyan cannot
// know. Since the Nexxa-parity work its tabs follow Nexxa's accounting
// pages: the chart (گروه / کل / معین), the تفصیلی register and statements,
// the journal with draft and final vouchers, the books, the 2/4/6/8-column
// trial balance, the statements with notes, cost centres and allocation,
// budget, tax (VAT and ماده‌ی ۱۶۹), the fiscal year with opening balances,
// and control (data health, audit trail).
const TABS = ["summary", "journal", "books", "trial", "statements", "accounts", "parties", "centers", "budget", "tax", "years", "health"] as const;

const AccountingPage = ({
  api,
  canWrite,
  canApprove,
  platform,
  hideHeader,
}: {
  // "/pharmacy/biz", "/admin/finance/biz", ...
  api: string;
  canWrite: boolean;
  // finalize / revert / delete final vouchers, decide requests; the
  // writer's access when not given
  canApprove?: boolean;
  // the platform's books: no tills, banks or practice documents of its own
  platform?: boolean;
  hideHeader?: boolean;
}) => {
  const t = useBizText();
  const ta = useAccText();
  // a write in one tab refreshes the others
  const [refreshKey, setRefreshKey] = useState(0);
  const bump = () => setRefreshKey((k) => k + 1);
  const [tab, setTab] = useView(TABS, "summary", "tab");
  const approve = canApprove ?? canWrite;
  return (
    <BizContext.Provider value={{ api, canWrite, canApprove: approve, platform }}>
      <div className={classes.main}>
        {!hideHeader && (
          <header className={classes.header}>
            <h1 className={classes.title}>{t("bizTitle")}</h1>
            <span className={classes.subtitle}>{t("bizSubtitle")}</span>
          </header>
        )}
        <ClientTabSystem
          viewState={[tab, (v) => setTab(v as (typeof TABS)[number])]}
          items={[
            { id: "summary", title: t("bizTabSummary"), content: <AccountingSummary key={`s${refreshKey}`} onChanged={bump} /> },
            { id: "journal", title: ta("accTabJournal"), content: <AccJournal refreshKey={refreshKey} onChanged={bump} /> },
            { id: "books", title: ta("accTabBooks"), content: <AccBooks key={`b${refreshKey}`} /> },
            { id: "trial", title: ta("bizTrialBalance"), content: <AccTrial refreshKey={refreshKey} /> },
            { id: "statements", title: ta("accTabStatements"), content: <AccStatements refreshKey={refreshKey} /> },
            { id: "accounts", title: ta("accTabChart"), content: <AccChart refreshKey={refreshKey} /> },
            { id: "parties", title: ta("accTabParties"), content: <AccParties key={`p${refreshKey}`} /> },
            { id: "centers", title: ta("bizCostCenters"), content: <AccCenters refreshKey={refreshKey} /> },
            { id: "budget", title: t("bizTabBudget"), content: <AccountingBudget refreshKey={refreshKey} /> },
            { id: "tax", title: ta("accTabTax"), content: <AccTax refreshKey={refreshKey} onChanged={bump} /> },
            { id: "years", title: t("bizTabYears"), content: <AccYears refreshKey={refreshKey} onChanged={bump} /> },
            { id: "health", title: ta("accTabControl"), content: <AccHealth refreshKey={refreshKey} /> },
          ]}
        />
      </div>
    </BizContext.Provider>
  );
};

export default AccountingPage;
