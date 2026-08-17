import FinalizeBookingPage from "@/Components/Booking/Finalize/FinalizeBookingPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const FinalizeBooking = async () => {
  const textContent = await getScopedTextContent(["common", "bookingFinalize"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "bookingFinalize"]}
      initialTextContent={textContent}
    >
      <FinalizeBookingPage />
    </LocaleScopeProvider>
  );
};

export default FinalizeBooking;
