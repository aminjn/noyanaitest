import InsuranceManageArticlePage from "@/Components/InsurancePanel/Article/InsuranceManageArticlePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const InsuranceManageArticleById = async () => {
  const textContent = await getScopedTextContent(["common", "insurancePanelArticle"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "insurancePanelArticle"]}
      initialTextContent={textContent}
    >
      <InsuranceManageArticlePage />
    </LocaleScopeProvider>
  );
};

export default InsuranceManageArticleById;
