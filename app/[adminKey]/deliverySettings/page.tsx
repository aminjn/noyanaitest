import AdminDeliverySettingsPage from "@/Components/Admin/Delivery/AdminDeliverySettingsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminDeliverySettings = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminDeliverySettingsPage />
    </LocaleScopeProvider>
  );
};

export default AdminDeliverySettings;
