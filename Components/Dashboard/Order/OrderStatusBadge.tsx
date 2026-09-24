import Badge from "@/Components/UI/Badge";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import {
  OrderStatus,
  orderStatusBadgeColorDict,
  orderStatusContentKeyDict,
} from "./orderStatus";

const NS: ContentNamespace[] = ["common", "dashboardOrderStatusBadge"];

const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
  const getContent = useScopedLocale(NS);

  return (
    <Badge color={orderStatusBadgeColorDict[status]} mode="Outline">
      {getContent(orderStatusContentKeyDict[status])}
    </Badge>
  );
};

export default OrderStatusBadge;
