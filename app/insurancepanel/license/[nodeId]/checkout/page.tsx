import LicenseCheckoutPage from "@/Components/_Common/License/LicenseCheckoutPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const InsuranceLicenseCheckout = async () => {
  const textContent = await getScopedTextContent(["insurancePanelLicense", "sharedLicense"]);
  return (
    <LocaleScopeProvider
      namespaces={["insurancePanelLicense", "sharedLicense"]}
      initialTextContent={textContent}
    >
      <LicenseCheckoutPage name="insurance" />
    </LocaleScopeProvider>
  );
};

export default InsuranceLicenseCheckout;
