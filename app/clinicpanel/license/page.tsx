import ClinicManageLicencePage from "@/Components/ClinicPanel/License/ClinicManageLicencePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ClinicLicense = async () => {
  const textContent = await getScopedTextContent(["common", "clinicPanelLicense"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "clinicPanelLicense"]}
      initialTextContent={textContent}
    >
      <ClinicManageLicencePage />
    </LocaleScopeProvider>
  );
};

export default ClinicLicense;
