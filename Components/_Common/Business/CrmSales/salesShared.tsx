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

// Each provider profile gets only the parts of Nexxa's CRM that fit it,
// in its own words (docs/nexxa-crm-parity.md, a column per profile):
//   doctor      a light funnel, treatment plans, simple targets
//   clinic /    the full funnel per department, staff assignment,
//   hospital    per-doctor targets and commission, corporate contracts,
//               discount and credit approvals
//   pharmacy    customers (not leads), credit, refill plans, supply
//               contracts - no funnel
//   paraClinic  referring doctors (tracked), home sampling, check-up
//               contracts
//   insurance   corporate deals, contracts and their members
// The plan's "crm" module and the secretary's access still gate it all.
export type Profile = "doctor" | "clinic" | "hospital" | "pharmacy" | "paraClinic" | "insurance";
export const profileOf = (node: NodeWithAcl): Profile =>
  (["doctor", "clinic", "hospital", "pharmacy", "paraClinic", "insurance"].includes(node) ? node : "clinic") as Profile;
// kept for the few places that only ask "is there a funnel"
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

type ApprovalKindP = "plan" | "discount" | "credit";
export type ProfileFeatures = {
  parts: SalesPage[];
  // a funnel of leads (the pharmacy works with customers instead)
  funnel: boolean;
  teams: boolean;
  assignment: boolean;
  scoring: boolean;
  commission: boolean;
  webform: boolean;
  approvals: ApprovalKindP[];
  // a clinic's / hospital's own doctors and departments
  doctors: boolean;
  // a lab's referring doctors, a channel tracked (never paid: the medical
  // council's code forbids paying for a referral)
  referrers: boolean;
  // a lab's home-sampling requests (address, preferred time)
  homeSampling: boolean;
  kinds: string[];
};

const CARE_KINDS = ["cosmetic", "dental", "ivf", "surgery", "checkup", "corporate", "other"];
const CENTRE: ProfileFeatures = {
  parts: ["pipeline", "inquiries", "plans", "contracts", "carePlans", "approvals", "calls", "targets", "reports", "settings"],
  funnel: true,
  teams: true,
  assignment: true,
  scoring: true,
  commission: true,
  webform: true,
  approvals: ["plan", "discount", "credit"],
  doctors: true,
  referrers: false,
  homeSampling: false,
  kinds: CARE_KINDS,
};
export const PROFILES: Record<Profile, ProfileFeatures> = {
  doctor: {
    ...CENTRE,
    parts: ["pipeline", "inquiries", "plans", "carePlans", "calls", "targets", "reports", "settings"],
    teams: false,
    assignment: false,
    commission: false,
    approvals: [],
    doctors: false,
  },
  clinic: CENTRE,
  hospital: CENTRE,
  pharmacy: {
    ...CENTRE,
    parts: ["carePlans", "contracts", "approvals", "calls", "targets", "reports", "settings"],
    funnel: false,
    teams: false,
    assignment: false,
    scoring: false,
    commission: false,
    webform: false,
    approvals: ["discount", "credit"],
    doctors: false,
    kinds: ["medication", "other"],
  },
  paraClinic: {
    ...CENTRE,
    parts: ["pipeline", "inquiries", "plans", "contracts", "approvals", "calls", "targets", "reports", "settings"],
    commission: false,
    approvals: ["plan", "discount"],
    doctors: false,
    referrers: true,
    homeSampling: true,
    kinds: ["lab", "imaging", "homeSampling", "checkup", "corporate", "other"],
  },
  insurance: {
    ...CENTRE,
    approvals: ["plan", "discount"],
    doctors: false,
    kinds: ["corporate", "group", "supplementary", "other"],
  },
};

export const salesParts: { page: SalesPage; path: string; title: string; hint: string }[] = [
  { page: "pipeline", path: "/pipeline", title: "crmsNavPipeline", hint: "crmsNavPipelineHint" },
  { page: "inquiries", path: "/inquiries", title: "crmsNavInquiries", hint: "crmsNavInquiriesHint" },
  { page: "plans", path: "/plans", title: "crmsNavPlans", hint: "crmsNavPlansHint" },
  { page: "contracts", path: "/contracts", title: "crmsNavContracts", hint: "crmsNavContractsHint" },
  { page: "carePlans", path: "/care-plans", title: "crmsNavCarePlans", hint: "crmsNavCarePlansHint" },
  { page: "approvals", path: "/approvals", title: "crmsNavApprovals", hint: "crmsNavApprovalsHint" },
  { page: "calls", path: "/calls", title: "crmsNavCalls", hint: "crmsNavCallsHint" },
  { page: "targets", path: "/targets", title: "crmsNavTargets", hint: "crmsNavTargetsHint" },
  { page: "reports", path: "/reports", title: "crmsNavReports", hint: "crmsNavReportsHint" },
  { page: "settings", path: "/sales-settings", title: "crmsNavSettings", hint: "crmsNavSettingsHint" },
];

// each profile's own words: a key read as another key
const QUOTES = {
  crmsNavPlans: "crmsNavQuotes",
  crmsNavPlansHint: "crmsNavQuotesHint",
  crmsNewPlan: "crmsNewQuote",
  crmsPlanN: "crmsQuoteN",
  crmsNoPlans: "crmsNoQuotes",
  crmsMakePlan: "crmsMakeQuote",
  crmsPlan: "crmsQuote",
  crmsDeletePlan: "crmsDeleteQuote",
};
const CORP_CONTRACTS = { crmsNavContracts: "crmsNavCorpContracts", crmsNavContractsHint: "crmsNavCorpContractsHint" };
const WORDS: Record<Profile, Record<string, string>> = {
  doctor: {},
  clinic: CORP_CONTRACTS,
  hospital: CORP_CONTRACTS,
  pharmacy: {
    ...QUOTES,
    crmsPatient: "crmsCustomer",
    crmsPatientName: "crmsCustomerName",
    crmsFindPatient: "crmsFindCustomer",
    crmsNewPatient: "crmsNewCustomer",
    crmsNavCarePlans: "crmsNavRefills",
    crmsNavCarePlansHint: "crmsNavRefillsHint",
    crmsNewCarePlan: "crmsNewRefill",
    crmsNoCarePlans: "crmsNoRefills",
    crmsNavContracts: "crmsNavSupplyContracts",
    crmsNavContractsHint: "crmsNavSupplyContractsHint",
  },
  paraClinic: {
    crmsNavPipeline: "crmsNavPipelineLab",
    crmsNavPipelineHint: "crmsNavPipelineLabHint",
    crmsNavInquiries: "crmsNavHomeSampling",
    crmsNavInquiriesHint: "crmsNavHomeSamplingHint",
    crmsNewInquiry: "crmsNewHomeSampling",
    crmsNoInquiries: "crmsNoHomeSampling",
    crmsNavPlans: "crmsNavEstimates",
    crmsNavPlansHint: "crmsNavEstimatesHint",
    crmsNewPlan: "crmsNewEstimate",
    crmsPlanN: "crmsEstimateN",
    crmsNoPlans: "crmsNoEstimates",
    crmsMakePlan: "crmsMakeEstimate",
    crmsPlan: "crmsEstimate",
    crmsDeletePlan: "crmsDeleteEstimate",
    crmsNavContracts: "crmsNavCheckupContracts",
    crmsNavContractsHint: "crmsNavCheckupContractsHint",
  },
  insurance: {
    ...QUOTES,
    ...CORP_CONTRACTS,
    crmsPatient: "crmsClient",
    crmsPatientName: "crmsClientName",
    crmsFindPatient: "crmsFindClient",
    crmsNewPatient: "crmsNewClient",
    crmsNavPipeline: "crmsNavPipelineCorp",
    crmsNavPipelineHint: "crmsNavPipelineCorpHint",
    crmsNavInquiries: "crmsNavCorpInquiries",
    crmsNavInquiriesHint: "crmsNavCorpInquiriesHint",
    crmsNewLead: "crmsNewDeal",
    crmsLeadTitle: "crmsDealTitle",
    crmsNavCarePlans: "crmsNavInstalments",
    crmsNavCarePlansHint: "crmsNavInstalmentsHint",
    crmsNewCarePlan: "crmsNewInstalment",
    crmsNoCarePlans: "crmsNoInstalments",
  },
};
export const partKey = (profile: Profile | SalesGroup, key: string) => WORDS[(profile as Profile) in WORDS ? (profile as Profile) : "clinic"]?.[key] || key;

// the section's texts in the panel's own words
export const useSalesText = () => {
  const t = useCrmText();
  const { node } = useCrm();
  const words = WORDS[profileOf(node)];
  return useCallback((key: string, vars?: string[]) => t(words[key] || key, vars), [t, words]);
};
export const useProfile = () => {
  const { node } = useCrm();
  const profile = profileOf(node);
  return { profile, ...PROFILES[profile] };
};

export type Staff = { _id: string; name: string; role: "owner" | "secretary" };
export type Stage = { _id: string; name: string; key?: string; sequence: number; probability: number; requiredFields: string[]; requireActivity: boolean };
export type Pipeline = { _id: string; name: string; isDefault: boolean; sequence: number; template?: string; department?: { id?: string; name: string }; stages: Stage[] };
export type LeadSource = { _id: string; kind: "source" | "lossReason" | "referrer"; name: string; phone?: string; system?: string; active: boolean; sequence: number };
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
  profile?: Profile;
  templates: { key: string; name: string }[];
  departments: { _id: string; name: string }[];
  doctors: { _id: string; name: string; department?: string }[];
  referrers: LeadSource[];
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

export const leadKinds = ["cosmetic", "dental", "ivf", "surgery", "checkup", "corporate", "medication", "lab", "imaging", "homeSampling", "supplementary", "group", "other"] as const;
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
  doctor?: { id?: string; name: string } | null;
  referrer?: string;
  referrerName?: string;
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
  doctorName?: string;
  referrerName?: string;
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
        profile: d.profile,
        templates: asArray<{ key: string; name: string }>(d.templates),
        departments: asArray<{ _id: string; name: string }>(d.departments),
        doctors: asArray<{ _id: string; name: string; department?: string }>(d.doctors),
        referrers: asArray<LeadSource>(d.referrers),
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
