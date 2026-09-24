import DashboardManageAddressPage from "@/Components/Dashboard/Address/DashboardManageAddressPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DashboardManageAddress = async () => {
  const textContent = await getScopedTextContent([
    "dashboardAddress",
  ]);
  return (
    <LocaleScopeProvider
      namespaces={["dashboardAddress"]}
      initialTextContent={textContent}
    >
      <DashboardManageAddressPage />
    </LocaleScopeProvider>
  );
};

export default DashboardManageAddress;
