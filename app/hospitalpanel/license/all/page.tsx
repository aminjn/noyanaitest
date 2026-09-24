import AllLicensePlansPage from "@/Components/_Common/License/AllLicensePlansPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const HospitalAllLicenses = async () => {
  const textContent = await getScopedTextContent(["common", "hospitalPanelLicense", "sharedLicense"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "hospitalPanelLicense", "sharedLicense"]}
      initialTextContent={textContent}
    >
      <AllLicensePlansPage name="hospital" />
    </LocaleScopeProvider>
  );
};

export default HospitalAllLicenses;
