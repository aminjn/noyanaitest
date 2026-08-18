import ClinicManageArticlePage from "@/Components/ClinicPanel/Article/ClinicManageArticlePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ClinicManageArticleById = async () => {
  const textContent = await getScopedTextContent(["common", "clinicPanelArticle"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "clinicPanelArticle"]}
      initialTextContent={textContent}
    >
      <ClinicManageArticlePage />
    </LocaleScopeProvider>
  );
};

export default ClinicManageArticleById;
