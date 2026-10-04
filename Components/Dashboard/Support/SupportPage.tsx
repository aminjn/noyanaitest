"use client";
import useSiteSettings from "@/Components/Hooks/useSiteSettings";
import useSWR from "swr";
import classes from "./SupportPage.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { IUser, MongoDoc, UserPopulation } from "@/Components/Hooks/useUser";
import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import { ContentKey } from "@/Components/Enums/contentKeys";
import usePopup from "@/Components/Hooks/usePopup";
import { useIntlLocale } from "@/Components/i18n/navigation";
import Link from "@/Components/i18n/Link";
import Ixon from "@/Components/UI/Ixon";
import { ReactNode, useMemo, useState } from "react";
import CogIcon from "@/Components/Icons/CogIcon";
import WalletIcon from "@/Components/Icons/WalletIcon";
import UserCircleIcon from "@/Components/Icons/UserCircleIcon";
import LightBulbIcon from "@/Components/Icons/LightBulbIcon";
import AlertCircleIcon from "@/Components/Icons/AlertCircleIcon";
import HelpCircleIcon from "@/Components/Icons/HelpCircleIcon";
import PlusIcon from "@/Components/Icons/PlusIcon";
import SparkIcon from "@/Components/Icons/SparkIcon";
import SubmitTicketPopup from "./SubmitTicketPopup";
import { safeFormatDate } from "@/Components/helpers/safeFormatDate";
import { ta } from "@/Components/Admin/i18n/adminText";

const NS: ContentNamespace[] = ["common", "dashboardSupport"];

export const ticketSubjects = [
  "TechnicalIssue",
  "BillingIssue",
  "AccountIssue",
  "FeatureRequest",
  "BugReport",
  "GeneralInquiry",
] as const;

export type TicketSubject = (typeof ticketSubjects)[number];
export const ticketSubjectContentKeyDict: Record<TicketSubject, ContentKey> = {
  AccountIssue: "ticketSubjectAccount",
  BillingIssue: "ticketSubjectBilling",
  BugReport: "ticketSubjectBug",
  FeatureRequest: "ticketSubjectFeature",
  GeneralInquiry: "ticketSubjectGeneral",
  TechnicalIssue: "ticketSubjectTech",
};

export const ticketSubjectDict: Record<TicketSubject, string> = {
  get AccountIssue() {
  return ta("حساب");
},
  get BillingIssue() {
  return ta("فاکتور");
},
  get BugReport() {
  return ta("باگ");
},
  get FeatureRequest() {
  return ta("فیچر");
},
  get GeneralInquiry() {
  return ta("عمومی");
},
  get TechnicalIssue() {
  return ta("فنی");
},
};

export const ticketStatuses = [
  "Open",
  "InProgress",
  "Resolved",
  "Closed",
] as const;

export type TicketStatus = (typeof ticketStatuses)[number];

export const ticketStatusesContentKeyDict: Record<TicketStatus, ContentKey> = {
  Closed: "closedTicket",
  InProgress: "inProgressTicket",
  Open: "openTicket",
  Resolved: "resolvedTicket",
};

export const ticketStatusDict: Record<TicketStatus, string> = {
  get Closed() {
  return ta("بسته");
},
  get InProgress() {
  return ta("در دست بررسی");
},
  get Open() {
  return ta("باز");
},
  get Resolved() {
  return ta("حل شده");
},
};

export type TicketPopulation = Population<{
  SubmittedBy: UserPopulation;
  Messages: TicketMessagePopulation;
}>;

export interface ITicket<
  T extends TicketPopulation = TicketPopulation,
> extends MongoDoc {
  submittedAt: Date;
  subject: TicketSubject;
  status: TicketStatus;
  submittedBy: T["SubmittedBy"] extends UserPopulation
    ? IUser<T["SubmittedBy"]>
    : string;
  title: string;
  messages: T["Messages"] extends TicketMessagePopulation
    ? ITicketMessage<T["Messages"]>[]
    : never;
}

export type TicketMessagePopulation = Population<{ Ticket: TicketPopulation }>;

export interface ITicketMessage<
  T extends TicketMessagePopulation = TicketMessagePopulation,
> extends MongoDoc {
  ticket: T["Ticket"] extends TicketPopulation ? ITicket<T["Ticket"]> : string;
  submittedAt: Date;
  content: string;
  isAdmin: boolean;
}

export const ticketSubjectIcons: Record<TicketSubject, ReactNode> = {
  TechnicalIssue: <CogIcon />,
  BillingIssue: <WalletIcon />,
  AccountIssue: <UserCircleIcon />,
  FeatureRequest: <LightBulbIcon />,
  BugReport: <AlertCircleIcon />,
  GeneralInquiry: <HelpCircleIcon />,
};

// GET /support adds the last message and a count to each ticket
type TicketListItem = ITicket & {
  lastMessage?: { content: string; isAdmin: boolean; submittedAt: string } | null;
  messageCount?: number;
};

const isActive = (t: TicketListItem) => t.status === "Open" || t.status === "InProgress";

// Help center (Zendesk / Intercom-style): pick a topic to open a ticket
// with it preselected, then the tickets split into active and closed, each
// showing who spoke last.
const SupportPage = () => {
  const { data, error, mutate } = useSWR<TicketListItem[]>(`${API}/support`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const { setPopup } = usePopup();
  const getContent = useScopedLocale(NS);
  const { emergencyNumberText } = useSiteSettings();
  const intlTag = useIntlLocale();
  const [tab, setTab] = useState<"active" | "done">("active");
  const fmt = useMemo(
    () => ({
      num: new Intl.NumberFormat(intlTag),
      day: new Intl.DateTimeFormat(intlTag, { day: "numeric", month: "long" }),
    }),
    [intlTag],
  );

  const list = Array.isArray(data) ? data : [];
  const active = list.filter(isActive);
  const done = list.filter((t) => !isActive(t));
  const shown = tab === "active" ? active : done;

  const open = (subject?: TicketSubject) =>
    setPopup("NewTicket", <SubmitTicketPopup mutate={mutate} subject={subject} />);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <header className={classes.head}>
            <h1 className={classes.title}>{getContent("support")}</h1>
            <button type="button" className={classes.primary} onClick={() => open()}>
              <Ixon width="1rem">
                <PlusIcon />
              </Ixon>
              {getContent("newTicket")}
            </button>
          </header>

          <p className={classes.urgent} role="note">
            <Ixon width="0.9rem">
              <SparkIcon />
            </Ixon>
            {getContent("chatUrgentNote", [emergencyNumberText])}
          </p>

          <section className={classes.topics}>
            <h2 className={classes.sectionTitle}>{getContent("spHelpTitle")}</h2>
            <div className={classes.topicGrid}>
              {ticketSubjects.map((s) => (
                <button key={s} type="button" className={classes.topic} onClick={() => open(s)}>
                  <span className={classes.topicIcon}>
                    <Ixon width="1.25rem">{ticketSubjectIcons[s]}</Ixon>
                  </span>
                  {getContent(ticketSubjectContentKeyDict[s])}
                </button>
              ))}
            </div>
          </section>

          <div className={classes.tabs} role="tablist">
            {(["active", "done"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                className={`${classes.tab} ${tab === t ? classes.tabOn : ""}`}
                onClick={() => setTab(t)}
              >
                {getContent(t === "active" ? "spTabActive" : "spTabDone")}
                <span className={classes.tabCount}>{fmt.num.format((t === "active" ? active : done).length)}</span>
              </button>
            ))}
          </div>

          {!shown.length ? (
            <div className={classes.nothing}>
              {list.length ? getContent("nothingWasFound") : getContent("spEmpty")}
            </div>
          ) : (
            <ul className={classes.list}>
              {shown.map((ticket) => {
                const last = ticket.lastMessage;
                const replied = !!last?.isAdmin && isActive(ticket);
                const subjectKey = ticketSubjectContentKeyDict[ticket.subject];
                const statusKey = ticketStatusesContentKeyDict[ticket.status];
                return (
                  <li key={ticket._id}>
                    <Link href={`/dashboard/support/${ticket._id}`} className={classes.item}>
                      <span className={classes.itemIcon}>
                        <Ixon width="1.125rem">{ticketSubjectIcons[ticket.subject] || <HelpCircleIcon />}</Ixon>
                      </span>
                      <span className={classes.itemBody}>
                        <span className={classes.itemTop}>
                          <strong className={classes.itemTitle}>{ticket.title || "—"}</strong>
                          <span className={classes.date}>
                            {safeFormatDate(fmt.day, last?.submittedAt || ticket.submittedAt)}
                          </span>
                        </span>
                        {!!last?.content && (
                          <span className={classes.preview}>
                            <b>{getContent(last.isAdmin ? "support" : "spYou")}:</b> {last.content}
                          </span>
                        )}
                        <span className={classes.chips}>
                          {subjectKey && <span className={classes.chip}>{getContent(subjectKey)}</span>}
                          {statusKey && (
                            <span className={`${classes.chip} ${classes[`st${ticket.status}`] || ""}`}>
                              {getContent(statusKey)}
                            </span>
                          )}
                          {isActive(ticket) && !!last && (
                            <span className={`${classes.chip} ${replied ? classes.replied : classes.waiting}`}>
                              {getContent(replied ? "spReplied" : "spWaiting")}
                            </span>
                          )}
                          {!!ticket.messageCount && (
                            <span className={classes.count}>
                              {getContent("spMessages", [fmt.num.format(ticket.messageCount)])}
                            </span>
                          )}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </HandleLoading>
  );
};

export default SupportPage;
