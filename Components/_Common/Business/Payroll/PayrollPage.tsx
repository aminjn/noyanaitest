"use client";

import { useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useAcl from "@/Components/Hooks/useAcl";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import { NodeWithAcl } from "@/Components/_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import classes from "../Accounting.module.css";
import { asArray } from "../bizShared";
import { PayContext, usePayText } from "./payShared";
import PayrollRuns from "./PayrollRuns";
import PayrollEmployees from "./PayrollEmployees";
import PayrollRules from "./PayrollRules";

// Noyan Business payroll (2026-10, docs/business-suite.md phase 3) for every
// provider panel: the month's payroll (payslips with insurance and tax, the
// voucher, salaries and Tamin/tax payments), the employees, and the year's
// legal figures. One page, its parts as tabs.
const PayrollPage = ({
  node,
  panel,
}: {
  node: NodeWithAcl;
  // "/clinicpanel", "/doctorpanel", ...
  panel: string;
}) => {
  const t = usePayText();
  const hasAccess = useAcl(node);
  useBreadCrump([
    { title: t("dashboard"), target: panel },
    { title: t("payTitle"), target: `${panel}/payroll` },
  ]);
  const api = `/${node}/payroll`;
  const [refreshKey, setRefreshKey] = useState(0);
  const bump = () => setRefreshKey((k) => k + 1);
  const { data: meta } = useSWR<{ years: number[]; today: { year: number } }>(`${API}${api}/runs`, (url: string) =>
    fetcher({ url }).then((res) => ({ years: asArray<number>(res.data?.years), today: res.data?.today || { year: 0 } })),
  );
  const years = meta?.years || [];
  const initial = meta ? (years.includes(meta.today.year) ? meta.today.year : years[0] || 0) : 0;
  return (
    <PayContext.Provider value={{ api, canWrite: hasAccess("managePayroll") }}>
      <div className={classes.main}>
        <header className={classes.header}>
          <h1 className={classes.title}>{t("payTitle")}</h1>
          <span className={classes.subtitle}>{t("paySubtitle")}</span>
        </header>
        <ClientTabSystem
          items={[
            { id: "runs", title: t("payTabRuns"), content: <PayrollRuns refreshKey={refreshKey} onChanged={bump} /> },
            { id: "employees", title: t("payTabEmployees"), content: <PayrollEmployees refreshKey={refreshKey} onChanged={bump} /> },
            {
              id: "rules",
              title: t("payTabRules"),
              content: meta ? <PayrollRules key={initial} years={years} initial={initial} /> : null,
            },
          ]}
        />
      </div>
    </PayContext.Provider>
  );
};

export default PayrollPage;
