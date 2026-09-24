import DashboardManageAddressesPage from "@/Components/Dashboard/Address/DashboardManageAddressesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = [
  "common",
  "dashboardAddress",
  "dashboardMutateAddressPopup",
];

const DashboardManageAddresses = async () => {
  const textContent = await getScopedTextContent(NS);
  return (
    <LocaleScopeProvider
      namespaces={NS}
      initialTextContent={textContent}
    >
      <DashboardManageAddressesPage />
    </LocaleScopeProvider>
  );
};

export default DashboardManageAddresses;
