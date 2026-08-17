import DashboardManageBookingPage from "@/Components/Dashboard/Booking/DashboardManageBookingPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DashboardManageBooking = async () => {
  const textContent = await getScopedTextContent(["common", "dashboardBooking"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "dashboardBooking"]}
      initialTextContent={textContent}
    >
      <DashboardManageBookingPage />
    </LocaleScopeProvider>
  );
};

export default DashboardManageBooking;
