import PharmacyProductsPage from "@/Components/PharmacyPanel/Product/PharmacyProductsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const PharmacyProduct = async () => {
  const textContent = await getScopedTextContent(["pharmacyPanelProduct"]);
  return (
    <LocaleScopeProvider
      namespaces={["pharmacyPanelProduct"]}
      initialTextContent={textContent}
    >
      <PharmacyProductsPage />
    </LocaleScopeProvider>
  );
};

export default PharmacyProduct;
