import Badge from "@/Components/UI/Badge";
import useLocale from "@/Components/Hooks/useLocale";
import {
  ReservationStatus,
  reservationStatusBadgeColorDict,
  reservationStatusContentKeyDict,
} from "./reservationStatus";

const ReservationStatusBadge = ({
  status,
}: {
  status: ReservationStatus;
}) => {
  const getContent = useLocale();

  return (
    <Badge color={reservationStatusBadgeColorDict[status]} mode="Outline">
      {getContent(reservationStatusContentKeyDict[status])}
    </Badge>
  );
};

export default ReservationStatusBadge;
