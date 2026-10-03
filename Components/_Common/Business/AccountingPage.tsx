"use client";

import { useState } from "react";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import classes from "./Accounting.module.css";
import { BizContext, useBizText } from "./bizShared";
import AccountingSummary from "./AccountingSummary";
import AccountingVouchers from "./AccountingVouchers";
import AccountingAccounts from "./AccountingAccounts";
import AccountingReports from "./AccountingReports";
import AccountingYears from "./AccountingYears";
import AccountingBudget from "./AccountingBudget";
import AccountingVat from "./AccountingVat";

// Noyan Business accounting (2026-10, docs/business-suite.md): one page for
// every provider panel and for the platform's own books in the super admin.
// The books are written automatically from every visit, sale, settlement
// and withdrawal; this page reads them and takes the entries Noyan cannot
// know (rent, salaries paid outside, cash income).
const AccountingPage = ({
  api,
  canWrite,
  hideHeader,
}: {
  // "/pharmacy/biz", "/admin/finance/biz", ...
  api: string;
  canWrite: boolean;
  hideHeader?: boolean;
}) => {
  const t = useBizText();
  // a write in one tab refreshes the others
  const [refreshKey, setRefreshKey] = useState(0);
  const bump = () => setRefreshKey((k) => k + 1);
  return (
    <BizContext.Provider value={{ api, canWrite }}>
      <div className={classes.main}>
        {!hideHeader && (
          <header className={classes.header}>
            <h1 className={classes.title}>{t("bizTitle")}</h1>
            <span className={classes.subtitle}>{t("bizSubtitle")}</span>
          </header>
        )}
        <ClientTabSystem
          items={[
            { id: "summary", title: t("bizTabSummary"), content: <AccountingSummary key={`s${refreshKey}`} onChanged={bump} /> },
            { id: "vouchers", title: t("bizTabVouchers"), content: <AccountingVouchers refreshKey={refreshKey} onChanged={bump} /> },
            { id: "accounts", title: t("bizTabAccounts"), content: <AccountingAccounts refreshKey={refreshKey} /> },
            { id: "reports", title: t("bizTabReports"), content: <AccountingReports refreshKey={refreshKey} /> },
            { id: "budget", title: t("bizTabBudget"), content: <AccountingBudget refreshKey={refreshKey} /> },
            { id: "vat", title: t("bizTabVat"), content: <AccountingVat refreshKey={refreshKey} onChanged={bump} /> },
            { id: "years", title: t("bizTabYears"), content: <AccountingYears refreshKey={refreshKey} onChanged={bump} /> },
          ]}
        />
      </div>
    </BizContext.Provider>
  );
};

export default AccountingPage;
