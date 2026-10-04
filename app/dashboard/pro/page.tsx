import ProDashboardPage from "@/Components/Pro/ProDashboardPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS = ["common", "sharedLicense", "onlinePayment", "pro"] as ContentNamespace[];

// The member's «پرو» page: status, today's AI allowance, buy / renew
const DashboardPro = async () => {
  const textContent = await getScopedTextContent(NS);
  return (
    <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
      <ProDashboardPage />
    </LocaleScopeProvider>
  );
};

export default DashboardPro;
