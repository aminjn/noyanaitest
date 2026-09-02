import Badge from "@/Components/UI/Badge";
import useLocale from "@/Components/Hooks/useLocale";
import {
  OrderItemStatus,
  orderItemStatusBadgeColorDict,
  orderItemStatusContentKeyDict,
} from "./orderItemStatus";

const OrderItemStatusBadge = ({ status }: { status: OrderItemStatus }) => {
  const getContent = useLocale();

  return (
    <Badge color={orderItemStatusBadgeColorDict[status]} mode="Outline">
      {getContent(orderItemStatusContentKeyDict[status])}
    </Badge>
  );
};

export default OrderItemStatusBadge;
