import MyCentresPage from "@/Components/Dashboard/Crm/MyCentresPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "bizCrm"];

// one request to a centre and its answers
const DashboardCentreRequest = async ({ params }: { params: { id: string } }) => {
  const textContent = await getScopedTextContent(NS);
  return (
    <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
      <MyCentresPage id={params.id} />
    </LocaleScopeProvider>
  );
};

export default DashboardCentreRequest;
