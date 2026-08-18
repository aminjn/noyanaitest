import ClinicManageArticlesPage from "@/Components/ClinicPanel/Article/ClinicManageArticlesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ClinicManageArticles = async () => {
  const textContent = await getScopedTextContent(["common", "clinicPanelArticle"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "clinicPanelArticle"]}
      initialTextContent={textContent}
    >
      <ClinicManageArticlesPage />
    </LocaleScopeProvider>
  );
};

export default ClinicManageArticles;
