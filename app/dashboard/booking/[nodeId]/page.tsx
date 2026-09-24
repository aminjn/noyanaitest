import DashboardManageBookingPage from "@/Components/Dashboard/Booking/DashboardManageBookingPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = [
  "common",
  "dashboardBooking",
  "dashboardReservationStatusBadge",
  "dashboardReservationTimeline",
  "dashboardReservationJoinButton",
];

const DashboardManageBooking = async () => {
  const textContent = await getScopedTextContent(NS);
  return (
    <LocaleScopeProvider
      namespaces={NS}
      initialTextContent={textContent}
    >
      <DashboardManageBookingPage />
    </LocaleScopeProvider>
  );
};

export default DashboardManageBooking;
