import DoctorIncomingOrderPage from "@/Components/DoctorPanel/Order/DoctorIncomingOrderPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorOrderDetail = async () => {
  const textContent = await getScopedTextContent(["common", "doctorPanelOrder", "dashboardOrderStatusBadge", "dashboardOrderItemStatusBadge"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "doctorPanelOrder", "dashboardOrderStatusBadge", "dashboardOrderItemStatusBadge"]}
      initialTextContent={textContent}
    >
      <DoctorIncomingOrderPage />
    </LocaleScopeProvider>
  );
};

export default DoctorOrderDetail;
