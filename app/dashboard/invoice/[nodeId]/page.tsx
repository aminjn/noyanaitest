import DashboardManageInvoicePage from "@/Components/Dashboard/Invoice/DashboardManageInvoicePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DashboardManageInvoice = async () => {
  const textContent = await getScopedTextContent(["common", "dashboardInvoice"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "dashboardInvoice"]}
      initialTextContent={textContent}
    >
      <DashboardManageInvoicePage />
    </LocaleScopeProvider>
  );
};

export default DashboardManageInvoice;
