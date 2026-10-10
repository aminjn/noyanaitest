import { ContentKey } from "@/Components/Enums/contentKeys";
import { BadgeColor } from "@/Components/UI/Badge";

// Mirrors Models/Reservation.ts's reservationStatuses on noyanai-back.
export const reservationStatuses = [
  "pending",
  "active",
  "completed",
  "cancelled",
  "noShow",
  "error",
] as const;

export type ReservationStatus = (typeof reservationStatuses)[number];

export const reservationStatusContentKeyDict: Record<
  ReservationStatus,
  ContentKey
> = {
  pending: "reservationStatusPending",
  active: "reservationStatusActive",
  completed: "reservationStatusCompleted",
  cancelled: "reservationStatusCancelled",
  noShow: "reservationStatusNoShow",
  error: "reservationStatusError",
};

export const reservationStatusBadgeColorDict: Record<
  ReservationStatus,
  BadgeColor
> = {
  pending: "Warning",
  active: "Info",
  completed: "Success",
  cancelled: "Disabled",
  noShow: "Error",
  error: "Error",
};

// Mirrors Models/Reservation.ts's reservationParties on noyanai-back.
export const reservationParties = ["patient", "doctor"] as const;

export type ReservationParty = (typeof reservationParties)[number];

// The patient's view of a booking (2026-10, as on Doctolib): a booked
// visit is paid or held at the desk, so it reads "Confirmed" - never
// "pending", which patients read as "awaiting approval". A past one is
// "Done", a cancelled one says who cancelled, a missed one is a "No-show".
// Only what truly waits says what it waits for (support's review). The
// stored status and the doctor / admin views are unchanged.
export type PatientReservationStatusInput = {
  status: ReservationStatus;
  sessionType?: string;
  cancelledBy?: ReservationParty | "admin" | null;
  noShowParty?: ReservationParty | null;
  dispute?: { at?: unknown } | null;
};

export const patientReservationStatus = (
  r: PatientReservationStatusInput,
): { key: ContentKey; color: BadgeColor } => {
  switch (r.status) {
    case "pending":
      return { key: "rsPatientConfirmed", color: "Success" };
    case "active":
      // an online visit whose room is open; at the practice it is still
      // the confirmed visit
      return r.sessionType && r.sessionType !== "inPerson"
        ? { key: "rsPatientInProgress", color: "Info" }
        : { key: "rsPatientConfirmed", color: "Success" };
    case "completed":
      return r.dispute ? { key: "rsPatientUnderReview", color: "Warning" } : { key: "reservationStatusCompleted", color: "Success" };
    case "cancelled":
      return {
        key:
          r.cancelledBy === "patient"
            ? "rsPatientCancelledByYou"
            : r.cancelledBy === "doctor"
              ? "rsPatientCancelledByDoctor"
              : r.cancelledBy === "admin"
                ? "rsPatientCancelledBySupport"
                : "reservationStatusCancelled",
        color: "Disabled",
      };
    case "noShow":
      return r.noShowParty === "doctor"
        ? { key: "rsPatientDoctorNoShow", color: "Warning" }
        : { key: "rsPatientNoShow", color: "Error" };
    case "error":
    default:
      return { key: "rsPatientUnderReview", color: "Warning" };
  }
};
