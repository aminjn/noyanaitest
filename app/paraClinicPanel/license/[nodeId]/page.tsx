import LicensePlanDetailPage from "@/Components/_Common/License/LicensePlanDetailPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ParaClinicLicenseDetail = async () => {
  const textContent = await getScopedTextContent(["paraClinicPanelLicense", "sharedLicense"]);
  return (
    <LocaleScopeProvider
      namespaces={["paraClinicPanelLicense", "sharedLicense"]}
      initialTextContent={textContent}
    >
      <LicensePlanDetailPage name="paraClinic" />
    </LocaleScopeProvider>
  );
};

export default ParaClinicLicenseDetail;
