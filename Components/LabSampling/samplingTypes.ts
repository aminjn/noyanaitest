import { IUserAddress } from "../Dashboard/Address/DashboardManageAddressesPage";

// Mirrors backend Models/LabSampling.ts / Lib/labSampling.ts (2026-10): one
// sampling appointment of a cart order - an in-lab slot, or a home visit
// window at one of the buyer's addresses.
export type LabSamplingKind = "lab" | "home";
export type LabSamplingStatus = "active" | "cancelled" | "done";

// who moved an appointment (backend Lib/labSamplingReschedule.ts)
export type LabSamplingActor = "buyer" | "lab" | "admin";

export type LabSamplingPlace = {
  kind: LabSamplingKind;
  ymd: string;
  start: number;
  end: number;
  startsAt?: string;
  fee?: number;
};

export interface ILabSamplingMove {
  at: string;
  by: LabSamplingActor;
  from?: LabSamplingPlace | null;
  to?: LabSamplingPlace | null;
  feeDelta?: number;
}

// the lab's proposal to switch in-lab <-> home at a new slot (backend
// Lib/labSamplingProposal.ts): the buyer accepts or declines
export type SamplingProposalStatus = "open" | "accepted" | "declined" | "withdrawn" | "expired" | "closed";
export type SamplingProposal = {
  _id: string;
  at?: string;
  kind: LabSamplingKind;
  ymd: string;
  start: number;
  end: number;
  startsAt?: string;
  fee: number;
  // + charged on the buyer's wallet on accept, - refunded
  feeDelta: number;
  reason?: string;
  expiresAt?: string;
  status: SamplingProposalStatus;
  answeredAt?: string | null;
};

// what the viewer may do with an appointment now (samplingMoveInfo)
export type SamplingMoveInfo = {
  canMove: boolean;
  block?: "notActive" | "collected" | "notPaid" | "noPendingLine" | "off" | "tooLate" | "limit";
  movesLeft: number | null;
  maxMoves: number;
  leadMinutes: number;
  canSwitchKind: boolean;
  home: boolean;
  homeFee: number;
  homeCities: string[];
  canCancel: boolean;
  movedByOther: boolean;
  // the latest proposal (open or how it ended), and whether the lab may
  // make one now
  proposal?: SamplingProposal | null;
  canPropose?: boolean;
};

// what a reschedule posts
export type SamplingMovePayload = {
  kind?: LabSamplingKind;
  ymd: string;
  start: number;
  address?: string;
};

export interface ILabSampling {
  _id: string;
  paraClinic?: string | { _id: string; name?: string } | null;
  kind: LabSamplingKind;
  // Tehran "YYYY-MM-DD"; start / end are minutes after Tehran midnight
  ymd: string;
  start: number;
  end: number;
  startsAt: string;
  status: LabSamplingStatus;
  confirmedAt?: string;
  collectedAt?: string;
  fee?: number;
  address?: IUserAddress | string | null;
  moves?: ILabSamplingMove[];
}

export const samplingLabId = (s: Pick<ILabSampling, "paraClinic"> | null | undefined) =>
  !s?.paraClinic ? "" : typeof s.paraClinic === "string" ? s.paraClinic : s.paraClinic._id || "";

// how a test's sample is taken (backend Models/ParaClinicTest.ts)
export type ParaClinicTestSampling = "lab" | "labOrHome" | "none";
export const paraClinicTestSamplings: ParaClinicTestSampling[] = ["lab", "labOrHome", "none"];

// GET /cart/summary -> samplings: a lab whose tests need an appointment
export type CartSamplingGroup = {
  paraClinic: string;
  name?: string;
  tests: string[];
  home: boolean;
  homeFee: number;
  homeCities: string[];
};

// what /cart/submit takes for one lab
export type SamplingChoice = {
  paraClinic: string;
  kind: LabSamplingKind;
  ymd: string;
  start: number;
  address?: string;
};

// GET /cart/sampling/slots
export type SamplingSlotDay = {
  ymd: string;
  slots: { start: number; end: number; left: number; capacity: number }[];
};

// the lab's schedule (GET/POST /paraClinic/sampling/settings)
export type SamplingHours = { day: number; start: number; end: number };
export type SamplingSettings = {
  enabled: boolean;
  hours: SamplingHours[];
  slotMinutes: number;
  capacity: number;
  closedDays: string[];
  horizonDays: number;
  leadMinutes: number;
  home: {
    enabled: boolean;
    fee: number;
    cities: (string | { _id: string; name?: string })[];
    windowMinutes: number;
    capacity: number;
  };
  labCity?: { _id: string; name?: string } | null;
};

// the status a patient / the lab reads for an appointment
export const samplingStatusKey = (s: Pick<ILabSampling, "status" | "confirmedAt" | "collectedAt">) =>
  s.status === "cancelled"
    ? "lsStatusCancelled"
    : s.status === "done"
      ? "lsStatusDone"
      : s.collectedAt
        ? "lsStatusCollected"
        : s.confirmedAt
          ? "lsStatusConfirmed"
          : "lsStatusAwaiting";
