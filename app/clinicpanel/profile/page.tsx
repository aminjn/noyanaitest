import ClinicManageProfilePage from "@/Components/ClinicPanel/Profile/ClinicManageProfilePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ClinicProfile = async () => {
  const textContent = await getScopedTextContent(["common", "clinicPanelProfile"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "clinicPanelProfile"]}
      initialTextContent={textContent}
    >
      <ClinicManageProfilePage />
    </LocaleScopeProvider>
  );
};

export default ClinicProfile;
