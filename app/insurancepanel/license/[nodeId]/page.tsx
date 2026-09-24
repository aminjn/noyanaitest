import LicensePlanDetailPage from "@/Components/_Common/License/LicensePlanDetailPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const InsuranceLicenseDetail = async () => {
  const textContent = await getScopedTextContent(["insurancePanelLicense", "sharedLicense"]);
  return (
    <LocaleScopeProvider
      namespaces={["insurancePanelLicense", "sharedLicense"]}
      initialTextContent={textContent}
    >
      <LicensePlanDetailPage name="insurance" />
    </LocaleScopeProvider>
  );
};

export default InsuranceLicenseDetail;
