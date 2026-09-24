import LicensePlansPage from "@/Components/_Common/License/LicensePlansPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageLicence = async () => {
  const textContent = await getScopedTextContent([
    "common",
    "doctorPanelLicense",
    "sharedLicense",
  ]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "doctorPanelLicense", "sharedLicense"]}
      initialTextContent={textContent}
    >
      <LicensePlansPage name="doctor" />
    </LocaleScopeProvider>
  );
};

export default DoctorManageLicence;
