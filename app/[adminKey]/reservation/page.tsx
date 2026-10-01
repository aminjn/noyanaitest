import { Suspense } from "react";
import ReservationHub from "@/Components/Admin/Hub/ReservationHub";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

// the appointments list and the booking settings as tabs (ReservationHub)
const AdminManageReservations = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <Suspense>
        <ReservationHub />
      </Suspense>
    </LocaleScopeProvider>
  );
};

export default AdminManageReservations;
