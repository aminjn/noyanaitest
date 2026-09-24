import PharmacyManageProductPackagesPage from "@/Components/PharmacyPanel/ProductPackage/PharmacyManageProductPackagesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const PharmacyProductPackage = async () => {
  const textContent = await getScopedTextContent([
    "pharmacyPanelProductPackage",
  ]);
  return (
    <LocaleScopeProvider
      namespaces={["pharmacyPanelProductPackage"]}
      initialTextContent={textContent}
    >
      <PharmacyManageProductPackagesPage />
    </LocaleScopeProvider>
  );
};

export default PharmacyProductPackage;
