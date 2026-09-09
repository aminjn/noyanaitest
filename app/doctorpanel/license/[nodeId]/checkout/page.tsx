import LicenseCheckoutPage from "@/Components/_Common/License/LicenseCheckoutPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorLicenseCheckout = async () => {
  const textContent = await getScopedTextContent([
    "common",
    "doctorPanelLicense",
  ]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "doctorPanelLicense"]}
      initialTextContent={textContent}
    >
      <LicenseCheckoutPage name="doctor" />
    </LocaleScopeProvider>
  );
};

export default DoctorLicenseCheckout;
