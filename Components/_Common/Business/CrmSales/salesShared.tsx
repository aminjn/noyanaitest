"use client";

import { useCallback, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher, FetchMethod } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import { NodeWithAcl } from "@/Components/_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";
import { asArray } from "../bizShared";
import { errText, useCrm, useCrmText } from "../Crm/crmShared";

// Shared bits of the CRM sales side (2026-10, docs/nexxa-crm-parity.md):
// Nexxa's pipeline, leads, treatment plans, contracts, care plans,
// approvals, goals, commission and reports, inside «ارتباط با بیماران».
// The API is the panel's /<panel>/crm (backend Controllers/
// crmSalesController.ts); texts are bizCrm keys starting with "crms".

// what each kind of panel sells: a treatment (doctor, clinic, hospital,
// lab), medicines and goods (pharmacy), corporate cover (insurer)
export type SalesGroup = "care" | "pharmacy" | "insurance";
export const groupOf = (node: NodeWithAcl): SalesGroup => (node === "pharmacy" ? "pharmacy" : node === "insurance" ? "insurance" : "care");

export type SalesPage =
  | "pipeline"
  | "lead"
  | "inquiries"
  | "plans"
  | "plan"
  | "contracts"
  | "contract"
  | "carePlans"
  | "approvals"
  | "calls"
  | "targets"
  | "reports"
  | "settings";

// the parts of the sales side, in menu order, and who has each (the
// pharmacy has no treatment funnel; see the parity doc)
export const salesParts: { page: SalesPage; path: string; title: string; hint: string; groups: SalesGroup[] }[] = [
  { page: "pipeline", path: "/pipeline", title: "crmsNavPipeline", hint: "crmsNavPipelineHint", groups: ["care", "insurance"] },
  { page: "inquiries", path: "/inquiries", title: "crmsNavInquiries", hint: "crmsNavInquiriesHint", groups: ["care", "insurance"] },
  { page: "plans", path: "/plans", title: "crmsNavPlans", hint: "crmsNavPlansHint", groups: ["care", "pharmacy", "insurance"] },
  { page: "contracts", path: "/contracts", title: "crmsNavContracts", hint: "crmsNavContractsHint", groups: ["care", "pharmacy", "insurance"] },
  { page: "carePlans", path: "/care-plans", title: "crmsNavCarePlans", hint: "crmsNavCarePlansHint", groups: ["care", "pharmacy", "insurance"] },
  { page: "approvals", path: "/approvals", title: "crmsNavApprovals", hint: "crmsNavApprovalsHint", groups: ["care", "pharmacy", "insurance"] },
  { page: "calls", path: "/calls", title: "crmsNavCalls", hint: "crmsNavCallsHint", groups: ["care", "pharmacy", "insurance"] },
  { page: "targets", path: "/targets", title: "crmsNavTargets", hint: "crmsNavTargetsHint", groups: ["care", "pharmacy", "insurance"] },
  { page: "reports", path: "/reports", title: "crmsNavReports", hint: "crmsNavReportsHint", groups: ["care", "pharmacy", "insurance"] },
  { page: "settings", path: "/sales-settings", title: "crmsNavSettings", hint: "crmsNavSettingsHint", groups: ["care", "pharmacy", "insurance"] },
];

// a profile's own name for a part (a plan is a quote for a pharmacy or an
// insurer; a care plan is a membership / an instalment plan)
const renamed: Partial<Record<SalesGroup, Record<string, string>>> = {
  pharmacy: {
    crmsNavPlans: "crmsNavQuotes",
    crmsNavPlansHint: "crmsNavQuotesHint",
    crmsNewPlan: "crmsNewQuote",
    crmsPlanN: "crmsQuoteN",
    crmsNavCarePlans: "crmsNavMemberships",
    crmsNavCarePlansHint: "crmsNavMembershipsHint",
    crmsNewCarePlan: "crmsNewMembership",
  },
  insurance: {
    crmsNavPipeline: "crmsNavPipelineCorp",
    crmsNavPipelineHint: "crmsNavPipelineCorpHint",
    crmsNavPlans: "crmsNavQuotes",
    crmsNavPlansHint: "crmsNavQuotesHint",
    crmsNewPlan: "crmsNewQuote",
    crmsPlanN: "crmsQuoteN",
    crmsNewCarePlan: "crmsNewInstalment",
    crmsNavCarePlans: "crmsNavInstalments",
    crmsNavCarePlansHint: "crmsNavInstalmentsHint",
  },
};
export const partKey = (group: SalesGroup, key: string) => renamed[group]?.[key] || key;

export type Staff = { _id: string; name: string; role: "owner" | "secretary" };
export type Stage = { _id: string; name: string; key?: string; sequence: number; probability: number; requiredFields: string[]; requireActivity: boolean };
export type Pipeline = { _id: string; name: string; isDefault: boolean; sequence: number; stages: Stage[] };
export type LeadSource = { _id: string; kind: "source" | "lossReason"; name: string; system?: string; active: boolean; sequence: number };
export type CustomField = {
  _id: string;
  entity: "contact" | "lead";
  label: string;
  key: string;
  type: "text" | "textarea" | "number" | "date" | "select" | "checkbox";
  options: string[];
  required: boolean;
  sequence: number;
  active: boolean;
};
export type SalesMeta = {
  staff: Staff[];
  me?: string;
  ownerUser?: string;
  pipelines: Pipeline[];
  sources: LeadSource[];
  lossReasons: LeadSource[];
  customFields: CustomField[];
  teamScope: boolean;
  approvals: { plan: boolean };
};

export type LineRef = { kind: "service" | "package" | "item"; id: string };
export type Line = { _id?: string; title: string; ref?: LineRef | null; qty: number; unitPrice: number; discount: number; taxRate?: number; sessions?: number | null };
export type MiniContact = { _id: string; name?: string; phone?: string };

export const leadKinds = ["cosmetic", "dental", "ivf", "surgery", "checkup", "corporate", "medication", "other"] as const;
export type LeadKind = (typeof leadKinds)[number];
export const leadKindKey = (k?: string) => `crmsKind_${k || "other"}`;

export type Lead = {
  _id: string;
  title: string;
  kind: LeadKind;
  contact?: MiniContact | string | null;
  pipeline: string;
  stage: string;
  status: "open" | "won" | "lost";
  value: number;
  probability: number;
  priority: number;
  expectedClose?: string;
  source?: string;
  sourceName?: string;
  assignee?: string;
  note?: string;
  lostReason?: string;
  winReason?: string;
  closedAt?: string;
  items: Line[];
  plan?: string;
  ruleScore: number;
  customFields?: Record<string, string>;
  lastActivityAt?: string;
  history?: { at: string; by?: string; kind: string; text: string }[];
  createdAt: string;
  updatedAt: string;
};

export type PlanStatus = "draft" | "sent" | "accepted" | "declined" | "revised";
export type Plan = {
  _id: string;
  number: number;
  subject: string;
  contact?: MiniContact | null;
  lead?: string;
  date: string;
  openTill?: string;
  status: PlanStatus;
  discountPercent: number;
  items: Line[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  note?: string;
  terms?: string;
  invoice?: string;
  sentAt?: string;
  decidedAt?: string;
  acceptedName?: string;
  signature?: string;
  approval?: { status: "none" | "pending" | "approved" | "rejected"; request?: string };
  link?: string;
  invoiceInfo?: { number: number; status: string; total: number; paid: number } | null;
  approvals?: Approval[];
  credit?: Credit | null;
};

export type Credit = { enforced: boolean; limit: number; freeCredit: boolean; balance: number; remaining: number };

export type ApprovalKind = "plan" | "discount" | "credit";
export type ApprovalStatus = "pending" | "approved" | "rejected" | "cancelled" | "applied";
export type Approval = {
  _id: string;
  kind: ApprovalKind;
  number: number;
  requester?: string;
  contact?: MiniContact | null;
  plan?: { _id: string; number: number; subject: string; total: number } | string | null;
  invoice?: { _id: string; number: number; total: number; status: string } | string | null;
  amount: number;
  percent: number;
  requestedLimit: number;
  description?: string;
  chain: string[];
  level: number;
  status: ApprovalStatus;
  decisions: { by?: string; decision: "approved" | "rejected"; note?: string; at: string }[];
  createdAt: string;
};

export const planStatusKey: Record<PlanStatus, string> = {
  draft: "crmsPlanDraft",
  sent: "crmsPlanSent",
  accepted: "crmsPlanAccepted",
  declined: "crmsPlanDeclined",
  revised: "crmsPlanRevised",
};
export const approvalStatusKey: Record<ApprovalStatus, string> = {
  pending: "crmsApPending",
  approved: "crmsApApproved",
  rejected: "crmsApRejected",
  cancelled: "crmsApCancelled",
  applied: "crmsApApplied",
};
export const leadStatusKey: Record<Lead["status"], string> = { open: "crmsLeadOpen", won: "crmsLeadWon", lost: "crmsLeadLost" };

// the sales side's settings and lists, shared by its pages
export const useSalesMeta = () => {
  const { api } = useCrm();
  return useSWR<SalesMeta>(`${API}${api}/sales/meta`, (url: string) =>
    fetcher({ url }).then((res) => {
      const d = res.data || {};
      return {
        staff: asArray<Staff>(d.staff),
        me: d.me,
        ownerUser: d.ownerUser,
        pipelines: asArray<Pipeline>(d.pipelines),
        sources: asArray<LeadSource>(d.sources),
        lossReasons: asArray<LeadSource>(d.lossReasons),
        customFields: asArray<CustomField>(d.customFields),
        teamScope: !!d.teamScope,
        approvals: { plan: !!d.approvals?.plan },
      };
    }),
  );
};

// a list the page reads and refreshes
export const useList = <T,>(path: string | null) => {
  const { api } = useCrm();
  return useSWR<T[]>(path === null ? null : `${API}${api}${path}`, (url: string) => fetcher({ url }).then((res) => asArray<T>(res.data)));
};

// one call that changes something: the busy flag, the saved / error toast
export const useAction = () => {
  const { api } = useCrm();
  const t = useCrmText();
  const pushNotification = useNotification();
  const [busy, setBusy] = useState("");
  const run = useCallback(
    async <R = unknown,>(method: FetchMethod, path: string, payload?: Record<string, unknown>, opts?: { key?: string; quiet?: boolean }): Promise<R | undefined> => {
      const key = opts?.key || path;
      setBusy(key);
      try {
        const res = await fetcher({ url: `${API}${api}${path}`, method, payload, bodyParser: "JSON" });
        if (!opts?.quiet) pushNotification(t("bizSaved"), "Success");
        return res.data as R;
      } catch (err) {
        pushNotification(errText(err), "Error");
        return undefined;
      } finally {
        setBusy("");
      }
    },
    [api, pushNotification, t],
  );
  return { run, busy };
};

// a built-in stage, source or loss reason in the reader's language until
// the owner renames it
export const useNames = () => {
  const t = useCrmText();
  return {
    stage: (s?: Stage | null) => (!s ? "—" : s.key ? t(`crmsStage_${s.key}`) : s.name),
    source: (s?: LeadSource | null, fallback?: string) => (!s ? fallback || "—" : s.system ? t(`crmsSrc_${s.system}`) : s.name),
    staff: (meta: SalesMeta | undefined, id?: string | null) => (id ? meta?.staff.find((m) => m._id === id)?.name || "—" : "—"),
  };
};

export const contactName = (c?: MiniContact | string | null) => (c && typeof c === "object" ? c.name || c.phone || "—" : "—");
export const contactId = (c?: MiniContact | string | null) => (c && typeof c === "object" ? c._id : c || "");

// "2026-10-04" of a stored date (the date inputs)
export const dayOf = (v?: string | null) => (v ? String(v).slice(0, 10) : "");
