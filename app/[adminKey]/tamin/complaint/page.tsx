import AdminManageTaminComplaintsPage from "@/Components/Admin/Tamin/TaminComplaint/AdminManageTaminComplaintPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageTaminComplaints = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageTaminComplaintsPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageTaminComplaints;
