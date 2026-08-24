import DoctorManageBookingPage from "@/Components/DoctorPanel/Booking/DoctorManageBookingPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageBooking = async () => {
  const textContent = await getScopedTextContent([
    "common",
    "doctorPanelBooking",
  ]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "doctorPanelBooking"]}
      initialTextContent={textContent}
    >
      <DoctorManageBookingPage />
    </LocaleScopeProvider>
  );
};

export default DoctorManageBooking;
