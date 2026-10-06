import DashboardManageBookingsPage from "@/Components/Dashboard/Booking/DashboardManageBookingsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = [

  "dashboardBooking",
  "bookingFlow",
  "dashboardReservationStatusBadge",
];

const DashboardManageBookings = async () => {
  const textContent = await getScopedTextContent(NS);
  return (
    <LocaleScopeProvider
      namespaces={NS}
      initialTextContent={textContent}
    >
      <DashboardManageBookingsPage />
    </LocaleScopeProvider>
  );
};

export default DashboardManageBookings;
