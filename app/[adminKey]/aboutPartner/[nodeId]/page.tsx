import AdminManageAboutPartnerPage from "@/Components/Admin/AboutPartner/AdminManageAboutPartnerPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageAboutPartner = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageAboutPartnerPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageAboutPartner;
