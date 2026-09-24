import AdminManageAboutPartnersPage from "@/Components/Admin/AboutPartner/AdminManageAboutPartnersPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageAboutPartners = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageAboutPartnersPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageAboutPartners;
