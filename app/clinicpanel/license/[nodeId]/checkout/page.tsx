import LicenseCheckoutPage from "@/Components/_Common/License/LicenseCheckoutPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ClinicLicenseCheckout = async () => {
  const textContent = await getScopedTextContent(["common", "clinicPanelLicense"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "clinicPanelLicense"]}
      initialTextContent={textContent}
    >
      <LicenseCheckoutPage name="clinic" />
    </LocaleScopeProvider>
  );
};

export default ClinicLicenseCheckout;
