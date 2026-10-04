"use client";

import { Suspense } from "react";
import useAcl from "@/Components/Hooks/useAcl";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import { NodeWithAcl } from "@/Components/_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";
import Link from "@/Components/i18n/Link";
import classes from "../Accounting.module.css";
import crm from "../Crm/Crm.module.css";
import { CrmContext, useCrmText } from "../Crm/crmShared";
import { partKey, PROFILES, profileOf, SalesPage, salesParts } from "./salesShared";
import SalesPipeline from "./SalesPipeline";
import SalesLead from "./SalesLead";
import SalesInquiries from "./SalesInquiries";
import SalesPlans from "./SalesPlans";
import SalesPlan from "./SalesPlan";
import SalesContracts from "./SalesContracts";
import SalesContract from "./SalesContract";
import SalesCarePlans from "./SalesCarePlans";
import SalesCalls from "./SalesCalls";
import SalesTargets from "./SalesTargets";
import SalesReports from "./SalesReports";
import SalesSettings from "./SalesSettings";

// The CRM sales side (2026-10, docs/nexxa-crm-parity.md): one page per
// part at /<panel>/crm/<part>, inside the «ارتباط با بیماران» section; the
// sidebar's submenu links them and each page links its neighbours here.

const parentOf: Partial<Record<SalesPage, SalesPage>> = { lead: "pipeline", plan: "plans", contract: "contracts" };

const SalesSection = ({ node, panel, page, id }: { node: NodeWithAcl; panel: string; page: SalesPage; id?: string }) => {
  const t = useCrmText();
  const hasAccess = useAcl(node);
  // the profile's own parts and words (salesShared PROFILES)
  const group = profileOf(node);
  const base = `${panel}/crm`;
  const parts = salesParts.filter((p) => PROFILES[group].parts.includes(p.page));
  const own = parts.find((p) => p.page === (parentOf[page] || page)) || parts[0];
  useBreadCrump([
    { title: t("dashboard"), target: panel },
    { title: t("crmMenu"), target: base },
    { title: t(partKey(group, own.title)), target: `${base}${own.path}` },
  ]);
  const ctx = { api: `/${node}/crm`, panel, node, canWrite: hasAccess("manageCrm"), canSend: hasAccess("sendCampaigns") };
  const body =
    page === "pipeline" ? (
      <SalesPipeline />
    ) : page === "lead" && id ? (
      <SalesLead id={id} />
    ) : page === "inquiries" ? (
      <SalesInquiries />
    ) : page === "plans" ? (
      <SalesPlans />
    ) : page === "plan" && id ? (
      <SalesPlan id={id} />
    ) : page === "contracts" ? (
      <SalesContracts />
    ) : page === "contract" && id ? (
      <SalesContract id={id} />
    ) : page === "carePlans" ? (
      <SalesCarePlans />
    ) : page === "calls" ? (
      <SalesCalls />
    ) : page === "targets" ? (
      <SalesTargets />
    ) : page === "reports" ? (
      <SalesReports />
    ) : (
      <SalesSettings />
    );
  return (
    <CrmContext.Provider value={ctx}>
      <div className={classes.main}>
        <header className={classes.header}>
          <h1 className={classes.title}>{t(partKey(group, own.title))}</h1>
          <span className={classes.subtitle}>{t(partKey(group, own.hint))}</span>
        </header>
        <nav className={crm.subNav} aria-label={t("crmsSalesMenu")}>
          {parts.map((p) => (
            <Link key={p.page} href={`${base}${p.path}`} className={`${crm.subNavItem} ${p.page === own.page ? crm.subNavOn : ""}`}>
              {t(partKey(group, p.title))}
            </Link>
          ))}
        </nav>
        <Suspense>{body}</Suspense>
      </div>
    </CrmContext.Provider>
  );
};

export default SalesSection;
