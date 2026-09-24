import AdminManageBookingDescriptionsPage from "@/Components/Admin/BookingDescription/AdminManageBookingDescriptionsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "adminCommon"];

const AdminManageBookingDescriptions = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageBookingDescriptionsPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageBookingDescriptions;
