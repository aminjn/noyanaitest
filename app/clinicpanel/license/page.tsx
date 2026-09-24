import LicensePlansPage from "@/Components/_Common/License/LicensePlansPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ClinicLicense = async () => {
  const textContent = await getScopedTextContent(["clinicPanelLicense", "sharedLicense"]);
  return (
    <LocaleScopeProvider
      namespaces={["clinicPanelLicense", "sharedLicense"]}
      initialTextContent={textContent}
    >
      <LicensePlansPage name="clinic" />
    </LocaleScopeProvider>
  );
};

export default ClinicLicense;
