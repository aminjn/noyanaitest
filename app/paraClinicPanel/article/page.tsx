import OrgManageArticlesPage from "@/Components/_Common/OrgArticle/OrgManageArticlesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ParaClinicArticle = async () => {
  const textContent = await getScopedTextContent(["paraClinicPanelArticle"]);
  return (
    <LocaleScopeProvider
      namespaces={["paraClinicPanelArticle"]}
      initialTextContent={textContent}
    >
      <OrgManageArticlesPage kind="paraClinic" />
    </LocaleScopeProvider>
  );
};

export default ParaClinicArticle;
