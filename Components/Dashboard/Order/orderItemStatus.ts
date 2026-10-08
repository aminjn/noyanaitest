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

// Seller response deadline of a pharmacy / lab line (2026-10, backend
// Lib/orderResponse.ts): `respondBy` is stamped at payment (24 h pharmacy,
// 72 h lab by default, super admin setting); the seller's first answer sets
// `acceptedAt`. A line nobody answered is cancelled and refunded with
// `autoCancel: "noResponse"`; one answered but never finished in 7 days gets
// "notFulfilled".
export type OrderLineAutoCancel = "noResponse" | "notFulfilled";

export interface IOrderLineResponse {
  respondBy?: string;
  acceptedAt?: string;
  autoCancel?: OrderLineAutoCancel;
  autoCancelledAt?: string;
}

const validTime = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const t = new Date(value as string).getTime();
  return Number.isFinite(t) ? t : null;
};

// the deadline still running for a line: pending, not answered yet, with a
// valid `respondBy` (null otherwise)
export const pendingResponseDeadline = (
  line: ({ status?: string } & IOrderLineResponse) | null | undefined,
): string | null => {
  if (!line || line.status !== "pending" || line.acceptedAt) return null;
  return validTime(line.respondBy) === null ? null : String(line.respondBy);
};

// the earliest running deadline among lines (an order row in a list)
export const earliestResponseDeadline = (
  lines: unknown,
): string | null => {
  if (!Array.isArray(lines)) return null;
  let best: { at: number; value: string } | null = null;
  for (const line of lines) {
    const value = pendingResponseDeadline(line as { status?: string } & IOrderLineResponse);
    const at = validTime(value);
    if (value && at !== null && (!best || at < best.at)) best = { at, value };
  }
  return best?.value ?? null;
};
