import type { OrderLineShipping } from "../Dashboard/Order/OrderItemStatusBadge";

// One pharmacy's parcel of an order (backend Models/Order.ts shipments,
// Lib/delivery.ts). A Tipax (inter-city) parcel goes sent -> delivered |
// returned (backend Services/shipmentDeliveryService.ts): delivered only once
// the buyer confirms it, the auto-confirm date passes with no problem
// reported, or support records it.
export interface IOrderShipment {
  _id: string;
  pharmacy?: { _id: string; name?: string } | string | null;
  method: "tapsi" | "tipax";
  fee: number;
  payOnDelivery: boolean;
  trackingCode?: string;
  // a courier link as given, a Tipax waybill through the admin's tracking URL
  trackingLink?: string;
  shippedAt?: string;
  confirmBy?: string;
  deliveredAt?: string;
  deliveredBy?: "buyer" | "auto" | "support" | "migration";
  returnedAt?: string;
  problem?: { reportedAt?: string; note?: string; ticket?: string } | null;
}

export type ShipmentState = "notSent" | "inTransit" | "delivered" | "returned";

export const shipmentStateOf = (s: IOrderShipment): ShipmentState =>
  s.returnedAt ? "returned" : s.deliveredAt ? "delivered" : s.shippedAt ? "inTransit" : "notSent";

const idOf = (value: unknown) =>
  value && typeof value === "object" ? String((value as { _id?: unknown })._id ?? "") : String(value ?? "");

// How a fulfilled line of `pharmacyId` reads while its Tipax parcel is not
// confirmed delivered; undefined when it is (or the line ships by Tapsi).
export const lineShippingOf = (
  shipments: unknown,
  pharmacyId: unknown,
): OrderLineShipping | undefined => {
  const id = idOf(pharmacyId);
  if (!id || !Array.isArray(shipments)) return undefined;
  const s = (shipments as IOrderShipment[]).find(
    (el) => el && el.method === "tipax" && idOf(el.pharmacy) === id,
  );
  if (!s || s.deliveredAt || s.returnedAt) return undefined;
  return s.shippedAt ? "inTransit" : "ready";
};
