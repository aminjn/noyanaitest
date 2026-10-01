import OrgManageArticlePage from "@/Components/_Common/OrgArticle/OrgManageArticlePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ClinicManageArticleById = async () => {
  const textContent = await getScopedTextContent(["clinicPanelArticle"]);
  return (
    <LocaleScopeProvider
      namespaces={["clinicPanelArticle"]}
      initialTextContent={textContent}
    >
      <OrgManageArticlePage kind="clinic" />
    </LocaleScopeProvider>
  );
};

export default ClinicManageArticleById;
