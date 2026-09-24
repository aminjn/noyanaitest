import PharmacyIncomingOrderPage from "@/Components/PharmacyPanel/Order/PharmacyIncomingOrderPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const PharmacyOrderDetail = async () => {
  const textContent = await getScopedTextContent([
    "common",
    "pharmacyPanelOrder",
    "dashboardOrderStatusBadge",
    "dashboardOrderItemStatusBadge",
  ]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "pharmacyPanelOrder", "dashboardOrderStatusBadge", "dashboardOrderItemStatusBadge"]}
      initialTextContent={textContent}
    >
      <PharmacyIncomingOrderPage />
    </LocaleScopeProvider>
  );
};

export default PharmacyOrderDetail;
