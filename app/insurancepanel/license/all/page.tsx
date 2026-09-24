import AllLicensePlansPage from "@/Components/_Common/License/AllLicensePlansPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const InsuranceAllLicenses = async () => {
  const textContent = await getScopedTextContent(["insurancePanelLicense", "sharedLicense"]);
  return (
    <LocaleScopeProvider
      namespaces={["insurancePanelLicense", "sharedLicense"]}
      initialTextContent={textContent}
    >
      <AllLicensePlansPage name="insurance" />
    </LocaleScopeProvider>
  );
};

export default InsuranceAllLicenses;
