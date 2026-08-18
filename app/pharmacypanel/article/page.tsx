import PharmacyManageArticlesPage from "@/Components/PharmacyPanel/Article/PharmacyManageArticlesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const PharmacyManageArticles = async () => {
  const textContent = await getScopedTextContent(["common", "pharmacyPanelArticle"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "pharmacyPanelArticle"]}
      initialTextContent={textContent}
    >
      <PharmacyManageArticlesPage />
    </LocaleScopeProvider>
  );
};

export default PharmacyManageArticles;
