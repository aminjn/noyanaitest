import { BadgeColor } from "@/Components/UI/Badge";
import { ContentKey } from "@/Components/Enums/contentKeys";

// An insurer ↔ provider contract (2026-10), as the backend's
// Controllers/insuranceContractController.ts sends it to both panels. The
// lifecycle (Models/InsuranceContract.ts on the backend): a provider
// requests or an insurer invites -> Pending -> Active (the other side
// confirms) -> Ended (either side, with a reason and an end date); a
// pending one can be rejected (with a reason) or withdrawn by its sender.
// Only an Active contract inside its validity counts as "accepts this
// insurer" anywhere on the site.

export const contractProviderKinds = ["doctor", "clinic", "hospital", "paraClinic", "pharmacy"] as const;
export type ContractProviderKind = (typeof contractProviderKinds)[number];
export type ContractStatus = "Pending" | "Active" | "Rejected" | "Cancelled" | "Ended";
export type ContractSide = "provider" | "insurer";

export interface IInsuranceContract {
  _id: string;
  status: ContractStatus;
  // Active and inside its validity: counts in booking and the public pages
  effective: boolean;
  initiatedBy: "provider" | "insurer" | "admin";
  // who answers a provider's request: the insurer, or Noyan for an insurer
  // with no panel
  reviewer: "insurer" | "admin";
  source?: "migration" | "addition";
  note?: string;
  validFrom?: string | null;
  // the first instant it no longer holds (the day after its last day)
  validUntil?: string | null;
  // a scheduled end: the first instant after its last day
  endsAt?: string | null;
  endedAt?: string | null;
  endedBy?: string;
  endReason?: string;
  rejectReason?: string;
  activatedAt?: string | null;
  createdAt?: string;
  insurance?: { _id: string; name?: string; slug?: string; image?: string } | null;
  providerKind: ContractProviderKind;
  provider?: { _id: string; name?: string; slug?: string } | null;
}

export const asContracts = (v: unknown): IInsuranceContract[] =>
  Array.isArray(v) ? (v as IInsuranceContract[]).filter((c) => c && typeof c === "object" && !!c._id) : [];

export const providerKindKey: Record<ContractProviderKind, ContentKey> = {
  doctor: "icKindDoctor",
  clinic: "icKindClinic",
  hospital: "icKindHospital",
  paraClinic: "icKindParaClinic",
  pharmacy: "icKindPharmacy",
};

// the public page of a provider
export const providerPath: Record<ContractProviderKind, string> = {
  doctor: "/dr",
  clinic: "/clinic",
  hospital: "/hospital",
  paraClinic: "/paraClinic",
  pharmacy: "/pharmacy",
};

// "the day it ends" from an exclusive end instant
export const lastDayOf = (exclusive?: string | null) => {
  if (!exclusive) return null;
  const t = new Date(exclusive).getTime();
  return Number.isNaN(t) ? null : new Date(t - 1);
};

const isFuture = (v?: string | null) => !!v && new Date(v).getTime() > Date.now();

// the status as one side reads it: who it waits on, or when it ends
export const contractStatusOf = (
  c: IInsuranceContract,
  side: ContractSide,
): { key: ContentKey; date?: Date | null; color: BadgeColor } => {
  switch (c.status) {
    case "Pending": {
      const fromOtherSide = side === "provider" ? c.initiatedBy === "insurer" : c.initiatedBy === "provider";
      if (fromOtherSide) return { key: "icWaitingYou", color: "Warning" };
      if (side === "provider") return { key: c.reviewer === "admin" ? "icWaitingNoyan" : "icWaitingInsurer", color: "Warning" };
      return { key: "icWaitingProvider", color: "Warning" };
    }
    case "Active":
      if (c.endsAt) return { key: "icActiveUntil", date: lastDayOf(c.endsAt), color: "Info" };
      if (!c.effective && isFuture(c.validFrom)) return { key: "icActiveFrom", date: c.validFrom ? new Date(c.validFrom) : null, color: "Info" };
      return { key: "icActive", color: "Success" };
    case "Rejected":
      return { key: "icRejected", color: "Error" };
    case "Cancelled":
      return { key: "icCancelled", color: "Disabled" };
    default:
      return { key: "icEnded", color: "Disabled" };
  }
};

// what this side may do now (one-way steps only)
export const contractActionsOf = (c: IInsuranceContract, side: ContractSide) => {
  const mine = c.initiatedBy === side;
  return {
    answer: c.status === "Pending" && !mine && (side === "provider" ? c.initiatedBy === "insurer" : c.initiatedBy === "provider"),
    withdraw: c.status === "Pending" && mine,
    end: c.status === "Active" && !c.endsAt,
  };
};

export const isOpenContract = (c: IInsuranceContract) => c.status === "Pending" || c.status === "Active";
