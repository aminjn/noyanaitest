"use client";

import { Suspense } from "react";
import useAcl from "@/Components/Hooks/useAcl";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import { NodeWithAcl } from "@/Components/_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";
import Link from "@/Components/i18n/Link";
import classes from "../Accounting.module.css";
import crm from "./Crm.module.css";
import { CrmContext, useCrmText } from "./crmShared";
import CrmDashboard from "./CrmDashboard";
import CrmContacts from "./CrmContacts";
import CrmContactProfile from "./CrmContactProfile";
import CrmSegments from "./CrmSegments";
import CrmCampaigns from "./CrmCampaigns";
import CrmCampaignDetail from "./CrmCampaignDetail";
import CrmAutomations from "./CrmAutomations";
import CrmFollowUps from "./CrmFollowUps";
import CrmTemplates from "./CrmTemplates";

// «ارتباط با بیماران» (2026-10): the Noyan Business CRM as one section of
// every provider panel, a page per part - dashboard, contacts (and one
// contact's profile), segments, campaigns (and one campaign's results),
// automations, follow-ups, SMS templates - at /<panel>/crm/<part>. The
// sidebar's submenu links them; each page also links its neighbours here.

export type CrmPageKind = "dashboard" | "contacts" | "contact" | "segments" | "campaigns" | "campaign" | "automations" | "followups" | "templates";

export const crmParts: { page: CrmPageKind; path: string; title: string; hint: string }[] = [
  { page: "dashboard", path: "", title: "crmNavDashboard", hint: "crmNavDashboardHint" },
  { page: "contacts", path: "/contacts", title: "crmNavContacts", hint: "crmNavContactsHint" },
  { page: "segments", path: "/segments", title: "crmNavSegments", hint: "crmNavSegmentsHint" },
  { page: "campaigns", path: "/campaigns", title: "crmNavCampaigns", hint: "crmNavCampaignsHint" },
  { page: "automations", path: "/automations", title: "crmNavAutomations", hint: "crmNavAutomationsHint" },
  { page: "followups", path: "/followups", title: "crmNavFollowUps", hint: "crmNavFollowUpsHint" },
  { page: "templates", path: "/templates", title: "crmNavTemplates", hint: "crmNavTemplatesHint" },
];

const parentOf: Partial<Record<CrmPageKind, CrmPageKind>> = { contact: "contacts", campaign: "campaigns" };

const CrmSection = ({
  node,
  panel,
  page,
  id,
}: {
  node: NodeWithAcl;
  // "/clinicpanel", "/doctorpanel", ...
  panel: string;
  page: CrmPageKind;
  // a contact's or a campaign's id
  id?: string;
}) => {
  const t = useCrmText();
  const hasAccess = useAcl(node);
  const base = `${panel}/crm`;
  const own = crmParts.find((p) => p.page === (parentOf[page] || page)) || crmParts[0];
  useBreadCrump([
    { title: t("dashboard"), target: panel },
    { title: t("crmMenu"), target: base },
    ...(own.page !== "dashboard" ? [{ title: t(own.title), target: `${base}${own.path}` }] : []),
  ]);
  const ctx = {
    api: `/${node}/crm`,
    panel,
    node,
    canWrite: hasAccess("manageCrm"),
    canSend: hasAccess("sendCampaigns"),
  };
  const body =
    page === "dashboard" ? (
      <CrmDashboard />
    ) : page === "contacts" ? (
      <CrmContacts />
    ) : page === "contact" && id ? (
      <CrmContactProfile id={id} />
    ) : page === "segments" ? (
      <CrmSegments />
    ) : page === "campaigns" ? (
      <CrmCampaigns />
    ) : page === "campaign" && id ? (
      <CrmCampaignDetail id={id} />
    ) : page === "automations" ? (
      <CrmAutomations />
    ) : page === "followups" ? (
      <CrmFollowUps />
    ) : (
      <CrmTemplates />
    );
  return (
    <CrmContext.Provider value={ctx}>
      <div className={classes.main}>
        <header className={classes.header}>
          <h1 className={classes.title}>{t(page === "dashboard" ? "crmMenu" : own.title)}</h1>
          <span className={classes.subtitle}>{t(own.hint)}</span>
        </header>
        <nav className={crm.subNav} aria-label={t("crmMenu")}>
          {crmParts.map((p) => (
            <Link key={p.page} href={`${base}${p.path}`} className={`${crm.subNavItem} ${p.page === own.page ? crm.subNavOn : ""}`}>
              {t(p.title)}
            </Link>
          ))}
        </nav>
        <Suspense>{body}</Suspense>
      </div>
    </CrmContext.Provider>
  );
};

export default CrmSection;
