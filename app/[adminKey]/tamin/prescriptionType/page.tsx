import AdminManageTaminPrescriptionTypesPage from "@/Components/Admin/Tamin/PrescriptionType/AdminManageTaminPrescriptionTypesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageTaminPrescriptionTypes = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageTaminPrescriptionTypesPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageTaminPrescriptionTypes;
