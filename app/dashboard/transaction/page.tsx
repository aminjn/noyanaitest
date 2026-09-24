import DashboardManageTransactionsPage from "@/Components/Dashboard/Transaction/DashboardManageTransactionsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DashboardManageTransactions = async () => {
  const textContent = await getScopedTextContent([
    "dashboardTransaction",
  ]);
  return (
    <LocaleScopeProvider
      namespaces={["dashboardTransaction"]}
      initialTextContent={textContent}
    >
      <DashboardManageTransactionsPage />
    </LocaleScopeProvider>
  );
};

export default DashboardManageTransactions;
