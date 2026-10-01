import OrgManageArticlePage from "@/Components/_Common/OrgArticle/OrgManageArticlePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const InsuranceManageArticleById = async () => {
  const textContent = await getScopedTextContent(["insurancePanelArticle"]);
  return (
    <LocaleScopeProvider
      namespaces={["insurancePanelArticle"]}
      initialTextContent={textContent}
    >
      <OrgManageArticlePage kind="insurance" />
    </LocaleScopeProvider>
  );
};

export default InsuranceManageArticleById;
