import { ta } from "@/Components/Admin/i18n/adminText";
import { BadgeColor } from "@/Components/UI/Badge";

// The provider-verification queue's vocabulary (2026-09), shared by the
// queue page (/requests) and each kind's own detail page. Mirrors the
// backend's Controllers/adminRequestsController.ts.

// "campaign" (2026-10): a provider's SMS campaign whose text waits to be cleared
// "smsTemplate" (2026-10): a provider's CRM SMS template, cleared once for
// its automations and one-off sends
// "contract" (2026-10): a provider's request for a contract with an insurer
// that has no panel, confirmed here on the insurer's behalf
export const requestGroups = ["become", "addition", "join", "campaign", "smsTemplate", "contract"] as const;
export type RequestGroup = (typeof requestGroups)[number];

export const requestKinds: Record<RequestGroup, readonly string[]> = {
  become: ["doctor", "pharmacy", "clinic", "hospital", "paraClinic", "insurance"],
  addition: ["clinic", "hospital", "pharmacy", "insurance"],
  join: ["clinic", "hospital"],
  campaign: ["doctor", "pharmacy", "clinic", "hospital", "paraClinic", "insurance"],
  smsTemplate: ["doctor", "pharmacy", "clinic", "hospital", "paraClinic", "insurance"],
  contract: ["doctor", "clinic", "hospital", "paraClinic", "pharmacy"],
};

export const isRequestGroup = (v: unknown): v is RequestGroup =>
  typeof v === "string" && (requestGroups as readonly string[]).includes(v);

export const requestStatusFilters = ["pending", "rejected", "done", "all"] as const;
export type RequestStatusFilter = (typeof requestStatusFilters)[number];

export const requestGroupLabels: Record<RequestGroup, string> = {
  get become() {
    return ta("پیوستن به سامانه");
  },
  get addition() {
    return ta("مراکز پیشنهادی پزشکان");
  },
  get join() {
    return ta("عضویت پزشک در مراکز");
  },
  get campaign() {
    return ta("کمپین‌های پیامکی");
  },
  get smsTemplate() {
    return ta("قالب‌های پیامک");
  },
  get contract() {
    return ta("قرارداد با بیمه‌ها");
  },
};

const kindLabels: Record<string, () => string> = {
  doctor: () => ta("پزشک"),
  pharmacy: () => ta("داروخانه"),
  clinic: () => ta("کلینیک"),
  hospital: () => ta("بیمارستان"),
  paraClinic: () => ta("پاراکلینیک"),
  insurance: () => ta("بیمه"),
};

export const requestKindLabel = (kind: string) => kindLabels[kind]?.() || kind;

export const requestStatusFilterLabels: Record<RequestStatusFilter, string> = {
  get pending() {
    return ta("در انتظار");
  },
  get rejected() {
    return ta("ردشده");
  },
  get done() {
    return ta("انجام‌شده");
  },
  get all() {
    return ta("همه");
  },
};

// a request's own status (the models' values; "Proccessing" is spelled as stored)
const statusLabels: Record<string, () => string> = {
  Pending: () => ta("در انتظار بررسی"),
  Proccessing: () => ta("در حال بررسی"),
  Rejected: () => ta("ردشده"),
  Approved: () => ta("تأییدشده"),
  Done: () => ta("انجام‌شده"),
  // a doctor's membership that ended after the request was approved
  Left: () => ta("پایان‌یافته"),
  // an SMS campaign after approval
  Sending: () => ta("در حال ارسال"),
  Sent: () => ta("ارسال‌شده"),
  Cancelled: () => ta("لغوشده"),
  // an insurer contract after approval / after it ended
  Active: () => ta("فعال"),
  Ended: () => ta("پایان‌یافته"),
};

export const requestStatusLabel = (status?: string) =>
  (status && statusLabels[status]?.()) || status || "—";

export const requestStatusColor = (status?: string): BadgeColor =>
  status === "Rejected"
    ? "Error"
    : status === "Approved" || status === "Done" || status === "Sent" || status === "Active"
      ? "Success"
      : status === "Proccessing"
        ? "Info"
        : "Warning";

export const isPendingStatus = (group: RequestGroup, status?: string) =>
  status === "Pending" || (group === "addition" && status === "Proccessing");

// a request's `user` - an id, a populated user, or missing
export const requestUserId = (user: unknown): string | undefined =>
  typeof user === "string"
    ? user
    : user && typeof user === "object" && "_id" in user
      ? String((user as { _id: unknown })._id)
      : undefined;
