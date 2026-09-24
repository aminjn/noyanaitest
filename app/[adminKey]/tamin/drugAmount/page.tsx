import AdminManageTaminDrugAmountsPage from "@/Components/Admin/Tamin/DrugAmount/AdminManageTaminDrugAmountsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageTaminDrugAmounts = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageTaminDrugAmountsPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageTaminDrugAmounts;
