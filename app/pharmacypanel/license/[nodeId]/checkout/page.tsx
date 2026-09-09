import LicenseCheckoutPage from "@/Components/_Common/License/LicenseCheckoutPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const PharmacyLicenseCheckout = async () => {
  const textContent = await getScopedTextContent(["common", "pharmacyPanelLicense"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "pharmacyPanelLicense"]}
      initialTextContent={textContent}
    >
      <LicenseCheckoutPage name="pharmacy" />
    </LocaleScopeProvider>
  );
};

export default PharmacyLicenseCheckout;
