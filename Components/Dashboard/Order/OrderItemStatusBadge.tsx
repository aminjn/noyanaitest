import Badge, { BadgeColor } from "@/Components/UI/Badge";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import {
  OrderItemStatus,
  OrderLineAutoCancel,
  orderItemStatusBadgeColorDict,
  orderItemStatusContentKeyDict,
} from "./orderItemStatus";

const NS: ContentNamespace[] = ["common", "dashboardOrderItemStatusBadge"];

const autoCancelKey: Record<OrderLineAutoCancel, ContentKey> = {
  noResponse: "orderItemStatusAutoCancelled",
  notFulfilled: "orderItemStatusAutoCancelledLate",
};

// One line's status, shared by the buyer's order page and every seller
// panel. A pending line the seller already accepted reads "accepted"; a
// line the platform cancelled says why (backend Lib/orderResponse.ts).
// A fulfilled line in a Tipax parcel not confirmed delivered yet (backend
// Lib/shipmentDelivery.ts) is prepared, not delivered: "ready to ship"
// before the pharmacy sends it, "on its way" after.
export type OrderLineShipping = "ready" | "inTransit";

const OrderItemStatusBadge = ({
  status,
  acceptedAt,
  autoCancel,
  shipping,
}: {
  status: OrderItemStatus;
  acceptedAt?: string;
  autoCancel?: OrderLineAutoCancel;
  shipping?: OrderLineShipping;
}) => {
  const getContent = useScopedLocale(NS);
  const auto = status === "cancelled" && autoCancel ? autoCancelKey[autoCancel] : undefined;
  const accepted = status === "pending" && !!acceptedAt;
  const onTheWay = status === "fulfilled" && shipping ? shipping : undefined;
  const color: BadgeColor =
    auto
      ? "Error"
      : accepted || onTheWay
        ? "Info"
        : orderItemStatusBadgeColorDict[status] || "Disabled";
  // an unknown status (bad data) reads as pending rather than blank
  const key: ContentKey =
    auto ||
    (accepted
      ? "orderItemStatusAccepted"
      : onTheWay === "inTransit"
        ? "orderItemStatusInTransit"
        : onTheWay === "ready"
          ? "orderItemStatusReadyToShip"
          : orderItemStatusContentKeyDict[status] || "orderItemStatusPending");

  return (
    <Badge color={color} mode="Outline">
      {getContent(key)}
    </Badge>
  );
};

export default OrderItemStatusBadge;
