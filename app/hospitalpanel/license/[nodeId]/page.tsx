import LicensePlanDetailPage from "@/Components/_Common/License/LicensePlanDetailPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const HospitalLicenseDetail = async () => {
  const textContent = await getScopedTextContent(["hospitalPanelLicense", "sharedLicense"]);
  return (
    <LocaleScopeProvider
      namespaces={["hospitalPanelLicense", "sharedLicense"]}
      initialTextContent={textContent}
    >
      <LicensePlanDetailPage name="hospital" />
    </LocaleScopeProvider>
  );
};

export default HospitalLicenseDetail;
