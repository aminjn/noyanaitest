import BookingPage2 from "@/Components/Booking/BookingPage2";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { getPublicData } from "@/Components/helpers/getPublicData";
import type {
  BookingDescriptionSegment,
  IBookingDescription,
} from "@/Components/Admin/BookingDescription/AdminManageBookingDescriptionsPage";

// Groups the flat, order-sorted list the backend returns (see
// publicController.getBookingDescriptions) into one bucket per booking
// segment, preserving each item's relative order within its bucket.
const groupBookingDescriptionsBySegment = (
  items: IBookingDescription[] | undefined,
): Record<BookingDescriptionSegment, IBookingDescription[]> => {
  const grouped: Record<BookingDescriptionSegment, IBookingDescription[]> = {
    Doctor: [],
    Clinic: [],
    Pharmacy: [],
  };
  (items || []).forEach((item) => {
    grouped[item.segment]?.push(item);
  });
  return grouped;
};

const Booking = async () => {
  const textContent = await getScopedTextContent(["common", "booking"]);
  const bookingDescriptions = await getPublicData<{
    data: IBookingDescription[];
  }>("bookingDescription");
  const descriptions = groupBookingDescriptionsBySegment(
    bookingDescriptions?.data,
  );
  return (
    <LocaleScopeProvider
      namespaces={["common", "booking"]}
      initialTextContent={textContent}
    >
      <BookingPage2 descriptions={descriptions} />
    </LocaleScopeProvider>
  );
};

export default Booking;
