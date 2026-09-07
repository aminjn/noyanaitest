import AllLicensePlansPage from "@/Components/_Common/License/AllLicensePlansPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const PharmacyAllLicenses = async () => {
  const textContent = await getScopedTextContent(["common", "pharmacyPanelLicense"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "pharmacyPanelLicense"]}
      initialTextContent={textContent}
    >
      <AllLicensePlansPage name="pharmacy" />
    </LocaleScopeProvider>
  );
};

export default PharmacyAllLicenses;
