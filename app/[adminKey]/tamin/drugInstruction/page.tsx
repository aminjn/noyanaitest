import AdminManageTaminDrugInstructionsPage from "@/Components/Admin/Tamin/DrugInstructions/AdminManageTaminDrugInstructionsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageTaminDrugInstructions = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageTaminDrugInstructionsPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageTaminDrugInstructions;
