import LicensePlanDetailPage from "@/Components/_Common/License/LicensePlanDetailPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const PharmacyLicenseDetail = async () => {
  const textContent = await getScopedTextContent(["common", "pharmacyPanelLicense"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "pharmacyPanelLicense"]}
      initialTextContent={textContent}
    >
      <LicensePlanDetailPage name="pharmacy" />
    </LocaleScopeProvider>
  );
};

export default PharmacyLicenseDetail;
