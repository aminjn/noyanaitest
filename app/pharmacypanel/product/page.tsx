import PharmacyProductsPage from "@/Components/PharmacyPanel/Product/PharmacyProductsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const PharmacyProduct = async () => {
  const textContent = await getScopedTextContent(["common", "pharmacyPanelProduct"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "pharmacyPanelProduct"]}
      initialTextContent={textContent}
    >
      <PharmacyProductsPage />
    </LocaleScopeProvider>
  );
};

export default PharmacyProduct;
