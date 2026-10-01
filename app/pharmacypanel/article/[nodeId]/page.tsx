import OrgManageArticlePage from "@/Components/_Common/OrgArticle/OrgManageArticlePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const PharmacyManageArticleById = async () => {
  const textContent = await getScopedTextContent(["pharmacyPanelArticle"]);
  return (
    <LocaleScopeProvider
      namespaces={["pharmacyPanelArticle"]}
      initialTextContent={textContent}
    >
      <OrgManageArticlePage kind="pharmacy" />
    </LocaleScopeProvider>
  );
};

export default PharmacyManageArticleById;
