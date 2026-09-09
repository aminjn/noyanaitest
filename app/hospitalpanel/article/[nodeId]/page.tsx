import HospitalManageArticlePage from "@/Components/HospitalPanel/Article/HospitalManageArticlePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const HospitalManageArticleById = async () => {
  const textContent = await getScopedTextContent(["common", "hospitalPanelArticle"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "hospitalPanelArticle"]}
      initialTextContent={textContent}
    >
      <HospitalManageArticlePage />
    </LocaleScopeProvider>
  );
};

export default HospitalManageArticleById;
