import AdminManageTaminDrugUsagesPage from "@/Components/Admin/Tamin/DrugUsage/AdminManageTaminDrugUsagesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "adminCommon"];

const AdminManageTaminDrugUsages = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageTaminDrugUsagesPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageTaminDrugUsages;
