import OrgManageArticlesPage from "@/Components/_Common/OrgArticle/OrgManageArticlesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ClinicManageArticles = async () => {
  const textContent = await getScopedTextContent(["clinicPanelArticle"]);
  return (
    <LocaleScopeProvider
      namespaces={["clinicPanelArticle"]}
      initialTextContent={textContent}
    >
      <OrgManageArticlesPage kind="clinic" />
    </LocaleScopeProvider>
  );
};

export default ClinicManageArticles;
