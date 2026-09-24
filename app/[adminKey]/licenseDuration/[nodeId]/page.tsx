import AdminManageLicenseDurationPage from "@/Components/Admin/LicenseDuration/AdminManageLicenseDurationPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageLicenseDuration = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageLicenseDurationPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageLicenseDuration;
