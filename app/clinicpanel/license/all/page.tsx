import AllLicensePlansPage from "@/Components/_Common/License/AllLicensePlansPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ClinicAllLicenses = async () => {
  const textContent = await getScopedTextContent(["common", "clinicPanelLicense", "sharedLicense"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "clinicPanelLicense", "sharedLicense"]}
      initialTextContent={textContent}
    >
      <AllLicensePlansPage name="clinic" />
    </LocaleScopeProvider>
  );
};

export default ClinicAllLicenses;
