import ParaClinicIncomingOrdersPage from "@/Components/ParaClinicDashboard/Order/ParaClinicIncomingOrdersPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ParaClinicOrder = async () => {
  const textContent = await getScopedTextContent(["common", "paraClinicPanelOrder", "dashboardOrderStatusBadge"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "paraClinicPanelOrder", "dashboardOrderStatusBadge"]}
      initialTextContent={textContent}
    >
      <ParaClinicIncomingOrdersPage />
    </LocaleScopeProvider>
  );
};

export default ParaClinicOrder;
