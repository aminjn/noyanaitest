import BookingPage2 from "@/Components/Booking/BookingPage2";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const Booking = async () => {
  const textContent = await getScopedTextContent(["common", "booking"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "booking"]}
      initialTextContent={textContent}
    >
      <BookingPage2 />
    </LocaleScopeProvider>
  );
};

export default Booking;
