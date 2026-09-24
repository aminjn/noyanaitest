import InsuranceManageArticlesPage from "@/Components/InsurancePanel/Article/InsuranceManageArticlesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const InsuranceManageArticles = async () => {
  const textContent = await getScopedTextContent(["insurancePanelArticle"]);
  return (
    <LocaleScopeProvider
      namespaces={["insurancePanelArticle"]}
      initialTextContent={textContent}
    >
      <InsuranceManageArticlesPage />
    </LocaleScopeProvider>
  );
};

export default InsuranceManageArticles;
