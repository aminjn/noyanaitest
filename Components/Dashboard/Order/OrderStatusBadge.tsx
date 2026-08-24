import Badge from "@/Components/UI/Badge";
import useLocale from "@/Components/Hooks/useLocale";
import {
  OrderStatus,
  orderStatusBadgeColorDict,
  orderStatusContentKeyDict,
} from "./orderStatus";

const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
  const getContent = useLocale();

  return (
    <Badge color={orderStatusBadgeColorDict[status]} mode="Outline">
      {getContent(orderStatusContentKeyDict[status])}
    </Badge>
  );
};

export default OrderStatusBadge;
