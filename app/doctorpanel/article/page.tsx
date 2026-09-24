import DoctorManageArticlesPage from "@/Components/DoctorPanel/Article/DoctorManageArticlesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageArticles = async () => {
  const textContent = await getScopedTextContent(["doctorPanelArticle"]);
  return (
    <LocaleScopeProvider
      namespaces={["doctorPanelArticle"]}
      initialTextContent={textContent}
    >
      <DoctorManageArticlesPage />
    </LocaleScopeProvider>
  );
};

export default DoctorManageArticles;
