import AdminManageBookingDescriptionPage from "@/Components/Admin/BookingDescription/AdminManageBookingDescriptionPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageBookingDescription = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageBookingDescriptionPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageBookingDescription;
