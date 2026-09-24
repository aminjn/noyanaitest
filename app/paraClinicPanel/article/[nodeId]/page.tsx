import ParaClinicManageArticlePage from "@/Components/ParaClinicDashboard/Article/ParaClinicManageArticlePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ParaClinicArticleById = async () => {
  const textContent = await getScopedTextContent(["common", "paraClinicPanelArticle"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "paraClinicPanelArticle"]}
      initialTextContent={textContent}
    >
      <ParaClinicManageArticlePage />
    </LocaleScopeProvider>
  );
};

export default ParaClinicArticleById;
