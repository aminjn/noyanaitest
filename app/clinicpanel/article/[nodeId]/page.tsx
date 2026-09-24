import ClinicManageArticlePage from "@/Components/ClinicPanel/Article/ClinicManageArticlePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ClinicManageArticleById = async () => {
  const textContent = await getScopedTextContent(["clinicPanelArticle"]);
  return (
    <LocaleScopeProvider
      namespaces={["clinicPanelArticle"]}
      initialTextContent={textContent}
    >
      <ClinicManageArticlePage />
    </LocaleScopeProvider>
  );
};

export default ClinicManageArticleById;
