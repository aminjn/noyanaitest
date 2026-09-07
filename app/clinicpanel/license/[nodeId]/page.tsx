import LicensePlanDetailPage from "@/Components/_Common/License/LicensePlanDetailPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ClinicLicenseDetail = async () => {
  const textContent = await getScopedTextContent(["common", "clinicPanelLicense"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "clinicPanelLicense"]}
      initialTextContent={textContent}
    >
      <LicensePlanDetailPage name="clinic" />
    </LocaleScopeProvider>
  );
};

export default ClinicLicenseDetail;
