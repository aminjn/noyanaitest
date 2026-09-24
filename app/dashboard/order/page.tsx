import DashboardManageOrdersPage from "@/Components/Dashboard/Order/DashboardManageOrdersPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = [
  "common",
  "dashboardOrder",
  "dashboardOrderStatusBadge",
];

const DashboardManageOrders = async () => {
  const textContent = await getScopedTextContent(NS);
  return (
    <LocaleScopeProvider
      namespaces={NS}
      initialTextContent={textContent}
    >
      <DashboardManageOrdersPage />
    </LocaleScopeProvider>
  );
};

export default DashboardManageOrders;
