import LicenseCheckoutPage from "@/Components/_Common/License/LicenseCheckoutPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ParaClinicLicenseCheckout = async () => {
  const textContent = await getScopedTextContent(["common", "paraClinicPanelLicense", "sharedLicense"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "paraClinicPanelLicense", "sharedLicense"]}
      initialTextContent={textContent}
    >
      <LicenseCheckoutPage name="paraClinic" />
    </LocaleScopeProvider>
  );
};

export default ParaClinicLicenseCheckout;
