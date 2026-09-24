import ParaClinicManageArticlesPage from "@/Components/ParaClinicDashboard/Article/ParaClinicManageArticlesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ParaClinicArticle = async () => {
  const textContent = await getScopedTextContent(["paraClinicPanelArticle"]);
  return (
    <LocaleScopeProvider
      namespaces={["paraClinicPanelArticle"]}
      initialTextContent={textContent}
    >
      <ParaClinicManageArticlesPage />
    </LocaleScopeProvider>
  );
};

export default ParaClinicArticle;
