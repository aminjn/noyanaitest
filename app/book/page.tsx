import BookingPage2 from "@/Components/Booking/BookingPage2";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { getPublicData } from "@/Components/helpers/getPublicData";
import type {
  BookingDescriptionSegment,
  IBookingDescription,
} from "@/Components/Admin/BookingDescription/AdminManageBookingDescriptionsPage";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = [
  "booking",
  "bookingSessionSelectorPopup",
  "doctorPanelShiftUtils",
];

export const generateMetadata = () => getListPageMetadata("/book");

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
  const [textContent, bookingDescriptions, webSchema] = await Promise.all([
    getScopedTextContent(NS),
    getPublicData<{ data: IBookingDescription[] }>("bookingDescription"),
    getListPageWebSchema("/book"),
  ]);
  const descriptions = groupBookingDescriptionsBySegment(
    bookingDescriptions?.data,
  );
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider
        namespaces={NS}
        initialTextContent={textContent}
      >
        <BookingPage2 descriptions={descriptions} />
      </LocaleScopeProvider>
    </>
  );
};

export default Booking;
