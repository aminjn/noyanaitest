import LicensePlansPage from "@/Components/_Common/License/LicensePlansPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ParaClinicLicense = async () => {
  const textContent = await getScopedTextContent(["paraClinicPanelLicense", "sharedLicense"]);
  return (
    <LocaleScopeProvider
      namespaces={["paraClinicPanelLicense", "sharedLicense"]}
      initialTextContent={textContent}
    >
      <LicensePlansPage name="paraClinic" />
    </LocaleScopeProvider>
  );
};

export default ParaClinicLicense;
