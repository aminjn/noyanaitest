import LicensePlansPage from "@/Components/_Common/License/LicensePlansPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const HospitalLicense = async () => {
  const textContent = await getScopedTextContent(["common", "hospitalPanelLicense"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "hospitalPanelLicense"]}
      initialTextContent={textContent}
    >
      <LicensePlansPage name="hospital" />
    </LocaleScopeProvider>
  );
};

export default HospitalLicense;
