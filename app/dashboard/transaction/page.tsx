import DashboardManageTransactionsPage from "@/Components/Dashboard/Transaction/DashboardManageTransactionsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DashboardManageTransactions = async () => {
  const textContent = await getScopedTextContent([
    "common",
    "dashboardTransaction",
  ]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "dashboardTransaction"]}
      initialTextContent={textContent}
    >
      <DashboardManageTransactionsPage />
    </LocaleScopeProvider>
  );
};

export default DashboardManageTransactions;
