import HospitalManageArticlesPage from "@/Components/HospitalPanel/Article/HospitalManageArticlesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const HospitalManageArticles = async () => {
  const textContent = await getScopedTextContent(["hospitalPanelArticle"]);
  return (
    <LocaleScopeProvider
      namespaces={["hospitalPanelArticle"]}
      initialTextContent={textContent}
    >
      <HospitalManageArticlesPage />
    </LocaleScopeProvider>
  );
};

export default HospitalManageArticles;
