import DashboardManageBookingsPage from "@/Components/Dashboard/Booking/DashboardManageBookingsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DashboardManageBookings = async () => {
  const textContent = await getScopedTextContent(["common", "dashboardBooking"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "dashboardBooking"]}
      initialTextContent={textContent}
    >
      <DashboardManageBookingsPage />
    </LocaleScopeProvider>
  );
};

export default DashboardManageBookings;
