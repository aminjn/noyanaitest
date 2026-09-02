import { ContentKey } from "@/Components/Enums/contentKeys";
import { BadgeColor } from "@/Components/UI/Badge";

// Mirrors Models/Order.ts's orderItemStatuses on noyanai-back. Per-item
// fulfillment status, distinct from the order-level OrderStatus (payment).
// Shared across seller panels (pharmacy/doctor/paraClinic incoming-order
// detail pages), mirroring the sibling orderStatus.ts in this same folder.
export const orderItemStatuses = ["pending", "fulfilled", "cancelled"] as const;

export type OrderItemStatus = (typeof orderItemStatuses)[number];

export const orderItemStatusContentKeyDict: Record<OrderItemStatus, ContentKey> =
  {
    pending: "orderItemStatusPending",
    fulfilled: "orderItemStatusFulfilled",
    cancelled: "orderItemStatusCancelled",
  };

export const orderItemStatusBadgeColorDict: Record<OrderItemStatus, BadgeColor> =
  {
    pending: "Warning",
    fulfilled: "Success",
    cancelled: "Disabled",
  };
