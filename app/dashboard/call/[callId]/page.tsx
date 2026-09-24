import NewCallScreenPage from "@/Components/Dashboard/NewCall/NewCallScreenPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

// NewCallScreenPage renders no localized text of its own; "common" covers
// shared chrome. (UserManageCallPage, the old call screen, is no longer
// rendered here; it declares its own dashboardUserManageCall namespace.)
const NS: ContentNamespace[] = ["common"];

const UserManageCall = async () => {
  const textContent = await getScopedTextContent(NS);
  return (
    <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
      <NewCallScreenPage />
    </LocaleScopeProvider>
  );
};

export default UserManageCall;
