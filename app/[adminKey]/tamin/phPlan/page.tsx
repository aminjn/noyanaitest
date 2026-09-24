import AdminManageTaminPhPlansPage from "@/Components/Admin/Tamin/PhPlan/AdminManageTaminPhPlansPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageTaminPhPlans = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageTaminPhPlansPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageTaminPhPlans;
