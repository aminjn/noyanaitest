"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { useIntlLocale } from "@/Components/i18n/navigation";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { NodeWithAcl } from "@/Components/_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";
import { asArray } from "../bizShared";

// Shared bits of the Noyan Business CRM section «ارتباط با بیماران»
// (2026-10, /<panel>/crm/...): which API it talks to (/<panel>/crm), the
// panel's own base path, what the viewer may do (write; spend money: a
// campaign, a one-off SMS, switching an automation on), the texts and the
// shapes the backend returns (Controllers/crmController.ts,
// crmEngageController.ts).

export const CRM_NS: ContentNamespace[] = ["common", "bizAccounting", "bizCrm"];

// The section's texts. New keys of this section are typed as plain strings
// until they are merged into contentKeys (a missing key shows the key).
export const useCrmText = () => {
  const t = useScopedLocale(CRM_NS);
  return useCallback((key: string, vars?: string[]) => t(key as ContentKey, vars), [t]);
};

export type CrmSource = "visit" | "order" | "manual" | "import";
export type CrmInsurer = "tamin" | "salamat" | "armed" | "other" | "none";

export type CrmContact = {
  _id: string;
  name: string;
  phone: string;
  user?: string;
  gender?: "male" | "female";
  birthYear?: number;
  birthDate?: string;
  birthMD?: number;
  city?: string;
  insurer?: CrmInsurer;
  source: CrmSource;
  tags: string[];
  note?: string;
  visits: number;
  orders: number;
  noShows?: number;
  spent: number;
  firstSeenAt?: string;
  lastSeenAt?: string;
  lastVisitAt?: string;
  lastNoShowAt?: string;
  smsOptOut: boolean;
  isActive: boolean;
  createdAt?: string;
};

// the contact's tie to a Noyan account (backend Lib/business/crmService/
// link.ts): made only by the patient's own «وصل شود»; the centre sees the
// state and its dates, never who the user is
export type CrmLinkState = {
  status: "linked" | "pending" | "declined" | "unlinked" | "none";
  verified: boolean;
  source?: "manual" | "csv" | "webform" | "visit";
  offeredAt?: string;
  linkedAt?: string;
  declinedAt?: string;
  unlinkedAt?: string;
  wrongNumber?: boolean;
};

export type CrmTimelineItem = {
  kind: "visit" | "order" | "note" | "call" | "followUp" | "sms";
  at: string;
  text?: string;
  status?: string;
  id?: string;
  dueAt?: string;
  doneAt?: string;
  amount?: number;
  sessionType?: string;
  source?: "campaign" | "automation" | "single";
  clicks?: number;
};

// a segment's / an audience's contact rules (backend Models/BizSegment.ts)
export type CrmRules = {
  tags: string[];
  tagsAll?: boolean | null;
  excludeTags?: string[] | null;
  sources: string[];
  gender?: "male" | "female" | null;
  ageMin?: number | null;
  ageMax?: number | null;
  city?: string | null;
  insurer?: CrmInsurer | null;
  inactiveDays?: number | null;
  activeDays?: number | null;
  minVisits?: number | null;
  maxVisits?: number | null;
  minSpent?: number | null;
  noShowDays?: number | null;
  birthday?: "today" | "week" | "month" | null;
  newDays?: number | null;
  highValue?: boolean | null;
};
export const emptyRules = (): CrmRules => ({ tags: [], sources: [] });

export type CrmAudience = CrmRules & { segment?: string | null; contactIds?: string[] | null };

export type CrmSegment = {
  _id: string;
  name?: string;
  // a ready-made one: its key (lapsed, birthdayWeek, ...)
  preset?: string;
  rules: CrmRules;
  count: number;
  reachable: number;
};

export type CrmCampaignStatus = "Draft" | "Pending" | "Rejected" | "Approved" | "Sending" | "Sent" | "Cancelled";
export type CrmCampaign = {
  _id: string;
  name: string;
  text: string;
  audience: CrmAudience;
  template?: string;
  sendAt?: string;
  windowFrom?: number;
  windowUntil?: number;
  status: CrmCampaignStatus;
  recipients: number;
  parts: number;
  rejectReason?: string;
  submittedAt?: string;
  sendAfter?: string;
  finishedAt?: string;
  sentCount: number;
  failedCount: number;
  clicks?: number;
  bookings?: number;
  fromQuota: number;
  fromWallet: number;
  charged: number;
  refunded: number;
  createdAt: string;
};

export type CrmEstimate = {
  recipients: number;
  parts: number;
  totalParts: number;
  quota: number;
  quotaLeft: number;
  fromQuota: number;
  fromWallet: number;
  unitPrice: number;
  cost: number;
  balance: number;
  affordable: boolean;
  preview: string;
  sample: string[];
};

export type CrmTemplateStatus = "Draft" | "Pending" | "Approved" | "Rejected";
export type CrmTemplate = {
  _id: string;
  name: string;
  text: string;
  category: "general" | "recall" | "thanks" | "birthday" | "noShow" | "winback" | "chronic";
  status: CrmTemplateStatus;
  rejectReason?: string;
  automations?: number;
  createdAt: string;
};

export type CrmAutomationKind = "recall" | "thanks" | "birthday" | "noShow" | "winback" | "chronic";
export type CrmAutomation = {
  _id: string;
  kind: CrmAutomationKind;
  name: string;
  enabled: boolean;
  template?: { _id: string; name: string; status: CrmTemplateStatus; text: string } | null;
  delay: number;
  sessionTypes: string[];
  audience: CrmRules;
  windowFrom: number;
  windowUntil: number;
  gapDays: number;
  oncePerYear: boolean;
  sentCount: number;
  failedCount: number;
  skippedCount: number;
  lastRunAt?: string;
  lastError?: string;
  last30?: { sent: number; clicked: number; booked: number };
};

export type CrmTeamMember = { _id: string; name: string; role: "owner" | "secretary" };

export type CrmFollowUp = {
  _id: string;
  text: string;
  dueAt: string;
  doneAt?: string;
  assignee?: string;
  contact: { _id: string; name?: string; phone: string } | null;
};

type Ctx = { api: string; panel: string; node: NodeWithAcl; canWrite: boolean; canSend: boolean };
export const CrmContext = createContext<Ctx>({ api: "", panel: "", node: "doctor", canWrite: false, canSend: false });
export const useCrm = () => useContext(CrmContext);

// the tag names in use (for the audience chips)
export const useCrmTags = () => {
  const { api } = useCrm();
  return useSWR<string[]>(`${API}${api}/tags`, (url: string) => fetcher({ url }).then((res) => asArray<string>(res.data)));
};

export const useCrmTeam = () => {
  const { api } = useCrm();
  return useSWR<CrmTeamMember[]>(`${API}${api}/team`, (url: string) => fetcher({ url }).then((res) => asArray<CrmTeamMember>(res.data)));
};

export const useCrmTemplates = () => {
  const { api } = useCrm();
  return useSWR<CrmTemplate[]>(`${API}${api}/templates`, (url: string) => fetcher({ url }).then((res) => asArray<CrmTemplate>(res.data)));
};

export const sourceKey: Record<CrmSource, string> = {
  visit: "crmSourceVisit",
  order: "crmSourceOrder",
  manual: "crmSourceManual",
  import: "crmSourceImport",
};

export const insurerKey: Record<CrmInsurer, string> = {
  tamin: "crmInsTamin",
  salamat: "crmInsSalamat",
  armed: "crmInsArmed",
  other: "crmInsOther",
  none: "crmInsNone",
};

export const statusKey: Record<CrmCampaignStatus, string> = {
  Draft: "crmStDraft",
  Pending: "crmStPending",
  Rejected: "crmStRejected",
  Approved: "crmStApproved",
  Sending: "crmStSending",
  Sent: "crmStSent",
  Cancelled: "crmStCancelled",
};

export const templateStatusKey: Record<CrmTemplateStatus, string> = {
  Draft: "crmStDraft",
  Pending: "crmStPending",
  Rejected: "crmStRejected",
  Approved: "crmTplApproved",
};

export const automationKey: Record<CrmAutomationKind, { title: string; hint: string; unit: "days" | "hours" }> = {
  recall: { title: "crmAutoRecall", hint: "crmAutoRecallHint", unit: "days" },
  thanks: { title: "crmAutoThanks", hint: "crmAutoThanksHint", unit: "hours" },
  birthday: { title: "crmAutoBirthday", hint: "crmAutoBirthdayHint", unit: "days" },
  noShow: { title: "crmAutoNoShow", hint: "crmAutoNoShowHint", unit: "hours" },
  winback: { title: "crmAutoWinback", hint: "crmAutoWinbackHint", unit: "days" },
  chronic: { title: "crmAutoChronic", hint: "crmAutoChronicHint", unit: "days" },
};

export const presetKey: Record<string, string> = {
  lapsed: "crmSegLapsed",
  recent: "crmSegRecent",
  loyal: "crmSegLoyal",
  highValue: "crmSegHighValue",
  birthdayWeek: "crmSegBirthdayWeek",
  birthdayMonth: "crmSegBirthdayMonth",
  noShow90: "crmSegNoShow90",
  newMonth: "crmSegNewMonth",
};

// the visit session types a recall can be limited to (backend
// DoctorSessionType)
export const sessionTypes = ["inPerson", "videoCall", "voiceCall", "textChat", "sipCall"] as const;
export const sessionTypeKey: Record<string, string> = {
  inPerson: "crmSessInPerson",
  videoCall: "crmSessVideo",
  voiceCall: "crmSessVoice",
  textChat: "crmSessChat",
  sipCall: "crmSessPhone",
};

// "۰۹۱۲ ۳۴۵ ۶۷۸۹" - a phone read in groups, digits kept left-to-right
export const phoneText = (p: string) => (p && p.length === 11 ? `${p.slice(0, 4)} ${p.slice(4, 7)} ${p.slice(7)}` : p);

// the error text of a failed request
export const errText = (err: unknown) => (err as Error)?.message || String(err);

// the variables a template may use, as the panel shows them
export const smsVars = ["name", "firstName", "org", "link", "review", "lastVisit"] as const;

// characters and SMS parts of a text (Persian: 70 a part, 67 when split;
// Latin: 160 / 153) - the backend counts the final text the same way
const GSM = /^[\n\r @£$¥èéùìòÇØøÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ!"#¤%&'()*+,\-./0-9:;<=>?¡A-ZÄÖÑÜ§¿a-zäöñüà^{}\\[~\]|€]*$/;
export const smsCount = (text: string) => {
  const len = Array.from(text).length;
  const ucs = !GSM.test(text);
  const [one, many] = ucs ? [70, 67] : [160, 153];
  const parts = !len ? 0 : len <= one ? 1 : Math.ceil(len / many);
  return { len, parts, perPart: parts > 1 ? many : one, ucs };
};

// a rule set has anything in it
export const hasRules = (r?: Partial<CrmRules> | null) =>
  !!r &&
  Object.entries(r).some(([, v]) => (Array.isArray(v) ? v.length > 0 : v !== null && v !== undefined && v !== "" && v !== false));

// a share as a percentage in the reader's language ("—" with nothing to divide)
export const usePercent = () => {
  const tag = useIntlLocale();
  return useMemo(() => {
    const fmt = new Intl.NumberFormat(tag, { style: "percent", maximumFractionDigits: 0 });
    return (a: number, b: number) => (b ? fmt.format(a / b) : "—");
  }, [tag]);
};

// an hour of the day ("10:00") in the reader's language
export const useHourLabel = () => {
  const tag = useIntlLocale();
  return useMemo(() => {
    const fmt = new Intl.DateTimeFormat(tag, { hour: "2-digit", minute: "2-digit", hour12: false });
    return (h: number) => fmt.format(new Date(2000, 0, 1, h, 0));
  }, [tag]);
};
