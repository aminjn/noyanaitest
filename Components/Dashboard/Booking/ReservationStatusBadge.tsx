import Badge from "@/Components/UI/Badge";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import {
  ReservationStatus,
  reservationStatusBadgeColorDict,
  reservationStatusContentKeyDict,
} from "./reservationStatus";

const NS: ContentNamespace[] = ["common", "dashboardReservationStatusBadge"];

const ReservationStatusBadge = ({
  status,
}: {
  status: ReservationStatus;
}) => {
  const getContent = useScopedLocale(NS);

  return (
    <Badge color={reservationStatusBadgeColorDict[status]} mode="Outline">
      {getContent(reservationStatusContentKeyDict[status])}
    </Badge>
  );
};

export default ReservationStatusBadge;
