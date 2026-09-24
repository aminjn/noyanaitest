import FinalizeBookingPage from "@/Components/Booking/Finalize/FinalizeBookingPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = [
  "common",
  "bookingFinalize",
  "bookingSessionSelectorPopup",
  "doctorPanelShiftUtils",
  "drBookingSidebar",
  "drSelectClinicFirstPopup",
];

const FinalizeBooking = async () => {
  const textContent = await getScopedTextContent(NS);
  return (
    <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
      <FinalizeBookingPage />
    </LocaleScopeProvider>
  );
};

export default FinalizeBooking;
