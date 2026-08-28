import PharmacyIncomingOrdersPage from "@/Components/PharmacyPanel/Order/PharmacyIncomingOrdersPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const PharmacyOrder = async () => {
  const textContent = await getScopedTextContent([
    "common",
    "pharmacyPanelOrder",
  ]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "pharmacyPanelOrder"]}
      initialTextContent={textContent}
    >
      <PharmacyIncomingOrdersPage />
    </LocaleScopeProvider>
  );
};

export default PharmacyOrder;
