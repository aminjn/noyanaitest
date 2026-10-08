import { IUserAddress } from "../Dashboard/Address/DashboardManageAddressesPage";

// Mirrors backend Models/LabSampling.ts / Lib/labSampling.ts (2026-10): one
// sampling appointment of a cart order - an in-lab slot, or a home visit
// window at one of the buyer's addresses.
export type LabSamplingKind = "lab" | "home";
export type LabSamplingStatus = "active" | "cancelled" | "done";

export interface ILabSampling {
  _id: string;
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
}

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
