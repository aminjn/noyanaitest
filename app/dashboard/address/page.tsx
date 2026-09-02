import DashboardManageAddressesPage from "@/Components/Dashboard/Address/DashboardManageAddressesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DashboardManageAddresses = async () => {
  const textContent = await getScopedTextContent([
    "common",
    "dashboardAddress",
  ]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "dashboardAddress"]}
      initialTextContent={textContent}
    >
      <DashboardManageAddressesPage />
    </LocaleScopeProvider>
  );
};

export default DashboardManageAddresses;
