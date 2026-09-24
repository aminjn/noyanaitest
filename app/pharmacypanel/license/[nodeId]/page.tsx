import LicensePlanDetailPage from "@/Components/_Common/License/LicensePlanDetailPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const PharmacyLicenseDetail = async () => {
  const textContent = await getScopedTextContent(["pharmacyPanelLicense", "sharedLicense"]);
  return (
    <LocaleScopeProvider
      namespaces={["pharmacyPanelLicense", "sharedLicense"]}
      initialTextContent={textContent}
    >
      <LicensePlanDetailPage name="pharmacy" />
    </LocaleScopeProvider>
  );
};

export default PharmacyLicenseDetail;
