import DashboardManageOrdersPage from "@/Components/Dashboard/Order/DashboardManageOrdersPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DashboardManageOrders = async () => {
  const textContent = await getScopedTextContent(["common", "dashboardOrder"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "dashboardOrder"]}
      initialTextContent={textContent}
    >
      <DashboardManageOrdersPage />
    </LocaleScopeProvider>
  );
};

export default DashboardManageOrders;
