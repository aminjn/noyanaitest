import InsuranceManageArticlePage from "@/Components/InsurancePanel/Article/InsuranceManageArticlePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const InsuranceManageArticleById = async () => {
  const textContent = await getScopedTextContent(["insurancePanelArticle"]);
  return (
    <LocaleScopeProvider
      namespaces={["insurancePanelArticle"]}
      initialTextContent={textContent}
    >
      <InsuranceManageArticlePage />
    </LocaleScopeProvider>
  );
};

export default InsuranceManageArticleById;
