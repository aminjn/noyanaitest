import LicenseCheckoutPage from "@/Components/_Common/License/LicenseCheckoutPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ParaClinicLicenseCheckout = async () => {
  const textContent = await getScopedTextContent(["paraClinicPanelLicense", "sharedLicense"]);
  return (
    <LocaleScopeProvider
      namespaces={["paraClinicPanelLicense", "sharedLicense"]}
      initialTextContent={textContent}
    >
      <LicenseCheckoutPage name="paraClinic" />
    </LocaleScopeProvider>
  );
};

export default ParaClinicLicenseCheckout;
