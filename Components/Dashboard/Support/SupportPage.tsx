"use client";
import useSWR from "swr";
import classes from "./SupportPage.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import useLocale from "@/Components/Hooks/useLocale";
import { IUser, MongoDoc, UserPopulation } from "@/Components/Hooks/useUser";
import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import FormatDate from "@/Components/UI/FormatDate";
import Badge from "@/Components/UI/Badge";
import { ContentKey } from "@/Components/Enums/contentKeys";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import SubmitTicketPopup from "./SubmitTicketPopup";

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
  AccountIssue: "حساب",
  BillingIssue: "فاکتور",
  BugReport: "باگ",
  FeatureRequest: "فیچر",
  GeneralInquiry: "عمومی",
  TechnicalIssue: "فنی",
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
  Closed: "بسته",
  InProgress: "در دست بررسی",
  Open: "باز",
  Resolved: "حل شده",
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

const SupportPage = () => {
  const { data, error, mutate } = useSWR<ITicket[]>(
    `${API}/support`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const { setPopup } = usePopup();

  const getContent = useLocale();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <div className={classes.head}>
            <h1 className={classes.title}>{getContent("support")}</h1>
            <Button
              onClick={() =>
                setPopup("NewTicket", <SubmitTicketPopup mutate={mutate} />)
              }
            >
              {getContent("newTicket")}
            </Button>
          </div>
          {!!data.length ? (
            <div className={classes.list}>
              {data.map((ticket) => (
                <div key={ticket._id} className={classes.item}>
                  <FormatDate
                    className={classes.date}
                    value={ticket.submittedAt}
                  />
                  <span className={classes.itemTitle}>{ticket.title}</span>
                  <div className={classes.badges}>
                    <Badge mode="Outline">
                      {getContent(ticketSubjectContentKeyDict[ticket.subject])}
                    </Badge>
                    <Badge
                      mode="Outline"
                      color={ticket.status === "Closed" ? "Error" : "Secondary"}
                    >
                      {getContent(ticketStatusesContentKeyDict[ticket.status])}
                    </Badge>
                  </div>
                  <Button
                    className={classes.visitButton}
                    href={`/dashboard/support/${ticket._id}`}
                    size="S"
                  >
                    {getContent("visitTicket")}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className={classes.nothing}>
              {getContent("nothingWasFound")}
            </div>
          )}
        </div>
      )}
    </HandleLoading>
  );
};

export default SupportPage;
