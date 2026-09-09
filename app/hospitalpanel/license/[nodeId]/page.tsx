import LicensePlanDetailPage from "@/Components/_Common/License/LicensePlanDetailPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const HospitalLicenseDetail = async () => {
  const textContent = await getScopedTextContent(["common", "hospitalPanelLicense"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "hospitalPanelLicense"]}
      initialTextContent={textContent}
    >
      <LicensePlanDetailPage name="hospital" />
    </LocaleScopeProvider>
  );
};

export default HospitalLicenseDetail;
