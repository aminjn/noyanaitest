import ParaClinicManageArticlePage from "@/Components/ParaClinicDashboard/Article/ParaClinicManageArticlePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ParaClinicArticleById = async () => {
  const textContent = await getScopedTextContent(["paraClinicPanelArticle"]);
  return (
    <LocaleScopeProvider
      namespaces={["paraClinicPanelArticle"]}
      initialTextContent={textContent}
    >
      <ParaClinicManageArticlePage />
    </LocaleScopeProvider>
  );
};

export default ParaClinicArticleById;
