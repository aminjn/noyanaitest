import BookingPage from "@/Components/Booking/BookingPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const Booking = async () => {
  const textContent = await getScopedTextContent([
    "common",
    "doctorsList",
    "bookingLegacyList",
  ]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "doctorsList", "bookingLegacyList"]}
      initialTextContent={textContent}
    >
      <BookingPage />
    </LocaleScopeProvider>
  );
};

export default Booking;
