import PharmacyManageArticlePage from "@/Components/PharmacyPanel/Article/PharmacyManageArticlePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const PharmacyManageArticleById = async () => {
  const textContent = await getScopedTextContent(["pharmacyPanelArticle"]);
  return (
    <LocaleScopeProvider
      namespaces={["pharmacyPanelArticle"]}
      initialTextContent={textContent}
    >
      <PharmacyManageArticlePage />
    </LocaleScopeProvider>
  );
};

export default PharmacyManageArticleById;
