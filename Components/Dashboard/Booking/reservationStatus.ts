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
