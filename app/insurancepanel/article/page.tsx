import OrgManageArticlesPage from "@/Components/_Common/OrgArticle/OrgManageArticlesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const InsuranceManageArticles = async () => {
  const textContent = await getScopedTextContent(["insurancePanelArticle"]);
  return (
    <LocaleScopeProvider
      namespaces={["insurancePanelArticle"]}
      initialTextContent={textContent}
    >
      <OrgManageArticlesPage kind="insurance" />
    </LocaleScopeProvider>
  );
};

export default InsuranceManageArticles;
