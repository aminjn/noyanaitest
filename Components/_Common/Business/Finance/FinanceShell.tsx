"use client";

import { ReactNode } from "react";
import useAcl from "@/Components/Hooks/useAcl";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import { NodeWithAcl } from "@/Components/_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";
import classes from "../Accounting.module.css";
import fin from "./Finance.module.css";
import { BizContext } from "../bizShared";
import { FinContext, useFinText } from "./finShared";
import { AiInsight, InsightKind } from "./Ai/finAi";

// the finance assistant's analysis block of each page (Nexxa's AiInsight)
const INSIGHT: Record<string, InsightKind> = {
  "": "overview",
  invoices: "invoices",
  payments: "treasury",
  expenses: "expenses",
  insurance: "claims",
  reports: "reports",
};

// The frame of every «مالی و حسابداری» page (2026-10): the breadcrumb under
// the section, the page's title, and the two contexts its parts read - the
// accounting one (/<node>/biz, reused by the statements and cost centres)
// and the suite's own (/<node>/biz/finance). Writing needs the owner or a
// team member with "manageAccounting", as on the accounting page.
const FinanceShell = ({
  node,
  panel,
  title,
  subtitle,
  segment,
  actions,
  children,
}: {
  node: NodeWithAcl;
  // "/doctorpanel", "/clinicpanel", ...
  panel: string;
  title: string;
  subtitle?: string;
  // the page's path under /<panel>/finance ("" for the overview)
  segment: string;
  actions?: ReactNode;
  children: ReactNode;
}) => {
  const t = useFinText();
  const hasAccess = useAcl(node);
  useBreadCrump([
    { title: t("dashboard"), target: panel },
    { title: t("financeSectionMenu"), target: `${panel}/finance` },
    ...(segment ? [{ title: t(title), target: `${panel}/finance/${segment}` }] : []),
  ]);
  const canWrite = hasAccess("manageAccounting");
  const api = `/${node}/biz`;
  return (
    <BizContext.Provider value={{ api, canWrite, canApprove: hasAccess("approveVouchers") }}>
      <FinContext.Provider value={{ node, panel, api: `${api}/finance`, canWrite }}>
        <div className={classes.main}>
          <div className={fin.headRow}>
            <header className={classes.header}>
              <h1 className={classes.title}>{t(title)}</h1>
              {!!subtitle && <span className={classes.subtitle}>{t(subtitle)}</span>}
            </header>
            {actions}
          </div>
          {!!INSIGHT[segment] && <AiInsight kind={INSIGHT[segment]} />}
          {children}
        </div>
      </FinContext.Provider>
    </BizContext.Provider>
  );
};

export default FinanceShell;
