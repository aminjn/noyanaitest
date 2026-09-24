import PharmacyPanelPage from "@/Components/PharmacyPanel/PharmacyPanelPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const PharmacyPanel = async () => {
  const textContent = await getScopedTextContent([
    "pharmacyPanelHome",
    "pharmacyPanelCurrentLicenseWidget",
  ]);
  return (
    <LocaleScopeProvider
      namespaces={[
        "pharmacyPanelHome",
        "pharmacyPanelCurrentLicenseWidget",
      ]}
      initialTextContent={textContent}
    >
      <PharmacyPanelPage />
    </LocaleScopeProvider>
  );
};

export default PharmacyPanel;
