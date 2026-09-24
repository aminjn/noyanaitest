import LicenseCheckoutPage from "@/Components/_Common/License/LicenseCheckoutPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const HospitalLicenseCheckout = async () => {
  const textContent = await getScopedTextContent(["common", "hospitalPanelLicense", "sharedLicense"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "hospitalPanelLicense", "sharedLicense"]}
      initialTextContent={textContent}
    >
      <LicenseCheckoutPage name="hospital" />
    </LocaleScopeProvider>
  );
};

export default HospitalLicenseCheckout;
