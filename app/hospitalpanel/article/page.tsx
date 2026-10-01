import OrgManageArticlesPage from "@/Components/_Common/OrgArticle/OrgManageArticlesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const HospitalManageArticles = async () => {
  const textContent = await getScopedTextContent(["hospitalPanelArticle"]);
  return (
    <LocaleScopeProvider
      namespaces={["hospitalPanelArticle"]}
      initialTextContent={textContent}
    >
      <OrgManageArticlesPage kind="hospital" />
    </LocaleScopeProvider>
  );
};

export default HospitalManageArticles;
