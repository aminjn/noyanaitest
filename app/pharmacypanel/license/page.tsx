import PharmacyManageLicencePage from "@/Components/PharmacyPanel/License/PharmacyManageLicencePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const PharmacyLicense = async () => {
  const textContent = await getScopedTextContent(["common", "pharmacyPanelLicense"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "pharmacyPanelLicense"]}
      initialTextContent={textContent}
    >
      <PharmacyManageLicencePage />
    </LocaleScopeProvider>
  );
};

export default PharmacyLicense;
