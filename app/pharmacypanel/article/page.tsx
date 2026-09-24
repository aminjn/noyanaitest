import PharmacyManageArticlesPage from "@/Components/PharmacyPanel/Article/PharmacyManageArticlesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const PharmacyManageArticles = async () => {
  const textContent = await getScopedTextContent(["pharmacyPanelArticle"]);
  return (
    <LocaleScopeProvider
      namespaces={["pharmacyPanelArticle"]}
      initialTextContent={textContent}
    >
      <PharmacyManageArticlesPage />
    </LocaleScopeProvider>
  );
};

export default PharmacyManageArticles;
