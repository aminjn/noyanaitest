import DoctorManageArticlePage from "@/Components/DoctorPanel/Article/DoctorManageArticlePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageArticleById = async () => {
  const textContent = await getScopedTextContent(["common", "doctorPanelArticle"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "doctorPanelArticle"]}
      initialTextContent={textContent}
    >
      <DoctorManageArticlePage />
    </LocaleScopeProvider>
  );
};

export default DoctorManageArticleById;
