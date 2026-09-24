import ParaClinicManageArticlesPage from "@/Components/ParaClinicDashboard/Article/ParaClinicManageArticlesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ParaClinicArticle = async () => {
  const textContent = await getScopedTextContent(["common", "paraClinicPanelArticle"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "paraClinicPanelArticle"]}
      initialTextContent={textContent}
    >
      <ParaClinicManageArticlesPage />
    </LocaleScopeProvider>
  );
};

export default ParaClinicArticle;
