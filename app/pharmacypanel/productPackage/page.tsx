import PharmacyManageProductPackagesPage from "@/Components/PharmacyPanel/ProductPackage/PharmacyManageProductPackagesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const PharmacyProductPackage = async () => {
  const textContent = await getScopedTextContent([
    "common",
    "pharmacyPanelProductPackage",
  ]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "pharmacyPanelProductPackage"]}
      initialTextContent={textContent}
    >
      <PharmacyManageProductPackagesPage />
    </LocaleScopeProvider>
  );
};

export default PharmacyProductPackage;
