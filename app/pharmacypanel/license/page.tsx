import LicensePlansPage from "@/Components/_Common/License/LicensePlansPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const PharmacyLicense = async () => {
  const textContent = await getScopedTextContent(["pharmacyPanelLicense", "sharedLicense"]);
  return (
    <LocaleScopeProvider
      namespaces={["pharmacyPanelLicense", "sharedLicense"]}
      initialTextContent={textContent}
    >
      <LicensePlansPage name="pharmacy" />
    </LocaleScopeProvider>
  );
};

export default PharmacyLicense;
