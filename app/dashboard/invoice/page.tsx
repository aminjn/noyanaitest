import DashboardManageinvoicesPage from "@/Components/Dashboard/Invoice/DashboardManageInvoicesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DashboardManageInvoices = async () => {
  const textContent = await getScopedTextContent(["common", "dashboardInvoice"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "dashboardInvoice"]}
      initialTextContent={textContent}
    >
      <DashboardManageinvoicesPage />
    </LocaleScopeProvider>
  );
};

export default DashboardManageInvoices;
