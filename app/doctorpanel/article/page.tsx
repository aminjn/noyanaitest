import DotorManageArticlesClient from "@/Components/DoctorPanel/_Stub/DoctorManageArticlesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DotorManageArticles = async () => {
  const textContent = await getScopedTextContent(["common", "doctorPanelStub"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "doctorPanelStub"]}
      initialTextContent={textContent}
    >
      <DotorManageArticlesClient />
    </LocaleScopeProvider>
  );
};

export default DotorManageArticles;
