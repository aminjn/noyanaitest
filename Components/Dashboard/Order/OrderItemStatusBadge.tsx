import Badge from "@/Components/UI/Badge";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import {
  OrderItemStatus,
  orderItemStatusBadgeColorDict,
  orderItemStatusContentKeyDict,
} from "./orderItemStatus";

const NS: ContentNamespace[] = ["common", "dashboardOrderItemStatusBadge"];

const OrderItemStatusBadge = ({ status }: { status: OrderItemStatus }) => {
  const getContent = useScopedLocale(NS);

  return (
    <Badge color={orderItemStatusBadgeColorDict[status]} mode="Outline">
      {getContent(orderItemStatusContentKeyDict[status])}
    </Badge>
  );
};

export default OrderItemStatusBadge;
