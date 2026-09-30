import DiseaseHub from "@/Components/Admin/Hub/DiseaseHub";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { Suspense } from "react";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminDiseaseHubPage = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <Suspense>
        <DiseaseHub />
      </Suspense>
    </LocaleScopeProvider>
  );
};

export default AdminDiseaseHubPage;
