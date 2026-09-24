import NewUserManageCallPage from "@/Components/Dashboard/Call/UserManageCallPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NAMESPACES: ContentNamespace[] = ["dashboardUserManageCall"];

const Call = async () => {
  const textContent = await getScopedTextContent(NAMESPACES);
  return (
    <LocaleScopeProvider
      namespaces={NAMESPACES}
      initialTextContent={textContent}
    >
      <NewUserManageCallPage />
    </LocaleScopeProvider>
  );
};

export default Call;
