import PharmacyIncomingOrderPage from "@/Components/PharmacyPanel/Order/PharmacyIncomingOrderPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const PharmacyOrderDetail = async () => {
  const textContent = await getScopedTextContent([
    "pharmacyPanelOrder",
    "dashboardOrderStatusBadge",
    "dashboardOrderItemStatusBadge",
    "sellerOrderMoney",
  ]);
  return (
    <LocaleScopeProvider
      namespaces={["pharmacyPanelOrder", "dashboardOrderStatusBadge", "dashboardOrderItemStatusBadge", "sellerOrderMoney"]}
      initialTextContent={textContent}
    >
      <PharmacyIncomingOrderPage />
    </LocaleScopeProvider>
  );
};

export default PharmacyOrderDetail;
