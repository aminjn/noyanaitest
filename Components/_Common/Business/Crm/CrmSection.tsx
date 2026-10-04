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
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import CrmClub from "./Service/CrmClub";
import CrmSequences from "./Service/CrmSequences";
import CrmKnowledge from "./Service/CrmKnowledge";
import CrmQuizzes from "./Service/CrmQuizzes";
import CrmTickets from "./Service/CrmTickets";
import CrmTasks, { CrmTimesheet } from "./Service/CrmTasks";
import CrmCalendar from "./Service/CrmCalendar";
import CrmChecklists from "./Service/CrmChecklists";
import CrmFlows from "./Service/CrmFlows";
import CrmInbox from "./Service/CrmInbox";
import CrmReturns from "./Service/CrmReturns";
import { isProfile, partOn, partTitle, ServicePart } from "./Service/profiles";

// «ارتباط با بیماران» (2026-10): the Noyan Business CRM as one section of
// every provider panel, a page per part - dashboard, contacts (and one
// contact's profile), segments, campaigns (and one campaign's results),
// automations, follow-ups, SMS templates - at /<panel>/crm/<part>. The
// sidebar's submenu links them; each page also links its neighbours here.

export type CrmPageKind =
  | "dashboard"
  | "contacts"
  | "contact"
  | "segments"
  | "campaigns"
  | "campaign"
  | "automations"
  | "followups"
  | "templates"
  // the engagement and service side (2026-10, docs/nexxa-crm-engagement-parity.md)
  | ServicePart
  | "sequence"
  | "article"
  | "quiz"
  | "ticket"
  | "board"
  | "flow";

// `service`: a part of the engagement and service side, shown only to the
// profiles it fits (./Service/profiles.ts), with its own sub-menu row
export const crmParts: { page: CrmPageKind; path: string; title: string; hint: string; service?: ServicePart; row?: "service" }[] = [
  { page: "dashboard", path: "", title: "crmNavDashboard", hint: "crmNavDashboardHint" },
  { page: "contacts", path: "/contacts", title: "crmNavContacts", hint: "crmNavContactsHint" },
  { page: "segments", path: "/segments", title: "crmNavSegments", hint: "crmNavSegmentsHint" },
  { page: "campaigns", path: "/campaigns", title: "crmNavCampaigns", hint: "crmNavCampaignsHint" },
  { page: "automations", path: "/automations", title: "crmNavAutomations", hint: "crmNavAutomationsHint" },
  { page: "followups", path: "/followups", title: "crmNavFollowUps", hint: "crmNavFollowUpsHint" },
  { page: "templates", path: "/templates", title: "crmNavTemplates", hint: "crmNavTemplatesHint" },
  { page: "club", path: "/club", title: "crmeNavClub", hint: "crmeNavClubHint", service: "club" },
  { page: "sequences", path: "/sequences", title: "crmeNavSequences", hint: "crmeNavSequencesHint", service: "sequences" },
  { page: "flows", path: "/flows", title: "crmeNavFlows", hint: "crmeNavFlowsHint", service: "flows" },
  { page: "inbox", path: "/inbox", title: "crmeNavInbox", hint: "crmeNavInboxHint", service: "inbox", row: "service" },
  { page: "tickets", path: "/tickets", title: "crmeNavTickets", hint: "crmeNavTicketsHint", service: "tickets", row: "service" },
  { page: "tasks", path: "/tasks", title: "crmeNavTasks", hint: "crmeNavTasksHint", service: "tasks", row: "service" },
  { page: "timesheet", path: "/timesheet", title: "crmeNavTimesheet", hint: "crmeNavTimesheetHint", service: "timesheet", row: "service" },
  { page: "calendar", path: "/calendar", title: "crmeNavCalendar", hint: "crmeNavCalendarHint", service: "calendar", row: "service" },
  { page: "checklists", path: "/checklists", title: "crmeNavChecklists", hint: "crmeNavChecklistsHint", service: "checklists", row: "service" },
  { page: "knowledge", path: "/knowledge", title: "crmeNavKnowledge", hint: "crmeNavKnowledgeHint", service: "knowledge", row: "service" },
  { page: "quizzes", path: "/quizzes", title: "crmeNavQuizzes", hint: "crmeNavQuizzesHint", service: "quizzes", row: "service" },
  { page: "returns", path: "/returns", title: "crmeNavReturns", hint: "crmeNavReturnsHint", service: "returns", row: "service" },
];

const parentOf: Partial<Record<CrmPageKind, CrmPageKind>> = {
  contact: "contacts",
  campaign: "campaigns",
  sequence: "sequences",
  article: "knowledge",
  quiz: "quizzes",
  ticket: "tickets",
  board: "tasks",
  flow: "flows",
};

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
  // the profile's parts (a doctor's team parts once they have staff)
  const profile = isProfile(node) ? node : undefined;
  const { data: mine } = useSWR<{ teamSize?: number } | null>(`${API}/${node}/crm/service/mine`, (url: string) =>
    fetcher({ url })
      .then((res) => res?.data || null)
      .catch(() => null),
  );
  const hasTeam = (mine?.teamSize || 0) > 1;
  const shown = crmParts.filter((p) => !p.service || partOn(profile, p.service, hasTeam));
  const navRow = shown.filter((p) => (p.row || "") === (own.row || ""));
  const titleOf = (p: (typeof crmParts)[number]) => (p.service ? partTitle(profile, p.title, p.service) : p.title);
  useBreadCrump([
    { title: t("dashboard"), target: panel },
    { title: t("crmMenu"), target: base },
    ...(own.page !== "dashboard" ? [{ title: t(titleOf(own)), target: `${base}${own.path}` }] : []),
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
    ) : page === "templates" ? (
      <CrmTemplates />
    ) : page === "club" ? (
      <CrmClub />
    ) : page === "sequences" || page === "sequence" ? (
      <CrmSequences id={id} />
    ) : page === "knowledge" || page === "article" ? (
      <CrmKnowledge id={id} />
    ) : page === "quizzes" || page === "quiz" ? (
      <CrmQuizzes id={id} />
    ) : page === "tickets" || page === "ticket" ? (
      <CrmTickets id={id} />
    ) : page === "tasks" || page === "board" ? (
      <CrmTasks id={id} />
    ) : page === "timesheet" ? (
      <CrmTimesheet />
    ) : page === "calendar" ? (
      <CrmCalendar />
    ) : page === "checklists" ? (
      <CrmChecklists />
    ) : page === "flows" || page === "flow" ? (
      <CrmFlows id={id} />
    ) : page === "inbox" ? (
      <CrmInbox />
    ) : (
      <CrmReturns />
    );
  return (
    <CrmContext.Provider value={ctx}>
      <div className={classes.main}>
        <header className={classes.header}>
          <h1 className={classes.title}>{t(page === "dashboard" ? "crmMenu" : titleOf(own))}</h1>
          <span className={classes.subtitle}>{t(own.hint)}</span>
        </header>
        <nav className={crm.subNav} aria-label={t("crmMenu")}>
          {navRow.map((p) => (
            <Link key={p.page} href={`${base}${p.path}`} className={`${crm.subNavItem} ${p.page === own.page ? crm.subNavOn : ""}`}>
              {t(titleOf(p))}
            </Link>
          ))}
        </nav>
        <Suspense>{body}</Suspense>
      </div>
    </CrmContext.Provider>
  );
};

export default CrmSection;
