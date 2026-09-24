import LicensePlansPage from "@/Components/_Common/License/LicensePlansPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const InsuranceLicense = async () => {
  const textContent = await getScopedTextContent(["insurancePanelLicense", "sharedLicense"]);
  return (
    <LocaleScopeProvider
      namespaces={["insurancePanelLicense", "sharedLicense"]}
      initialTextContent={textContent}
    >
      <LicensePlansPage name="insurance" />
    </LocaleScopeProvider>
  );
};

export default InsuranceLicense;
