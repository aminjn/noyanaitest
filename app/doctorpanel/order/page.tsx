import DoctorIncomingOrdersPage from "@/Components/DoctorPanel/Order/DoctorIncomingOrdersPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorOrder = async () => {
  const textContent = await getScopedTextContent(["doctorPanelOrder", "dashboardOrderStatusBadge"]);
  return (
    <LocaleScopeProvider
      namespaces={["doctorPanelOrder", "dashboardOrderStatusBadge"]}
      initialTextContent={textContent}
    >
      <DoctorIncomingOrdersPage />
    </LocaleScopeProvider>
  );
};

export default DoctorOrder;
