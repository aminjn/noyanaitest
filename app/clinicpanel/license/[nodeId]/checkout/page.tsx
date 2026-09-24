import LicenseCheckoutPage from "@/Components/_Common/License/LicenseCheckoutPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ClinicLicenseCheckout = async () => {
  const textContent = await getScopedTextContent(["clinicPanelLicense", "sharedLicense"]);
  return (
    <LocaleScopeProvider
      namespaces={["clinicPanelLicense", "sharedLicense"]}
      initialTextContent={textContent}
    >
      <LicenseCheckoutPage name="clinic" />
    </LocaleScopeProvider>
  );
};

export default ClinicLicenseCheckout;
