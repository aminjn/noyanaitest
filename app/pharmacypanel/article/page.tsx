import OrgManageArticlesPage from "@/Components/_Common/OrgArticle/OrgManageArticlesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const PharmacyManageArticles = async () => {
  const textContent = await getScopedTextContent(["pharmacyPanelArticle"]);
  return (
    <LocaleScopeProvider
      namespaces={["pharmacyPanelArticle"]}
      initialTextContent={textContent}
    >
      <OrgManageArticlesPage kind="pharmacy" />
    </LocaleScopeProvider>
  );
};

export default PharmacyManageArticles;
