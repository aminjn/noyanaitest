import MyCentresPage from "@/Components/Dashboard/Crm/MyCentresPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "bizCrm"];

const DashboardMyCentresPage = async () => {
  const textContent = await getScopedTextContent(NS);
  return (
    <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
      <MyCentresPage />
    </LocaleScopeProvider>
  );
};

export default DashboardMyCentresPage;
