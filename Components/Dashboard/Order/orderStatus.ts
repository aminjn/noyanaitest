import { ContentKey } from "@/Components/Enums/contentKeys";
import { BadgeColor } from "@/Components/UI/Badge";

// Mirrors Models/Order.ts's orderStatuses on noyanai-back.
export const orderStatuses = ["pending", "paid", "cancelled"] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export const orderStatusContentKeyDict: Record<OrderStatus, ContentKey> = {
  pending: "orderStatusPending",
  paid: "orderStatusPaid",
  cancelled: "orderStatusCancelled",
};

export const orderStatusBadgeColorDict: Record<OrderStatus, BadgeColor> = {
  pending: "Warning",
  paid: "Success",
  cancelled: "Disabled",
};
