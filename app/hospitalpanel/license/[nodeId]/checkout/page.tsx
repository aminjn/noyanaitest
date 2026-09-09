import LicenseCheckoutPage from "@/Components/_Common/License/LicenseCheckoutPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const HospitalLicenseCheckout = async () => {
  const textContent = await getScopedTextContent(["common", "hospitalPanelLicense"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "hospitalPanelLicense"]}
      initialTextContent={textContent}
    >
      <LicenseCheckoutPage name="hospital" />
    </LocaleScopeProvider>
  );
};

export default HospitalLicenseCheckout;
