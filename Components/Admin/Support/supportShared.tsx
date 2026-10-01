"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import {
  TicketStatus,
  TicketSubject,
} from "@/Components/Dashboard/Support/SupportPage";
import { adminNumberFormat, ta } from "@/Components/Admin/i18n/adminText";
import { displayPhone } from "../User/userShared";
import classes from "./support.module.css";

// Support desk shared bits (2026-10 audit): ticket priority, SLA / age
// display, the staff (assignee) list. Backend: Controllers/
// adminSupportController.ts under /admin/support.

export const ticketPriorities = ["low", "normal", "high", "urgent"] as const;
export type TicketPriority = (typeof ticketPriorities)[number];

export const ticketPriorityDict: Record<TicketPriority, string> = {
  get low() {
    return ta("کم");
  },
  get normal() {
    return ta("عادی");
  },
  get high() {
    return ta("زیاد");
  },
  get urgent() {
    return ta("فوری");
  },
};

export type SupportUser = {
  _id: string;
  phone?: string;
  username?: string;
  name?: string;
  role?: string;
};

export const supportUserLabel = (user?: SupportUser | null) =>
  !user
    ? "—"
    : user.name?.trim() || user.username?.trim() || displayPhone(user.phone) || user._id;

export type WaitingOn = "support" | "user" | null;

export type TicketTiming = {
  waitingOn: WaitingOn;
  waitingSince?: string;
  slaDueAt?: string | null;
  overdue: boolean;
  ageHours: number;
  firstResponseAt?: string | null;
};

export type AdminTicketRow = TicketTiming & {
  _id: string;
  title: string;
  subject: TicketSubject;
  status: TicketStatus;
  priority: TicketPriority;
  submittedAt: string;
  submittedBy?: SupportUser | null;
  assignee?: SupportUser | null;
  messageCount: number;
  lastMessageAt?: string;
};

export type AdminTicketNote = {
  _id: string;
  content: string;
  author?: SupportUser | null;
  at: string;
};

export type AdminTicketMessage = {
  _id: string;
  content: string;
  isAdmin: boolean;
  submittedAt: string;
};

export type AdminTicketDetail = Omit<AdminTicketRow, "messageCount"> & {
  openedBy?: SupportUser | null;
  internalNotes: AdminTicketNote[];
  messages: AdminTicketMessage[];
  context: {
    otherTickets: Pick<AdminTicketRow, "_id" | "title" | "status" | "priority" | "submittedAt">[];
    reservations: number;
    orders: number;
  };
};

const num = adminNumberFormat();

// "3 h" / "2 d": a ticket's age or how long it has waited
export const formatHours = (hours: number) => {
  const h = Math.max(0, Math.round(hours));
  if (h < 1) return ta("کمتر از یک ساعت");
  if (h < 48) return ta("${1} ساعت", [num.format(h)]);
  return ta("${1} روز", [num.format(Math.round(h / 24))]);
};

export const hoursSince = (date?: string | null) =>
  date ? (Date.now() - new Date(date).getTime()) / 3600_000 : 0;

export const PriorityBadge = ({ priority }: { priority?: TicketPriority }) => {
  const p = priority && priority in ticketPriorityDict ? priority : "normal";
  return (
    <span className={`${classes.pill} ${classes[`priority_${p}`] || ""}`}>
      {ticketPriorityDict[p]}
    </span>
  );
};

// who the ticket waits on, and whether support is past its target
export const WaitingBadge = ({ timing }: { timing: TicketTiming }) => {
  if (!timing.waitingOn) return <span className={classes.muted}>—</span>;
  if (timing.waitingOn === "user")
    return <span className={`${classes.pill} ${classes.waitUser}`}>{ta("منتظر کاربر")}</span>;
  const waited = formatHours(hoursSince(timing.waitingSince));
  return (
    <span
      className={`${classes.pill} ${timing.overdue ? classes.overdue : classes.waitSupport}`}
      title={timing.overdue ? ta("از زمان هدف پاسخ گذشته است") : undefined}
    >
      {timing.overdue
        ? ta("دیرکرد: ${1}", [waited])
        : ta("منتظر پشتیبانی: ${1}", [waited])}
    </span>
  );
};

// staff accounts, for the assignee picker and filter
export const useSupportStaff = () =>
  useSWR<SupportUser[]>(`${API}/admin/support/staff`, (url: string) =>
    fetcher({ url }).then((res) => {
      const list = res?.data?.data;
      return Array.isArray(list) ? list : [];
    }),
  );
