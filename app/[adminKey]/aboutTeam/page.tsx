import AdminManageAboutTeamsPage from "@/Components/Admin/AboutTeam/AdminManageAboutTeamsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "adminCommon"];

const AdminManageAboutTeams = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminManageAboutTeamsPage />
    </LocaleScopeProvider>
  );
};

export default AdminManageAboutTeams;
