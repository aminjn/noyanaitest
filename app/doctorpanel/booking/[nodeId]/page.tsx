import DoctorManageBookingPage from "@/Components/DoctorPanel/Booking/DoctorManageBookingPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageBooking = async () => {
  const textContent = await getScopedTextContent([
    "doctorPanelBooking",
    "dashboardReservationStatusBadge",
    "dashboardReservationTimeline",
    "dashboardReservationJoinButton",
  ]);
  return (
    <LocaleScopeProvider
      namespaces={["doctorPanelBooking", "dashboardReservationStatusBadge", "dashboardReservationTimeline", "dashboardReservationJoinButton"]}
      initialTextContent={textContent}
    >
      <DoctorManageBookingPage />
    </LocaleScopeProvider>
  );
};

export default DoctorManageBooking;
