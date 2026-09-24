import AllLicensePlansPage from "@/Components/_Common/License/AllLicensePlansPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ParaClinicAllLicenses = async () => {
  const textContent = await getScopedTextContent(["paraClinicPanelLicense", "sharedLicense"]);
  return (
    <LocaleScopeProvider
      namespaces={["paraClinicPanelLicense", "sharedLicense"]}
      initialTextContent={textContent}
    >
      <AllLicensePlansPage name="paraClinic" />
    </LocaleScopeProvider>
  );
};

export default ParaClinicAllLicenses;
