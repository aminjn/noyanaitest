import ParaClinicIncomingOrderPage from "@/Components/ParaClinicDashboard/Order/ParaClinicIncomingOrderPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ParaClinicOrderDetail = async () => {
  const textContent = await getScopedTextContent(["paraClinicPanelOrder", "dashboardOrderStatusBadge", "dashboardOrderItemStatusBadge", "labSampling", "sellerOrderMoney", "orderReturns"]);
  return (
    <LocaleScopeProvider
      namespaces={["paraClinicPanelOrder", "dashboardOrderStatusBadge", "dashboardOrderItemStatusBadge", "labSampling", "sellerOrderMoney", "orderReturns"]}
      initialTextContent={textContent}
    >
      <ParaClinicIncomingOrderPage />
    </LocaleScopeProvider>
  );
};

export default ParaClinicOrderDetail;
