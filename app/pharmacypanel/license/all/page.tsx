import AllLicensePlansPage from "@/Components/_Common/License/AllLicensePlansPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const PharmacyAllLicenses = async () => {
  const textContent = await getScopedTextContent(["pharmacyPanelLicense", "sharedLicense"]);
  return (
    <LocaleScopeProvider
      namespaces={["pharmacyPanelLicense", "sharedLicense"]}
      initialTextContent={textContent}
    >
      <AllLicensePlansPage name="pharmacy" />
    </LocaleScopeProvider>
  );
};

export default PharmacyAllLicenses;
