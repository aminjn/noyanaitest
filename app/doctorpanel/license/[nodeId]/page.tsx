import LicensePlanDetailPage from "@/Components/_Common/License/LicensePlanDetailPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorLicenseDetail = async () => {
  const textContent = await getScopedTextContent([
    "doctorPanelLicense",
    "sharedLicense",
  ]);
  return (
    <LocaleScopeProvider
      namespaces={["doctorPanelLicense", "sharedLicense"]}
      initialTextContent={textContent}
    >
      <LicensePlanDetailPage name="doctor" />
    </LocaleScopeProvider>
  );
};

export default DoctorLicenseDetail;
