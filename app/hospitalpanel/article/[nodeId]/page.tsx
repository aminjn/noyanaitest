import OrgManageArticlePage from "@/Components/_Common/OrgArticle/OrgManageArticlePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const HospitalManageArticleById = async () => {
  const textContent = await getScopedTextContent(["hospitalPanelArticle"]);
  return (
    <LocaleScopeProvider
      namespaces={["hospitalPanelArticle"]}
      initialTextContent={textContent}
    >
      <OrgManageArticlePage kind="hospital" />
    </LocaleScopeProvider>
  );
};

export default HospitalManageArticleById;
