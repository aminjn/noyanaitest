import AllLicensePlansPage from "@/Components/_Common/License/AllLicensePlansPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorAllLicenses = async () => {
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
      <AllLicensePlansPage name="doctor" />
    </LocaleScopeProvider>
  );
};

export default DoctorAllLicenses;
