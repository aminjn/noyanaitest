import OrgManageArticlePage from "@/Components/_Common/OrgArticle/OrgManageArticlePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ParaClinicArticleById = async () => {
  const textContent = await getScopedTextContent(["paraClinicPanelArticle"]);
  return (
    <LocaleScopeProvider
      namespaces={["paraClinicPanelArticle"]}
      initialTextContent={textContent}
    >
      <OrgManageArticlePage kind="paraClinic" />
    </LocaleScopeProvider>
  );
};

export default ParaClinicArticleById;
