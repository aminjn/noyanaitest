import AdminHubPage from "@/Components/Admin/Hub/AdminHubPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminTaxonomy = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminHubPage
        hub="taxonomy"
        intro="همه‌ی دسته‌بندی‌ها، تگ‌ها و داده‌های مرجع سایت در یک جا."
      />
    </LocaleScopeProvider>
  );
};

export default AdminTaxonomy;
