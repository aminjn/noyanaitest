import MyClubsPage from "@/Components/Dashboard/Crm/MyClubsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "bizCrm"];

const DashboardMyClubsPage = async () => {
  const textContent = await getScopedTextContent(NS);
  return (
    <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
      <MyClubsPage />
    </LocaleScopeProvider>
  );
};

export default DashboardMyClubsPage;
