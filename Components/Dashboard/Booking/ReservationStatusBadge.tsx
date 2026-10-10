import Badge from "@/Components/UI/Badge";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import {
  PatientReservationStatusInput,
  patientReservationStatus,
  ReservationStatus,
  reservationStatusBadgeColorDict,
  reservationStatusContentKeyDict,
} from "./reservationStatus";

const NS: ContentNamespace[] = ["common", "dashboardReservationStatusBadge"];

// The status of a booking. `patient` (the patient's own pages) shows the
// patient's wording (reservationStatus.ts patientReservationStatus:
// Confirmed / Done / Cancelled by ... / No-show); without it, the
// practice's view of the stored status (doctor, centre, admin).
const ReservationStatusBadge = ({
  status,
  patient,
}: {
  status: ReservationStatus;
  patient?: Omit<PatientReservationStatusInput, "status">;
}) => {
  const getContent = useScopedLocale(NS);
  const view = patient
    ? patientReservationStatus({ ...patient, status })
    : { key: reservationStatusContentKeyDict[status], color: reservationStatusBadgeColorDict[status] };

  return (
    <Badge color={view.color || "Disabled"} mode="Outline">
      {view.key ? getContent(view.key) : status}
    </Badge>
  );
};

export default ReservationStatusBadge;
